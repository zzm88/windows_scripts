// Auto-browsing and post interaction functions
window.browse = {
  currentPostIndex: -1,
  isAutoBrowsing: false,
  autoBrowseCount: 0,
  browseSpeed: 1,
  MAX_POSTS_BEFORE_SCROLL: 5,
  SELECTED_CLASS: 'post-selected',

  // Function to focus on next post
  focusNextPost() {
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

    // Increment index or reset to 0 if at end
    if (this.currentPostIndex === undefined || this.currentPostIndex >= posts.length - 1) {
      this.currentPostIndex = 0;
    } else {
      this.currentPostIndex++;
    }

    // Add selection to new post
    const currentPost = posts[this.currentPostIndex];
    if (currentPost) {
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
      }
    }
  },

  // Helper function to simulate typing
  async simulateTyping(element, text) {
    // First, focus the element
    element.focus();
    window.utils.simulateKeyboardEvent(element, 'keydown');
    await window.utils.randomDelay(500, 800);

    // Clear existing content
    element.textContent = '';
    
    // Split text into individual characters (works for both Chinese and English)
    const characters = Array.from(text);
    
    // Type each character with random delay
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      
      // Simulate keydown
      window.utils.simulateKeyboardEvent(element, 'keydown', char);
      
      // Different delays for different types of characters
      if (/[\u4e00-\u9fa5]/.test(char)) {  // Chinese character
        await window.utils.randomDelay(400, 800);  // Longer delay for Chinese characters
      } else if (['。', '，', '！', '？', '、', '.', ',', '!', '?', '\n'].includes(char)) {
        await window.utils.randomDelay(800, 1200);  // Even longer pause at punctuation and line breaks
      } else {  // English characters or other symbols
        await window.utils.randomDelay(200, 400);
      }
      
      // Add the character
      element.textContent += char;
      
      // Simulate keyup
      window.utils.simulateKeyboardEvent(element, 'keyup', char);
      
      // Trigger input event
      element.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Occasional longer pause to simulate thinking
      if (Math.random() < 0.1) {  // 10% chance
        await window.utils.randomDelay(1000, 2000);
      }
    }

    // Final input event
    element.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Add a natural pause after finishing typing
    await window.utils.randomDelay(3000, 5000);
  },

  // Function to auto-reply to current post
  async autoReply(responseText) {
    try {
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
      console.log('Step 4: Typing response...');
      await this.simulateTyping(textarea, responseText);
      await window.utils.randomDelay(500, 1000);

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
      
      // Simulate mouse events on submit button
      submitButton.dispatchEvent(new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      await window.utils.randomDelay(100, 200);
      
      submitButton.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      await window.utils.randomDelay(50, 100);
      
      submitButton.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      await window.utils.randomDelay(50, 100);
      
      submitButton.click();

      return true;
    } catch (error) {
      console.error('Auto-reply error:', error);
      throw error;
    }
  },

  // Function to check if we should reply based on frequency
  shouldReplyBasedOnFrequency(frequency) {
    const randomValue = Math.random();
    return randomValue < parseFloat(frequency);
  },

  // Function to auto-browse posts
  async browsePost() {
    try {
      // Click the post
      await this.clickCurrentPost();
      await window.utils.randomDelay(4500, 6000);  // Longer initial wait

      // Find the note scroller
      const scroller = document.querySelector('.note-scroller');
      if (scroller) {
        const scrollAmount = Math.floor(scroller.scrollHeight * (0.5 + Math.random() * 0.5));
        await window.utils.simulateScroll(scroller, scrollAmount, 4500 / this.browseSpeed);  // Slower scrolling
        await window.utils.randomDelay(3000, 4500);  // Longer pause after scrolling
      }

      // Check if auto-reply is enabled
      const toggleAutoReply = document.getElementById('toggleAutoReply');
      const replyFrequency = document.getElementById('replyFrequency');
      
      let replyInProgress = false;
      
      if (toggleAutoReply && toggleAutoReply.checked) {
        // Check if we should reply based on frequency
        if (this.shouldReplyBasedOnFrequency(replyFrequency.value)) {
          try {
            replyInProgress = true;
            console.log('Attempting reply based on frequency:', replyFrequency.value);
            const comments = window.ui.extractComments();
            if (comments.length > 0) {
              const config = window.api.loadConfig();
              
              // First get the API response
              console.log('Getting API response...');
              const response = await window.api.callApi(
                config.apiAddress,
                '', // API key is handled inside callApi
                config.prompt1,
                config.prompt2,
                comments
              );

              // Wait a bit before starting to reply
              await window.utils.randomDelay(2000, 3000);

              // Then do the reply
              console.log('Starting auto reply...');
              await this.autoReply(response);

              // Add extra delay after successful reply
              console.log('Reply completed, waiting extra time to ensure completion...');
              await window.utils.randomDelay(3000, 5000);  // Natural pause after reply
            }
          } catch (error) {
            console.error('Auto-reply during browsing failed:', error);
            // Add extra delay if reply fails to ensure UI is back to normal
            await window.utils.randomDelay(3000, 4500);
          } finally {
            replyInProgress = false;
          }
        } else {
          console.log('Skipping reply based on frequency:', replyFrequency.value);
        }
      }

      // Only proceed with closing if reply is not in progress
      if (!replyInProgress) {
        // Find and click close button
        const closeButton = document.querySelector('.close-circle');
        if (closeButton) {
          closeButton.click();
          await window.utils.randomDelay(3000, 4500); // Longer wait for post to close
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
      }
    } catch (error) {
      console.error('Error during auto-browsing:', error);
      this.isAutoBrowsing = false;
      const autoBrowseBtn = document.getElementById('autoBrowseBtn');
      if (autoBrowseBtn) {
        autoBrowseBtn.textContent = '开始自动评论';
        autoBrowseBtn.style.backgroundColor = '#9c27b0';
      }
    }
  }
}; 