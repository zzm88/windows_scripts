// Auto-browsing and post interaction functions
window.browse = {
  currentPostIndex: -1,
  isAutoBrowsing: false,
  autoBrowseCount: 0,
  browseSpeed: 1,
  MAX_POSTS_BEFORE_SCROLL: 5,
  SELECTED_CLASS: 'post-selected',
  isPostOpen: false,  // Track if a post is currently open
  isFirstFocus: true,  // Allow first focus without restrictions
  currentPostElement: null, // Track the current post element
  isTyping: false, // Add new flag to track typing status
  replyInProgress: false,  // Set lock at start

  // Function to focus on next post
  focusNextPost() {
    // If a post is open and this isn't the first focus, prevent moving to next post
    if (!this.isFirstFocus && this.isPostOpen) {
      console.log('Preventing post skip - waiting for current post to be closed');
      return;
    }

    // After first focus, mark it as done
    this.isFirstFocus = false;

    // Remove selection from current post
    const currentSelected = document.querySelector('.' + this.SELECTED_CLASS);
    if (currentSelected) {
      currentSelected.classList.remove(this.SELECTED_CLASS);
    }

    // Get all posts
    const posts = document.querySelectorAll('.note-item, .feed-item, [data-testid="note-item"]');
    
    // If no posts found, return
    if (!posts || posts.length === 0) {
      console.log('No posts found on page');
      return;
    }

    // Check if auto-reply is enabled
    const toggleAutoReply = document.getElementById('toggleAutoReply');
    const isAutoReplyEnabled = toggleAutoReply && toggleAutoReply.checked;

    // Find next unprocessed post
    let foundUnprocessedPost = false;
    let startIndex = this.currentPostIndex;
    let loopCount = 0;

    while (!foundUnprocessedPost && loopCount < posts.length) {
      // Increment index or reset to 0 if at end
      if (startIndex >= posts.length - 1) {
        startIndex = 0;
      } else {
        startIndex++;
      }

      const post = posts[startIndex];
      const postId = this.getPostId(post);

      // If auto-reply is enabled, skip already replied posts
      if (isAutoReplyEnabled && postId && this.hasRepliedToPost(postId)) {
        console.log('Skipping already replied post:', postId);
        loopCount++;
        continue;
      }

      // Found a post we haven't replied to
      foundUnprocessedPost = true;
      this.currentPostIndex = startIndex;
      break;
    }

    // If we've checked all posts and found none to process, reset to first post
    if (!foundUnprocessedPost) {
      console.log('No unprocessed posts found, starting from beginning');
      this.currentPostIndex = 0;
    }

    // Add selection to new post
    const currentPost = posts[this.currentPostIndex];
    if (currentPost) {
      this.currentPostElement = currentPost; // Store reference to current post element
      const coverElement = currentPost.querySelector('.cover') || currentPost;
      coverElement.classList.add(this.SELECTED_CLASS);
      coverElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  // Function to click current post
  clickCurrentPost() {
    const posts = document.querySelectorAll('.note-item');
    if (this.currentPostIndex >= 0 && posts[this.currentPostIndex]) {
      const currentPost = posts[this.currentPostIndex].querySelector('.cover');
      if (currentPost) {
        currentPost.click();
        this.isPostOpen = true; // Mark post as open when clicked
      }
    }
  },

  async simulateTyping(element, text) {
    try {
      this.isTyping = true; // Set typing flag at start
      // Constants for typing speed (all times in milliseconds)
      const CHAR_PER_MINUTE = 1000;
      const MS_PER_MINUTE = 60 * 1000;
      const BASE_CHAR_DELAY = MS_PER_MINUTE / CHAR_PER_MINUTE;
      
      const PUNCTUATION_DELAY = 2000;
      const SENTENCE_END_DELAY = 3000;
      const THINKING_DELAY = 5000;
      
      element.focus();
      window.utils.simulateKeyboardEvent(element, 'keydown');
      await window.utils.randomDelay(2000, 3000, true);

      element.textContent = '';
      
      const characters = Array.from(text);
      
      const isEndOfSentence = (char) => ['。', '！', '？', '.', '!', '?'].includes(char);
      const isPunctuation = (char) => ['。', '，', '！', '？', '、', '.', ',', '!', '?'].includes(char);
      
      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        
        if (Math.random() < 0.1) {
          await window.utils.randomDelay(THINKING_DELAY, THINKING_DELAY + 2000, true);
        }
        
        window.utils.simulateKeyboardEvent(element, 'keydown', char);
        element.textContent += char;
        window.utils.simulateKeyboardEvent(element, 'keyup', char);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        let delay = BASE_CHAR_DELAY;
        delay += BASE_CHAR_DELAY * (Math.random() * 0.2 - 0.1);
        
        if (isPunctuation(char)) {
          delay += PUNCTUATION_DELAY;
        }
        if (isEndOfSentence(char)) {
          delay += SENTENCE_END_DELAY;
        }
        
        await window.utils.randomDelay(delay, delay + 200, true);
      }

      element.dispatchEvent(new Event('input', { bubbles: true }));
      await window.utils.randomDelay(5000, 7000, true);
      return true;
    } catch (error) {
      console.error('Error during typing:', error);
      throw error;
    } finally {
      this.isTyping = false; // Reset typing flag when done
    }
  },

  // Add new function to simulate escape key
  simulateEscapeKey() {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true
    }));
    
    document.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true
    }));
  },

  // Function to auto-reply to current post
  async autoReply(responseText) {
    this.replyInProgress = true;
    try {
      // Remove any existing close button event listeners
      const closeButton = document.querySelector('.close-circle');
      if (closeButton) {
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
      }

      // Step 1: Find and click the initial comment input area
      console.log('Step 1: Finding initial comment area...');
      const initialCommentArea = document.querySelector('div.inner');
      if (!initialCommentArea) {
        throw new Error('Initial comment area not found');
      }
      console.log('Clicking initial comment area...');
      initialCommentArea.click();
      await window.utils.randomDelay(800, 1200);

      // Step 2: Wait for textarea to appear and be visible
      console.log('Step 2: Waiting for textarea...');
      const textarea = await window.utils.waitForElement('#content-textarea');
      console.log('Textarea found:', textarea);
      await window.utils.randomDelay(500, 800);

      // Step 3: Click and focus the textarea
      console.log('Step 3: Focusing textarea...');
      textarea.click();
      await window.utils.randomDelay(300, 500);
      textarea.focus();
      await window.utils.randomDelay(300, 500);

      // Step 4: Simulate typing
      console.log('Step 4: Starting typing...');
      this.isTyping = true;  // Set typing flag
      await this.simulateTyping(textarea, responseText);
      
      // Verify typing completion
      if (textarea.textContent !== responseText) {
        throw new Error('Typing verification failed');
      }
      console.log('Typing completed successfully');
      this.isTyping = false;  // Reset typing flag
      await window.utils.randomDelay(1000, 1500);

      // Step 5: Find and prepare submit button
      console.log('Step 5: Preparing submit button...');
      const submitButton = await window.utils.waitForElement('button.btn.submit');
      if (!submitButton) {
        throw new Error('Submit button not found');
      }

      // Step 6: Enable and click submit button
      console.log('Step 6: Submitting response...');
      submitButton.removeAttribute('disabled');
      await window.utils.randomDelay(500, 800);
      
      submitButton.click();

      // Step 7: Wait for submission confirmation
      console.log('Step 7: Waiting for submission confirmation...');
      let submissionSuccess = false;
      await new Promise((resolve, reject) => {
        let checkCount = 0;
        const maxChecks = 40;
        const checkInterval = setInterval(async () => {
          checkCount++;
          const currentSubmitBtn = document.querySelector('button.btn.submit');
          const successIndicator = document.querySelector('.success-message, .comment-success');
          const errorIndicator = document.querySelector('.error-message, .comment-error');
          
          if (successIndicator || (!currentSubmitBtn && checkCount > 4)) {
            clearInterval(checkInterval);
            submissionSuccess = true;
            await window.utils.randomDelay(2000, 3000);
            resolve(true);
          }
          else if (errorIndicator) {
            clearInterval(checkInterval);
            reject(new Error('Submission failed - error message found'));
          }
          else if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            reject(new Error('Submission timeout - no confirmation received'));
          }
        }, 500);
      });

      if (submissionSuccess) {
        console.log('Reply submitted successfully, closing post...');
        await window.utils.randomDelay(1000, 2000);
        
        // Try multiple methods to close the post
        const closeButton = document.querySelector('.close-circle');
        if (closeButton) {
          closeButton.click();
          await window.utils.randomDelay(500, 1000);
        }
        
        // Simulate escape key press as backup
        this.simulateEscapeKey();
        await window.utils.randomDelay(500, 1000);
        
        // Double check if post is still open and try one more time
        const stillOpenCloseButton = document.querySelector('.close-circle');
        if (stillOpenCloseButton) {
          this.simulateEscapeKey();
        }
        
        this.isPostOpen = false;
        await window.utils.randomDelay(1000, 2000);
      }

      return submissionSuccess;
    } catch (error) {
      console.error('Auto-reply error:', error);
      throw error;
    } finally {
      this.replyInProgress = false;
      this.isTyping = false;
    }
  },

  // Function to check if we should reply based on frequency
  shouldReplyBasedOnFrequency(frequency) {
    const randomValue = Math.random();
    return randomValue < parseFloat(frequency);
  },

  // Function to check if post has been replied to
  hasRepliedToPost(postId) {
    const repliedPosts = JSON.parse(localStorage.getItem('xhs_replied_posts') || '[]');
    return repliedPosts.includes(postId);
  },

  // Function to mark post as replied
  markPostAsReplied(postId) {
    const repliedPosts = JSON.parse(localStorage.getItem('xhs_replied_posts') || '[]');
    if (!repliedPosts.includes(postId)) {
      repliedPosts.push(postId);
      localStorage.setItem('xhs_replied_posts', JSON.stringify(repliedPosts));
    }
  },

  // Function to get post ID from element
  getPostId(postElement) {
    if (!postElement) return null;
    const postLink = postElement.querySelector('a[href*="/explore/"]');
    if (!postLink) return null;
    return postLink.href.match(/\/explore\/([^?]+)/)?.[1];
  },

  // Function to check if comments contain ignored keywords
  hasIgnoredKeywords(comments) {
    const ignoreKeywordsInput = document.getElementById('ignoreKeywords');
    if (!ignoreKeywordsInput || !ignoreKeywordsInput.value.trim()) return false;
    
    const keywords = ignoreKeywordsInput.value.split(',').map(k => k.trim().toLowerCase());
    const commentsText = comments.join(' ').toLowerCase();
    
    return keywords.some(keyword => commentsText.includes(keyword));
  },

  // Function to auto-browse posts
  async browsePost() {
    try {
      // Only close post if not in middle of reply process
      if (this.isPostOpen && !this.replyInProgress && !this.isTyping) {
        console.log('Found open post, attempting to close it first...');
        const closeButton = document.querySelector('.close-circle');
        if (closeButton) {
          closeButton.click();
          await window.utils.randomDelay(1000, 1500);
        }
        this.isPostOpen = false;
      }

      // Check if we've already replied to this post before doing anything else
      const postId = this.getPostId(this.currentPostElement);
      if (!postId) {
        console.log('Could not find post ID, moving to next post');
        this.focusNextPost();
        if (this.isAutoBrowsing) {
          await window.utils.randomDelay(1000, 1500);
          await this.browsePost();
        }
        return;
      }

      // Check if auto-reply is enabled and if we should reply based on frequency
      const toggleAutoReply = document.getElementById('toggleAutoReply');
      const replyFrequency = document.getElementById('replyFrequency');
      const shouldAutoReply = toggleAutoReply && toggleAutoReply.checked && 
                            this.shouldReplyBasedOnFrequency(replyFrequency.value);

      // Click the post
      await this.clickCurrentPost();
      await window.utils.randomDelay(4500, 6000);  // Longer initial wait

      // Extract comments and check for ignored keywords
      const comments = window.ui.extractComments();
      if (this.hasIgnoredKeywords(comments)) {
        console.log('Found ignored keywords in comments, skipping post');
        // Close the post
        const closeButton = document.querySelector('.close-circle');
        if (closeButton) {
          closeButton.click();
          this.isPostOpen = false;
          await window.utils.randomDelay(1000, 1500);
        }
        // Move to next post
        this.focusNextPost();
        if (this.isAutoBrowsing) {
          await window.utils.randomDelay(1000, 1500);
          await this.browsePost();
        }
        return;
      }

      // Find the note scroller
      const scroller = document.querySelector('.note-scroller');
      if (scroller) {
        const scrollAmount = Math.floor(scroller.scrollHeight * (0.5 + Math.random() * 0.5));
        await window.utils.simulateScroll(scroller, scrollAmount, 4500 / this.browseSpeed);  // Slower scrolling
        await window.utils.randomDelay(3000, 4500);  // Longer pause after scrolling
      }

      let replySuccessful = false;
      
      if (shouldAutoReply) {
        try {
          console.log('Attempting reply to post:', postId);
          const comments = window.ui.extractComments();
          if (comments.length > 0) {
            if (this.hasIgnoredKeywords(comments)) {
              console.log('Found ignored keywords in comments, skipping post');
              // Simulate escape key to close post
              this.simulateEscapeKey();
              await window.utils.randomDelay(1000, 1500);
            } else {
              const config = window.api.loadConfig();
              
              console.log('Getting API response...');
              const response = await window.api.callApi(
                config.apiAddress,
                '',
                config.prompt1,
                config.prompt2,
                comments
              );

              await window.utils.randomDelay(2000, 3000);

              console.log('Starting auto reply...');
              replySuccessful = await this.autoReply(response);
              
              if (replySuccessful) {
                this.markPostAsReplied(postId);
                console.log('Reply completed successfully');
              } else {
                // If reply wasn't successful, try to close post
                this.simulateEscapeKey();
                await window.utils.randomDelay(1000, 1500);
              }
            }
          }
        } catch (error) {
          console.error('Auto-reply during browsing failed:', error);
          // Try to close post on error
          this.simulateEscapeKey();
          await window.utils.randomDelay(1000, 1500);
        }
      }

      // Final check to ensure post is closed
      if (this.isPostOpen) {
        this.simulateEscapeKey();
        await window.utils.randomDelay(1000, 1500);
        this.isPostOpen = false;
      }

      // Move to next post
      this.focusNextPost();
      this.autoBrowseCount++;

      // Check if we need to scroll the main feed
      if (this.autoBrowseCount % this.MAX_POSTS_BEFORE_SCROLL === 0) {
        const mainContainer = document.getElementById('mfContainer');
        if (mainContainer) {
          console.log('Scrolling main feed to load more posts...');
          await window.utils.simulateScroll(mainContainer, mainContainer.scrollHeight, 6000 / this.browseSpeed);  // Slower main feed scroll
          await window.utils.randomDelay(4500, 6000); // Longer wait for new posts to load
        }
      }

      // Continue browsing if auto-browse is still active
      if (this.isAutoBrowsing) {
        await window.utils.randomDelay(3000, 4500); // Longer wait between posts
        await this.browsePost();
      }
    } catch (error) {
      console.error('Error during auto-browsing:', error);
      this.simulateEscapeKey(); // Try to close post on error
      // Reset all states on error
      this.isPostOpen = false;
      this.currentPostElement = null;
      this.isAutoBrowsing = false;
      
      // Try to close any open post
      const closeButton = document.querySelector('.close-circle');
      if (closeButton) {
        closeButton.click();
        await window.utils.randomDelay(1000, 1500);
      }
      
      // Update UI
      const autoBrowseBtn = document.getElementById('autoBrowseBtn');
      if (autoBrowseBtn) {
        autoBrowseBtn.textContent = '开始自动评论';
        autoBrowseBtn.style.backgroundColor = '#9c27b0';
      }
      
      // Move to next post to try to recover
      this.focusNextPost();
    }
  }
}; 