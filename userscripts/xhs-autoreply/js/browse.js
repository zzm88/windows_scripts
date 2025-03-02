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

    // Get all posts with more specific selectors
    const posts = document.querySelectorAll('.note-item, .feed-item, [data-testid="note-item"], .explore-feed-item');
    
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
    let skippedPosts = 0;

    // Log the total number of posts found
    console.log(`Found ${posts.length} total posts on page`);

    while (!foundUnprocessedPost && loopCount < posts.length) {
      // Increment index or reset to 0 if at end
      if (startIndex >= posts.length - 1) {
        startIndex = 0;
      } else {
        startIndex++;
      }

      const post = posts[startIndex];
      const postId = this.getPostId(post);

      // Skip posts without valid IDs
      if (!postId) {
        console.log('Skipping post with no ID');
        loopCount++;
        continue;
      }

      // If auto-reply is enabled, skip already replied posts
      if (isAutoReplyEnabled && this.hasRepliedToPost(postId)) {
        console.log('Skipping already replied post:', postId);
        skippedPosts++;
        loopCount++;
        continue;
      }

      // Found a post we haven't replied to
      foundUnprocessedPost = true;
      this.currentPostIndex = startIndex;
      console.log(`Selected post with ID: ${postId} (index: ${startIndex})`);
      break;
    }

    // Log how many posts were skipped
    if (skippedPosts > 0) {
      console.log(`Skipped ${skippedPosts} already replied posts`);
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
      
      // Log the selected post ID for debugging
      const selectedPostId = this.getPostId(currentPost);
      console.log(`Focused on post with ID: ${selectedPostId}`);
    }
  },

  // Function to click current post
  clickCurrentPost() {
    const posts = document.querySelectorAll('.note-item');
    if (this.currentPostIndex >= 0 && posts[this.currentPostIndex]) {
      window.ui.updateStatusMessage('正在打开帖子...', 'processing');
      const currentPost = posts[this.currentPostIndex].querySelector('.cover');
      if (currentPost) {
        currentPost.click();
        this.isPostOpen = true; // Mark post as open when clicked
        window.ui.updateStatusMessage('帖子已打开', 'success');
      } else {
        window.ui.updateStatusMessage('无法找到帖子封面', 'error');
      }
    } else {
      window.ui.updateStatusMessage('无法找到当前帖子', 'error');
    }
  },

  async simulateTyping(element, text) {
    try {
      this.isTyping = true; // Set typing flag at start
      window.ui.updateStatusMessage('准备输入评论...', 'processing');
      
      // Constants for typing speed (all times in milliseconds)
      // Increase typing speed by adjusting these constants
      const CHAR_PER_MINUTE = 2000; // Increased from 1000 to 2000 chars per minute
      const MS_PER_MINUTE = 60 * 1000;
      const BASE_CHAR_DELAY = MS_PER_MINUTE / CHAR_PER_MINUTE;
      
      // Reduce delays for more natural but faster typing
      const PUNCTUATION_DELAY = 1000; // Reduced from 2000
      const SENTENCE_END_DELAY = 1500; // Reduced from 3000
      const THINKING_DELAY = 2000; // Reduced from 5000
      
      element.focus();
      window.utils.simulateKeyboardEvent(element, 'keydown');
      await window.utils.randomDelay(1000, 1500, true); // Reduced initial delay

      element.textContent = '';
      
      const characters = Array.from(text);
      const totalChars = characters.length;
      let charsTyped = 0;
      
      const isEndOfSentence = (char) => ['。', '！', '？', '.', '!', '?'].includes(char);
      const isPunctuation = (char) => ['。', '，', '！', '？', '、', '.', ',', '!', '?'].includes(char);
      
      // Reduce random thinking pauses frequency
      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        charsTyped++;
        
        // Update status message every 10 characters or at the end
        if (charsTyped % 10 === 0 || charsTyped === totalChars) {
          const percent = Math.floor((charsTyped / totalChars) * 100);
          window.ui.updateStatusMessage(`正在输入评论... ${percent}%`, 'processing');
        }
        
        // Reduce frequency of random pauses from 10% to 5%
        if (Math.random() < 0.05) {
          await window.utils.randomDelay(THINKING_DELAY, THINKING_DELAY + 1000, true);
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
        
        await window.utils.randomDelay(delay, delay + 100, true); // Reduced upper bound
      }

      // Ensure text is fully entered and dispatch input event
      element.textContent = text; // Ensure the full text is set
      element.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Add a final delay to ensure the text is fully processed before returning
      window.ui.updateStatusMessage('评论输入完成，准备提交...', 'success');
      await window.utils.randomDelay(2000, 3000, true); // Reduced from 5000-7000
      return true;
    } catch (error) {
      console.error('Error during typing:', error);
      window.ui.updateStatusMessage(`输入评论出错: ${error.message}`, 'error');
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
      window.ui.updateStatusMessage('开始自动回复流程...', 'processing');
      
      // Remove any existing close button event listeners
      const closeButton = document.querySelector('.close-circle');
      if (closeButton) {
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
      }

      // Step 1: Find and click the initial comment input area
      console.log('Step 1: Finding initial comment area...');
      window.ui.updateStatusMessage('步骤1: 查找评论区...', 'processing');
      const initialCommentArea = document.querySelector('div.inner');
      if (!initialCommentArea) {
        window.ui.updateStatusMessage('找不到评论区域', 'error');
        throw new Error('Initial comment area not found');
      }
      console.log('Clicking initial comment area...');
      initialCommentArea.click();
      await window.utils.randomDelay(800, 1200);

      // Step 2: Wait for textarea to appear and be visible
      console.log('Step 2: Waiting for textarea...');
      window.ui.updateStatusMessage('步骤2: 等待文本框出现...', 'processing');
      const textarea = await window.utils.waitForElement('#content-textarea');
      console.log('Textarea found:', textarea);
      await window.utils.randomDelay(500, 800);

      // Step 3: Click and focus the textarea
      console.log('Step 3: Focusing textarea...');
      window.ui.updateStatusMessage('步骤3: 聚焦文本框...', 'processing');
      textarea.click();
      await window.utils.randomDelay(300, 500);
      textarea.focus();
      await window.utils.randomDelay(300, 500);

      // Step 4: Simulate typing
      console.log('Step 4: Starting typing...');
      window.ui.updateStatusMessage('步骤4: 开始输入评论...', 'processing');
      this.isTyping = true;  // Set typing flag
      await this.simulateTyping(textarea, responseText);
      
      // Verify typing completion with retry mechanism
      let typingVerified = false;
      let verificationAttempts = 0;
      const maxVerificationAttempts = 3;
      
      window.ui.updateStatusMessage('验证评论内容...', 'processing');
      while (!typingVerified && verificationAttempts < maxVerificationAttempts) {
        verificationAttempts++;
        console.log(`Verifying typing completion (attempt ${verificationAttempts})...`);
        
        if (textarea.textContent === responseText) {
          typingVerified = true;
          console.log('Typing verification successful');
        } else {
          console.log('Typing verification failed, retrying...');
          window.ui.updateStatusMessage(`验证失败，重试 (${verificationAttempts}/${maxVerificationAttempts})...`, 'warning');
          // Try to fix the text content directly
          textarea.textContent = responseText;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          await window.utils.randomDelay(1000, 1500);
        }
      }
      
      if (!typingVerified) {
        window.ui.updateStatusMessage('评论内容验证失败', 'error');
        throw new Error('Failed to verify typing completion after multiple attempts');
      }
      
      console.log('Typing completed successfully');
      this.isTyping = false;  // Reset typing flag
      await window.utils.randomDelay(1000, 1500);

      // Step 5: Find and prepare submit button
      console.log('Step 5: Preparing submit button...');
      window.ui.updateStatusMessage('步骤5: 准备提交评论...', 'processing');
      const submitButton = await window.utils.waitForElement('button.btn.submit');
      if (!submitButton) {
        window.ui.updateStatusMessage('找不到提交按钮', 'error');
        throw new Error('Submit button not found');
      }

      // Check if button is disabled and wait for it to be enabled
      if (submitButton.hasAttribute('disabled')) {
        console.log('Submit button is disabled, waiting for it to be enabled...');
        window.ui.updateStatusMessage('等待提交按钮启用...', 'processing');
        await new Promise((resolve) => {
          let checkCount = 0;
          const maxChecks = 10;
          const checkInterval = setInterval(() => {
            checkCount++;
            if (!submitButton.hasAttribute('disabled')) {
              clearInterval(checkInterval);
              resolve();
            } else if (checkCount >= maxChecks) {
              clearInterval(checkInterval);
              console.log('Forcing button to be enabled...');
              window.ui.updateStatusMessage('强制启用提交按钮...', 'warning');
              submitButton.removeAttribute('disabled');
              resolve();
            }
          }, 500);
        });
      }

      // Step 6: Enable and click submit button
      console.log('Step 6: Submitting response...');
      window.ui.updateStatusMessage('步骤6: 提交评论...', 'processing');
      submitButton.removeAttribute('disabled');
      await window.utils.randomDelay(800, 1200);
      
      submitButton.click();

      // Step 7: Wait for submission confirmation
      console.log('Step 7: Waiting for submission confirmation...');
      window.ui.updateStatusMessage('步骤7: 等待提交确认...', 'processing');
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
            window.ui.updateStatusMessage('评论提交成功！', 'success');
            await window.utils.randomDelay(2000, 3000);
            resolve(true);
          }
          else if (errorIndicator) {
            clearInterval(checkInterval);
            window.ui.updateStatusMessage('评论提交失败', 'error');
            reject(new Error('Submission failed - error message found'));
          }
          else if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            window.ui.updateStatusMessage('评论提交超时', 'error');
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
    if (!postId) {
      return false;
    }
    
    try {
      const repliedPosts = JSON.parse(localStorage.getItem('xhs_replied_posts') || '[]');
      const hasReplied = repliedPosts.includes(postId);
      
      // Log for debugging
      if (hasReplied) {
        console.log(`Post ${postId} has already been replied to`);
      }
      
      return hasReplied;
    } catch (error) {
      console.error('Error checking if post has been replied to:', error);
      return false;
    }
  },

  // Function to mark post as replied
  markPostAsReplied(postId) {
    if (!postId) {
      console.error('Attempted to mark null postId as replied');
      return;
    }
    
    try {
      // Get current replied posts from localStorage
      const repliedPosts = JSON.parse(localStorage.getItem('xhs_replied_posts') || '[]');
      
      // Check if this post is already in the list
      if (!repliedPosts.includes(postId)) {
        // Add the new post ID
        repliedPosts.push(postId);
        
        // Limit the size of the replied posts array to prevent localStorage from growing too large
        // Keep only the most recent 1000 posts
        const MAX_REPLIED_POSTS = 1000;
        if (repliedPosts.length > MAX_REPLIED_POSTS) {
          repliedPosts.splice(0, repliedPosts.length - MAX_REPLIED_POSTS);
        }
        
        // Save back to localStorage
        localStorage.setItem('xhs_replied_posts', JSON.stringify(repliedPosts));
        console.log(`Marked post ${postId} as replied (total: ${repliedPosts.length})`);
      } else {
        console.log(`Post ${postId} was already marked as replied`);
      }
    } catch (error) {
      console.error('Error marking post as replied:', error);
    }
  },

  // Function to get post ID from element
  getPostId(postElement) {
    if (!postElement) return null;
    
    // Try multiple methods to extract post ID
    
    // Method 1: Try to get from href attribute
    const postLink = postElement.querySelector('a[href*="/explore/"]');
    if (postLink && postLink.href) {
      const match = postLink.href.match(/\/explore\/([^?/]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Method 2: Try to get from data attributes
    const dataId = postElement.getAttribute('data-id') || 
                  postElement.getAttribute('data-note-id') ||
                  postElement.getAttribute('data-testid');
    if (dataId) {
      return dataId;
    }
    
    // Method 3: Try to get from any link with ID pattern
    const anyLink = postElement.querySelector('a[href*="/explore/"]');
    if (anyLink && anyLink.href) {
      // More aggressive regex to find any ID-like pattern
      const idMatch = anyLink.href.match(/\/([a-zA-Z0-9_-]{5,})/);
      if (idMatch && idMatch[1]) {
        return idMatch[1];
      }
    }
    
    // Method 4: Use element's unique attributes as fallback
    if (postElement.id) {
      return postElement.id;
    }
    
    // Method 5: Last resort - create a unique ID based on content
    const postContent = postElement.textContent.trim();
    if (postContent) {
      // Create a simple hash from the first 50 chars of content
      const contentSample = postContent.substring(0, 50);
      return 'content_' + contentSample.replace(/\s+/g, '_').substring(0, 20);
    }
    
    return null;
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
      window.ui.updateStatusMessage('开始浏览帖子...', 'processing');
      
      // Only close post if not in middle of reply process
      if (this.isPostOpen && !this.replyInProgress && !this.isTyping) {
        console.log('Found open post, attempting to close it first...');
        window.ui.updateStatusMessage('关闭已打开的帖子...', 'processing');
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
        window.ui.updateStatusMessage('无法获取帖子ID，跳到下一篇', 'warning');
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
      window.ui.updateStatusMessage('打开帖子...', 'processing');
      await this.clickCurrentPost();
      await window.utils.randomDelay(4500, 6000);  // Longer initial wait

      // Extract comments and check for ignored keywords
      window.ui.updateStatusMessage('提取评论内容...', 'processing');
      const comments = window.ui.extractComments();
      if (this.hasIgnoredKeywords(comments)) {
        console.log('Found ignored keywords in comments, skipping post');
        window.ui.updateStatusMessage('发现忽略关键词，跳过帖子', 'warning');
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
      window.ui.updateStatusMessage('浏览帖子内容...', 'processing');
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
          window.ui.updateStatusMessage('准备回复帖子...', 'processing');
          const comments = window.ui.extractComments();
          if (comments.length > 0) {
            if (this.hasIgnoredKeywords(comments)) {
              console.log('Found ignored keywords in comments, skipping post');
              window.ui.updateStatusMessage('发现忽略关键词，跳过回复', 'warning');
              // Simulate escape key to close post
              this.simulateEscapeKey();
              await window.utils.randomDelay(1000, 1500);
            } else {
              const config = window.api.loadConfig();
              
              console.log('Getting API response...');
              window.ui.updateStatusMessage('正在生成回复内容...', 'processing');
              const response = await window.api.callApi(
                config.apiAddress,
                '',
                config.prompt1,
                config.prompt2,
                comments
              );

              await window.utils.randomDelay(2000, 3000);

              console.log('Starting auto reply...');
              window.ui.updateStatusMessage('开始自动回复...', 'processing');
              replySuccessful = await this.autoReply(response);
              
              if (replySuccessful) {
                this.markPostAsReplied(postId);
                console.log('Reply completed successfully');
                window.ui.updateStatusMessage('回复成功完成', 'success');
              } else {
                // If reply wasn't successful, try to close post
                window.ui.updateStatusMessage('回复未成功，关闭帖子', 'warning');
                this.simulateEscapeKey();
                await window.utils.randomDelay(1000, 1500);
              }
            }
          }
        } catch (error) {
          console.error('Auto-reply during browsing failed:', error);
          window.ui.updateStatusMessage(`自动回复失败: ${error.message}`, 'error');
          // Try to close post on error
          this.simulateEscapeKey();
          await window.utils.randomDelay(1000, 1500);
        }
      }

      // Final check to ensure post is closed
      if (this.isPostOpen) {
        window.ui.updateStatusMessage('关闭帖子...', 'processing');
        this.simulateEscapeKey();
        await window.utils.randomDelay(1000, 1500);
        this.isPostOpen = false;
      }

      // Move to next post
      window.ui.updateStatusMessage('移动到下一篇帖子...', 'processing');
      this.focusNextPost();
      this.autoBrowseCount++;

      // Check if we need to scroll the main feed
      if (this.autoBrowseCount % this.MAX_POSTS_BEFORE_SCROLL === 0) {
        const mainContainer = document.getElementById('mfContainer');
        if (mainContainer) {
          console.log('Scrolling main feed to load more posts...');
          window.ui.updateStatusMessage('滚动加载更多帖子...', 'processing');
          await window.utils.simulateScroll(mainContainer, mainContainer.scrollHeight, 6000 / this.browseSpeed);  // Slower main feed scroll
          await window.utils.randomDelay(4500, 6000); // Longer wait for new posts to load
        }
      }

      // Continue browsing if auto-browse is still active
      if (this.isAutoBrowsing) {
        window.ui.updateStatusMessage('准备浏览下一篇帖子...', 'info');
        await window.utils.randomDelay(3000, 4500); // Longer wait between posts
        await this.browsePost();
      } else {
        window.ui.updateStatusMessage('浏览完成', 'success');
      }
    } catch (error) {
      console.error('Error during auto-browsing:', error);
      window.ui.updateStatusMessage(`浏览出错: ${error.message}`, 'error');
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