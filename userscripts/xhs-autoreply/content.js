// Add login state management
let isLoggedIn = false;
let userId = null;
let subscriptionInfo = null;
let currentComments = [];

// Function to handle login
async function handleLogin(username, password) {
  try {
    const response = await fetch('https://45.38.143.67/api/subscriptions/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      // Check subscription status
      if (!data.subscription || !data.subscription.is_active) {
        return { 
          success: false, 
          message: 'Your subscription is not active. Please renew your subscription.' 
        };
      }

      isLoggedIn = true;
      userId = data.user_id;
      subscriptionInfo = data.subscription;
      
      // Save all login info including subscription
      localStorage.setItem('xhs_login_state', JSON.stringify({
        isLoggedIn: true,
        userId: data.user_id,
        username: data.username,
        subscription: data.subscription
      }));
      
      return { 
        success: true, 
        message: data.message,
        subscription: data.subscription
      };
    } else {
      return { success: false, message: data.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error occurred' };
  }
}

// Function to check login state
async function checkLoginState() {
  const loginState = localStorage.getItem('xhs_login_state');
  if (loginState) {
    const state = JSON.parse(loginState);
    
    // Check if we need to verify subscription
    if (needsSubscriptionCheck()) {
      console.log('Performing daily subscription check...');
      const checkResult = await checkSubscription(state.username);
      
      if (!checkResult.success || !checkResult.subscription.is_active) {
        handleLogout();
        return false;
      }
    }
    
    isLoggedIn = state.isLoggedIn;
    userId = state.userId;
    subscriptionInfo = state.subscription;
    
    // Check if subscription is still active
    if (!subscriptionInfo || !subscriptionInfo.is_active) {
      handleLogout();
      return false;
    }
    
    // Check if subscription has expired
    const endDate = new Date(subscriptionInfo.end_date);
    if (endDate < new Date()) {
      handleLogout();
      return false;
    }
  }
  return isLoggedIn;
}

// Function to create login UI
function createLoginUI() {
  const loginContainer = document.createElement('div');
  loginContainer.id = 'xhs-login-container';
  loginContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 9999;
    width: 300px;
    font-family: Arial, sans-serif;
  `;

  loginContainer.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: #333;">Login Required</h3>
    <div style="margin-bottom: 15px;">
      <input type="text" id="login-username" placeholder="Username" style="
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
      ">
      <input type="password" id="login-password" placeholder="Password" style="
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
      ">
      <button id="login-button" style="
        width: 100%;
        background-color: #ff2442;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 4px;
        cursor: pointer;
      ">Login</button>
    </div>
    <div id="login-message" style="
      color: #666;
      font-size: 14px;
      text-align: center;
      margin-bottom: 10px;
    "></div>
    <div id="subscription-info" style="
      display: none;
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      font-size: 12px;
    "></div>
  `;

  document.body.appendChild(loginContainer);

  // Add login button handler
  document.getElementById('login-button').addEventListener('click', async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
      document.getElementById('login-message').textContent = 'Please enter both username and password';
      return;
    }

    const loginButton = document.getElementById('login-button');
    const loginMessage = document.getElementById('login-message');
    const subscriptionInfo = document.getElementById('subscription-info');
    
    loginButton.textContent = 'Logging in...';
    loginButton.disabled = true;

    const result = await handleLogin(username, password);
    
    if (result.success) {
      if (result.subscription) {
        subscriptionInfo.style.display = 'block';
        subscriptionInfo.innerHTML = `
          <div style="color: #4CAF50; margin-bottom: 5px;">✓ Subscription Active</div>
          <div>Days Remaining: ${result.subscription.days_remaining}</div>
          <div>Expires: ${new Date(result.subscription.end_date).toLocaleDateString()}</div>
        `;
        // Wait 2 seconds to show subscription info before proceeding
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      loginContainer.remove();
      createExtensionUI();
    } else {
      loginMessage.textContent = result.message;
      loginButton.textContent = 'Login';
      loginButton.disabled = false;
    }
  });
}

// Load saved configuration from storage
function loadConfig() {
  const config = {
    apiProvider: localStorage.getItem('xhs_api_provider') || 'deepseek',
    apiAddress: localStorage.getItem('xhs_api_address') || 'https://api.deepseek.com/chat/completions',
    deepseekApiKey: localStorage.getItem('xhs_deepseek_api_key') || 'sk-91b44bc0e0d445b49757738c7e8acf3a',
    geminiApiKey: localStorage.getItem('xhs_gemini_api_key') || '',
    prompt1: localStorage.getItem('xhs_prompt1') || '',
    prompt2: localStorage.getItem('xhs_prompt2') || '',
    autoReplyEnabled: localStorage.getItem('xhs_auto_reply_enabled') === 'true',
    replyFrequency: localStorage.getItem('xhs_reply_frequency') || '1.0'
  };
  return config;
}

// Save configuration to storage
function saveConfig(config) {
  localStorage.setItem('xhs_api_provider', config.apiProvider);
  localStorage.setItem('xhs_api_address', config.apiAddress);
  localStorage.setItem('xhs_deepseek_api_key', config.deepseekApiKey);
  localStorage.setItem('xhs_gemini_api_key', config.geminiApiKey);
  localStorage.setItem('xhs_prompt1', config.prompt1);
  localStorage.setItem('xhs_prompt2', config.prompt2);
  localStorage.setItem('xhs_auto_reply_enabled', config.autoReplyEnabled);
  localStorage.setItem('xhs_reply_frequency', config.replyFrequency);
}

// Remove displayTokenUsage function
function displayApiResponse(content, usage = null) {
  const apiResponse = document.getElementById('apiResponse');
  if (!apiResponse) return;

  apiResponse.style.display = 'block';
  apiResponse.textContent = content;
}

// Call the API with prompts and comments
async function callApi(apiAddress, apiKey, prompt1, prompt2, comments) {
  const config = loadConfig();
  console.log('API Call Inputs:', {
    provider: config.apiProvider,
    prompt1: prompt1,
    prompt2: prompt2,
    commentsCount: comments.length
  });

  if (config.apiProvider === 'default') {
    // Use the proxy endpoint
    const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
    const username = loginState.username;
    
    if (!username) {
      throw new Error('User not logged in');
    }

    // Combine prompts and comments into a single prompt
    const fullPrompt = [
      prompt1,
      prompt2,
      "Comments:",
      ...comments.map(c => `${c.author}: ${c.content}`)
    ].filter(Boolean).join('\n\n');

    try {
      const response = await fetch('https://45.38.143.67/api/subscriptions/proxy-deepseek/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          username: username
        })
      });

      const data = await response.json();
      console.log('Proxy API Response:', data);

      if (data.status === 'error') {
        // Handle subscription error
        if (data.subscription_required) {
          // Force a subscription check
          const checkResult = await checkSubscription(username);
          if (!checkResult.success || !checkResult.subscription.is_active) {
            setTimeout(handleLogout, 1000);
          }
        }
        throw new Error(data.message || 'Proxy API call failed');
      }

      // Extract the assistant's message from the successful response
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        displayApiResponse(content);
        return content;
      } else {
        throw new Error('Invalid response format from proxy API');
      }
    } catch (error) {
      console.error('Proxy API call error:', error);
      throw error;
    }
  } else if (config.apiProvider === 'gemini') {
    const response = await callGeminiApi(config.geminiApiKey, prompt1, prompt2, comments);
    displayApiResponse(response);
    return response;
  } else {
    // Original DeepSeek API logic
    const messages = [];
    const systemMessage = {
      role: "system",
      content: prompt1.trim() || "You are a helpful assistant."
    };
    messages.push(systemMessage);

    const userContent = [
      prompt2,
      "Comments:",
      ...comments.map(c => `${c.author}: ${c.content}`)
    ].filter(Boolean).join('\n\n');

    const userMessage = {
      role: "user",
      content: userContent
    };
    messages.push(userMessage);

    try {
      const response = await fetch(apiAddress, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.deepseekApiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messages,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      const content = data.choices[0].message.content;
      displayApiResponse(content);
      return content;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }
}

// Add function to call Gemini API
async function callGeminiApi(apiKey, prompt1, prompt2, comments) {
  const text = [
    prompt1,
    prompt2,
    "Comments:",
    ...comments.map(c => `${c.author}: ${c.content}`)
  ].filter(Boolean).join('\n\n');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: text
        }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API call failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Function to remove existing UI
function removeExistingUI() {
  const existingUI = document.getElementById('xhs-comment-extractor');
  if (existingUI) {
    existingUI.remove();
  }
}

// Helper function to simulate random delay
function randomDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay / browseSpeed));
}

// Helper function to simulate keyboard events
function simulateKeyboardEvent(element, eventType, key = '') {
  const event = new KeyboardEvent(eventType, {
    key: key,
    code: `Key${key.toUpperCase()}`,
    bubbles: true,
    cancelable: true,
    composed: true,
    keyCode: key.charCodeAt(0),
    which: key.charCodeAt(0)
  });
  element.dispatchEvent(event);
}

// Helper function to simulate typing
async function simulateTyping(element, text) {
  // First, focus the element
  element.focus();
  simulateKeyboardEvent(element, 'keydown');
  await randomDelay(100, 200);

  // Clear existing content
  element.textContent = '';
  
  // Type each character with random delay
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    // Simulate keydown
    simulateKeyboardEvent(element, 'keydown', char);
    await randomDelay(50, 150);
    
    // Add the character
    element.textContent += char;
    
    // Simulate keyup
    simulateKeyboardEvent(element, 'keyup', char);
    
    // Trigger input event
    element.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Random delay between characters
    await randomDelay(50, 150);
  }

  // Final input event
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

// Helper function to wait for element
async function waitForElement(selector, maxAttempts = 10, interval = 500) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const element = document.querySelector(selector);
    if (element && element.offsetParent !== null) { // Check if element exists and is visible
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error(`Element ${selector} not found or not visible after ${maxAttempts} attempts`);
}

// Updated auto-reply function
async function autoReply(responseText) {
  try {
    // Step 1: Find and click the initial comment input area
    console.log('Step 1: Finding initial comment area...');
    const initialCommentArea = document.querySelector('div.inner');
    if (!initialCommentArea) {
      throw new Error('Initial comment area not found');
    }
    console.log('Clicking initial comment area...');
    initialCommentArea.click();
    await randomDelay(800, 1200);

    // Step 2: Wait for textarea to appear and be visible
    console.log('Step 2: Waiting for textarea...');
    const textarea = await waitForElement('#content-textarea');
    console.log('Textarea found:', textarea);
    await randomDelay(500, 800);

    // Step 3: Click and focus the textarea
    console.log('Step 3: Focusing textarea...');
    textarea.click();
    await randomDelay(300, 500);
    textarea.focus();
    await randomDelay(300, 500);

    // Step 4: Simulate typing
    console.log('Step 4: Typing response...');
    await simulateTyping(textarea, responseText);
    await randomDelay(500, 1000);

    // Step 5: Find and prepare submit button
    console.log('Step 5: Preparing submit button...');
    const submitButton = await waitForElement('button.btn.submit');
    if (!submitButton) {
      throw new Error('Submit button not found');
    }

    // Step 6: Enable and click submit button
    console.log('Step 6: Submitting response...');
    submitButton.removeAttribute('disabled');
    await randomDelay(500, 800);
    
    // Simulate mouse events on submit button
    submitButton.dispatchEvent(new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      view: window
    }));
    await randomDelay(100, 200);
    
    submitButton.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      view: window
    }));
    await randomDelay(50, 100);
    
    submitButton.dispatchEvent(new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window
    }));
    await randomDelay(50, 100);
    
    submitButton.click();

    return true;
  } catch (error) {
    console.error('Auto-reply error:', error);
    throw error;
  }
}

// Add these variables at the top of the file
let currentPostIndex = -1;
const SELECTED_CLASS = 'post-selected';

// Add these style rules to the page
const styles = `
  .post-selected {
    border: 3px solid #ff2442 !important;
    box-shadow: 0 0 10px rgba(255, 36, 66, 0.5);
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Add these functions for post navigation
function focusNextPost() {
  const posts = document.querySelectorAll('.note-item');
  
  // Remove previous selection
  if (currentPostIndex >= 0 && posts[currentPostIndex]) {
    const prevPost = posts[currentPostIndex].querySelector('.cover');
    if (prevPost) {
      prevPost.classList.remove(SELECTED_CLASS);
    }
  }

  // Move to next post
  currentPostIndex = (currentPostIndex + 1) % posts.length;
  
  // Add selection to new post
  const currentPost = posts[currentPostIndex].querySelector('.cover');
  if (currentPost) {
    currentPost.classList.add(SELECTED_CLASS);
    currentPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function clickCurrentPost() {
  const posts = document.querySelectorAll('.note-item');
  if (currentPostIndex >= 0 && posts[currentPostIndex]) {
    const currentPost = posts[currentPostIndex].querySelector('.cover');
    if (currentPost) {
      currentPost.click();
    }
  }
}

// Add these variables for auto-browsing
let isAutoBrowsing = false;
let autoBrowseCount = 0;
const MAX_POSTS_BEFORE_SCROLL = 5; // Scroll main feed after this many posts

// Function to simulate natural scrolling
async function simulateScroll(element, scrollAmount, duration = 1000) {
  const start = element.scrollTop;
  const change = scrollAmount - start;
  const startTime = performance.now();
  
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  return new Promise(resolve => {
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      element.scrollTop = start + change * easeInOutQuad(progress);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        resolve();
      }
    }
    
    requestAnimationFrame(update);
  });
}

// Add this variable at the top with other variables
let browseSpeed = 1;

// Update the randomDelay function to consider speed
function randomDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay / browseSpeed));
}

// Add function to determine if we should reply based on frequency
function shouldReplyBasedOnFrequency(frequency) {
  const randomValue = Math.random();
  return randomValue < parseFloat(frequency);
}

// Update browsePost function to handle reply timing better
async function browsePost() {
  try {
    // Click the post
    await clickCurrentPost();
    await randomDelay(3000, 4000);

    // Find the note scroller
    const scroller = document.querySelector('.note-scroller');
    if (scroller) {
      const scrollAmount = Math.floor(scroller.scrollHeight * (0.5 + Math.random() * 0.5));
      await simulateScroll(scroller, scrollAmount, 3000 / browseSpeed);
      await randomDelay(2000, 3000);
    }

    // Check if auto-reply is enabled
    const toggleAutoReply = document.getElementById('toggleAutoReply');
    const replyFrequency = document.getElementById('replyFrequency');
    
    let replyInProgress = false;
    
    if (toggleAutoReply && toggleAutoReply.checked) {
      // Check if we should reply based on frequency
      if (shouldReplyBasedOnFrequency(replyFrequency.value)) {
        try {
          replyInProgress = true;
          console.log('Attempting reply based on frequency:', replyFrequency.value);
          const comments = extractComments();
          if (comments.length > 0) {
            const config = loadConfig();
            
            // First get the API response
            console.log('Getting API response...');
            const response = await callApi(
              config.apiAddress,
              '', // API key is now handled inside callApi
              config.prompt1,
              config.prompt2,
              comments
            );

            // Wait a bit before starting to reply
            await randomDelay(1000, 2000);

            // Then do the reply
            console.log('Starting auto reply...');
            await autoReply(response);

            // Add extra delay after successful reply
            console.log('Reply completed, waiting extra time to ensure completion...');
            await randomDelay(3000, 4000);
          }
        } catch (error) {
          console.error('Auto-reply during browsing failed:', error);
          // Add extra delay if reply fails to ensure UI is back to normal
          await randomDelay(2000, 3000);
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
        await randomDelay(2000, 3000); // Wait for post to close
      }

      // Move to next post
      focusNextPost();
      autoBrowseCount++;

      // Check if we need to scroll the main feed
      if (autoBrowseCount % MAX_POSTS_BEFORE_SCROLL === 0) {
        const mainContainer = document.getElementById('mfContainer');
        if (mainContainer) {
          console.log('Scrolling main feed to load more posts...');
          await simulateScroll(mainContainer, mainContainer.scrollHeight, 4000 / browseSpeed);
          await randomDelay(3000, 4000); // Wait for new posts to load
        }
      }

      // Continue browsing if auto-browse is still active
      if (isAutoBrowsing) {
        await randomDelay(2000, 3000); // Wait between posts
        await browsePost();
      }
    }
  } catch (error) {
    console.error('Error during auto-browsing:', error);
    isAutoBrowsing = false;
    const autoBrowseBtn = document.getElementById('autoBrowseBtn');
    if (autoBrowseBtn) {
      autoBrowseBtn.textContent = 'Start Auto Browse';
      autoBrowseBtn.style.backgroundColor = '#9c27b0';
    }
  }
}

// Add logout function
function handleLogout() {
  isLoggedIn = false;
  userId = null;
  localStorage.removeItem('xhs_login_state');
  document.getElementById('xhs-comment-extractor').remove();
  createLoginUI();
}

// Add debug functions for subscription checking
function getLastCheckInfo() {
  const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
  const lastCheck = loginState.lastSubscriptionCheck;
  if (!lastCheck) return 'Never checked';
  
  const lastCheckDate = new Date(lastCheck);
  const now = new Date();
  const diffHours = Math.round((now - lastCheckDate) / (1000 * 60 * 60));
  
  return `Last check: ${lastCheckDate.toLocaleString()} (${diffHours} hours ago)`;
}

// Modify checkSubscription to include debug info
async function checkSubscription(username, isDebug = false) {
  try {
    console.log(`[Subscription Check] Starting check for ${username}${isDebug ? ' (Debug Mode)' : ''}`);
    console.log(`[Subscription Check] Current time: ${new Date().toLocaleString()}`);
    console.log(`[Subscription Check] Last check: ${getLastCheckInfo()}`);

    const response = await fetch('https://45.38.143.67/api/subscriptions/check-subscription/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });

    const data = await response.json();
    console.log('[Subscription Check] Response:', data);
    
    if (data.status === 'success') {
      // Update subscription info in storage
      const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
      loginState.subscription = data.subscription;
      loginState.lastSubscriptionCheck = new Date().toISOString();
      localStorage.setItem('xhs_login_state', JSON.stringify(loginState));
      
      return {
        success: true,
        subscription: data.subscription,
        debugInfo: {
          checkTime: new Date().toISOString(),
          isDebugCheck: isDebug
        }
      };
    } else {
      return {
        success: false,
        message: data.message,
        debugInfo: {
          checkTime: new Date().toISOString(),
          isDebugCheck: isDebug
        }
      };
    }
  } catch (error) {
    console.error('[Subscription Check] Error:', error);
    return {
      success: false,
      message: 'Network error occurred',
      debugInfo: {
        checkTime: new Date().toISOString(),
        isDebugCheck: isDebug,
        error: error.message
      }
    };
  }
}

// Modify the subscription status display in createExtensionUI
function updateSubscriptionDisplay(subscription, debugInfo = null) {
  const subscriptionStatus = document.getElementById('subscription-status');
  const lastCheckInfo = document.getElementById('last-check-info');
  
  if (subscription && subscription.is_active) {
    subscriptionStatus.innerHTML = `
      <span style="color: #4CAF50;">✓ Active</span> · 
      <span>${subscription.days_remaining} days left</span> · 
      <span>Expires: ${new Date(subscription.end_date).toLocaleDateString()}</span>
    `;
  } else {
    subscriptionStatus.innerHTML = `
      <span style="color: #f44336;">✗ Inactive</span>
    `;
  }

  if (lastCheckInfo && debugInfo) {
    lastCheckInfo.innerHTML = `
      <div style="font-size: 11px; color: #666;">
        ${getLastCheckInfo()}
        ${debugInfo.isDebugCheck ? ' (Debug Check)' : ''}
      </div>
    `;
  }
}

// Function to check if we need to verify subscription
function needsSubscriptionCheck() {
  const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
  if (!loginState.lastSubscriptionCheck) return true;
  
  const lastCheck = new Date(loginState.lastSubscriptionCheck);
  const now = new Date();
  
  // Check if last check was on a different day
  return lastCheck.getDate() !== now.getDate() ||
         lastCheck.getMonth() !== now.getMonth() ||
         lastCheck.getFullYear() !== now.getFullYear();
}

// Create and inject UI
async function createExtensionUI() {
  // Remove any existing UI first
  removeExistingUI();

  // Fetch the UI HTML template
  const response = await fetch(chrome.runtime.getURL('ui.html'));
  const uiHTML = await response.text();

  const uiContainer = document.createElement('div');
  uiContainer.innerHTML = uiHTML;
  document.body.appendChild(uiContainer);

  // Add event listeners
  const logoutBtn = document.getElementById('logoutBtn');
  const toggleBtn = document.getElementById('toggleExtractor');
  const reloadBtn = document.getElementById('reloadExtension');
  const checkSubscriptionBtn = document.getElementById('checkSubscriptionBtn');
  const debugCheckBtn = document.getElementById('debugCheckBtn');
  const content = document.getElementById('extractorContent');
  const extractBtn = document.getElementById('extractBtn');
  const copyBtn = document.getElementById('copyBtn');
  const commentList = document.getElementById('commentList');
  const commentCount = document.getElementById('commentCount');
  const apiAddress = document.getElementById('apiAddress');
  const apiKey = document.getElementById('apiKey');
  const prompt1 = document.getElementById('prompt1');
  const prompt2 = document.getElementById('prompt2');
  const callApiBtn = document.getElementById('callApiBtn');
  const apiResponse = document.getElementById('apiResponse');
  const autoReplyBtn = document.getElementById('autoReplyBtn');
  const nextPostBtn = document.getElementById('nextPostBtn');
  const clickPostBtn = document.getElementById('clickPostBtn');
  const autoBrowseBtn = document.getElementById('autoBrowseBtn');
  const replyFrequency = document.getElementById('replyFrequency');
  const apiProvider = document.getElementById('apiProvider');
  const apiKeyInput = document.getElementById('apiKey');
  const toggleAutoReply = document.getElementById('toggleAutoReply');
  const autoReplySection = document.getElementById('autoReplySection');
  const subscriptionStatus = document.getElementById('subscription-status');
  const lastCheckInfo = document.getElementById('last-check-info');

  let isCollapsed = false;

  // Load saved configuration once
  let config = loadConfig();

  // Display initial subscription information
  const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
  if (loginState.subscription) {
    updateSubscriptionDisplay(loginState.subscription, {
      checkTime: loginState.lastSubscriptionCheck,
      isDebugCheck: false
    });
  }

  // Add check subscription button handler
  checkSubscriptionBtn.addEventListener('click', async () => {
    const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
    
    checkSubscriptionBtn.textContent = 'Checking...';
    checkSubscriptionBtn.disabled = true;
    debugCheckBtn.disabled = true;
    
    try {
      const result = await checkSubscription(loginState.username, false);
      
      if (result.success) {
        updateSubscriptionDisplay(result.subscription, result.debugInfo);
        
        if (!result.subscription.is_active) {
          setTimeout(handleLogout, 3000);
        }
      } else {
        updateSubscriptionDisplay(null, result.debugInfo);
      }
    } catch (error) {
      console.error('Check subscription error:', error);
      updateSubscriptionDisplay(null, {
        checkTime: new Date().toISOString(),
        isDebugCheck: false,
        error: error.message
      });
    } finally {
      checkSubscriptionBtn.textContent = 'Check Subscription';
      checkSubscriptionBtn.disabled = false;
      debugCheckBtn.disabled = false;
    }
  });

  // Add debug check button handler
  debugCheckBtn.addEventListener('click', async () => {
    const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
    
    debugCheckBtn.textContent = 'Checking...';
    debugCheckBtn.disabled = true;
    checkSubscriptionBtn.disabled = true;
    
    try {
      const result = await checkSubscription(loginState.username, true);
      
      if (result.success) {
        updateSubscriptionDisplay(result.subscription, result.debugInfo);
        
        if (!result.subscription.is_active) {
          setTimeout(handleLogout, 3000);
        }
      } else {
        updateSubscriptionDisplay(null, result.debugInfo);
      }
    } catch (error) {
      console.error('Debug check error:', error);
      updateSubscriptionDisplay(null, {
        checkTime: new Date().toISOString(),
        isDebugCheck: true,
        error: error.message
      });
    } finally {
      debugCheckBtn.textContent = 'Debug Check';
      debugCheckBtn.disabled = false;
      checkSubscriptionBtn.disabled = false;
    }
  });

  // Initialize all values from config
  apiAddress.value = config.apiAddress;
  prompt1.value = config.prompt1;
  prompt2.value = config.prompt2;
  apiProvider.value = config.apiProvider;
  apiKeyInput.value = config.apiProvider === 'gemini' ? config.geminiApiKey : config.deepseekApiKey;
  toggleAutoReply.checked = config.autoReplyEnabled;
  autoReplySection.style.display = config.autoReplyEnabled ? 'block' : 'none';
  replyFrequency.value = config.replyFrequency;

  // Update API address and key when provider changes
  apiProvider.addEventListener('change', (e) => {
    const provider = e.target.value;
    let defaultAddress = '';
    config = loadConfig(); // Reload config to get latest values
    
    if (provider === 'default') {
      defaultAddress = 'https://45.38.143.67/api/subscriptions/proxy-deepseek/';
      apiKeyInput.value = '';
      apiKeyInput.disabled = true;
    } else if (provider === 'gemini') {
      defaultAddress = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
      apiKeyInput.value = config.geminiApiKey;
      apiKeyInput.disabled = false;
    } else {
      defaultAddress = 'https://api.deepseek.com/chat/completions';
      apiKeyInput.value = config.deepseekApiKey;
      apiKeyInput.disabled = false;
    }
    
    apiAddress.value = defaultAddress;
    
    saveConfig({
      ...config,
      apiProvider: provider,
      apiAddress: defaultAddress
    });
  });

  // Update API key save handler
  apiKeyInput.addEventListener('change', () => {
    config = loadConfig(); // Reload config to get latest values
    if (apiProvider.value === 'gemini') {
      config.geminiApiKey = apiKeyInput.value;
    } else {
      config.deepseekApiKey = apiKeyInput.value;
    }
    saveConfig(config);
    console.log('Saved API key for provider:', apiProvider.value, 'Config:', config);
  });

  // Save configuration when inputs change
  [apiAddress, prompt1, prompt2].forEach(input => {
    input.addEventListener('change', () => {
      config = loadConfig(); // Reload config to get latest values
      if (input === apiAddress) config.apiAddress = input.value;
      if (input === prompt1) config.prompt1 = input.value;
      if (input === prompt2) config.prompt2 = input.value;
      saveConfig(config);
    });
  });

  // Add reload functionality
  reloadBtn.addEventListener('click', async () => {
    reloadBtn.style.transform = 'rotate(360deg)';
    reloadBtn.style.transition = 'transform 0.5s';
    
    // Save current state
    const currentConfig = {
      apiAddress: apiAddress.value,
      apiKey: apiKey.value,
      prompt1: prompt1.value,
      prompt2: prompt2.value,
      isCollapsed: isCollapsed
    };
    localStorage.setItem('xhs_ui_state', JSON.stringify(currentConfig));
    
    // Reinitialize the UI
    await createExtensionUI();
    
    // Restore UI state
    const savedState = JSON.parse(localStorage.getItem('xhs_ui_state') || '{}');
    if (savedState.isCollapsed) {
      document.getElementById('extractorContent').style.display = 'none';
      document.getElementById('toggleExtractor').textContent = '+';
    }
  });

  toggleBtn.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    content.style.display = isCollapsed ? 'none' : 'block';
    toggleBtn.textContent = isCollapsed ? '+' : '−';
  });

  extractBtn.addEventListener('click', async () => {
    try {
      extractBtn.textContent = 'Extracting...';
      extractBtn.disabled = true;
      commentCount.textContent = 'Searching for comments...';
      
      const comments = extractComments();
      currentComments = comments;
      displayComments(comments);
    } catch (error) {
      console.error('Error:', error);
      commentCount.textContent = 'An error occurred. Please try again.';
    } finally {
      extractBtn.textContent = 'Extract Comments';
      extractBtn.disabled = false;
    }
  });

  copyBtn.addEventListener('click', () => {
    if (currentComments.length === 0) {
      commentCount.textContent = 'No comments to copy';
      return;
    }

    const text = currentComments
      .map(comment => `${comment.author}: ${comment.content}`)
      .join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy to Clipboard';
      }, 2000);
    }).catch(error => {
      console.error('Failed to copy:', error);
      commentCount.textContent = 'Failed to copy to clipboard';
    });
  });

  // Add API call button handler
  callApiBtn.addEventListener('click', async () => {
    if (currentComments.length === 0) {
      apiResponse.textContent = 'Please extract comments first';
      apiResponse.style.display = 'block';
      return;
    }

    try {
      callApiBtn.textContent = 'Calling API...';
      callApiBtn.disabled = true;
      apiResponse.textContent = 'Waiting for API response...';
      apiResponse.style.display = 'block';
      autoReplyBtn.style.display = 'none';

      const response = await callApi(
        apiAddress.value,
        apiKey.value,
        prompt1.value,
        prompt2.value,
        currentComments
      );

      apiResponse.textContent = response;
      // Show auto-reply button after successful API call
      autoReplyBtn.style.display = 'block';
    } catch (error) {
      apiResponse.textContent = `Error: ${error.message}`;
    } finally {
      callApiBtn.textContent = 'Call API';
      callApiBtn.disabled = false;
    }
  });

  // Add auto-reply button handler
  autoReplyBtn.addEventListener('click', async () => {
    try {
      autoReplyBtn.textContent = 'Replying...';
      autoReplyBtn.disabled = true;

      await autoReply(apiResponse.textContent);

      autoReplyBtn.textContent = 'Reply Sent!';
      setTimeout(() => {
        autoReplyBtn.textContent = 'Auto Reply';
        autoReplyBtn.disabled = false;
      }, 2000);
    } catch (error) {
      console.error('Auto-reply error:', error);
      autoReplyBtn.textContent = 'Reply Failed';
      apiResponse.textContent += '\n\nAuto-reply failed: ' + error.message;
      setTimeout(() => {
        autoReplyBtn.textContent = 'Auto Reply';
        autoReplyBtn.disabled = false;
      }, 2000);
    }
  });

  // Add navigation button handlers
  nextPostBtn.addEventListener('click', focusNextPost);
  clickPostBtn.addEventListener('click', clickCurrentPost);

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'n') {
      focusNextPost();
    } else if (e.key === 'c') {
      clickCurrentPost();
    }
  });

  // Add auto-browse button handler
  autoBrowseBtn.addEventListener('click', async () => {
    if (isAutoBrowsing) {
      // Stop auto-browsing
      isAutoBrowsing = false;
      autoBrowseBtn.textContent = 'Start Auto Browse';
      autoBrowseBtn.style.backgroundColor = '#9c27b0';
    } else {
      // Start auto-browsing
      isAutoBrowsing = true;
      autoBrowseCount = 0;
      autoBrowseBtn.textContent = 'Stop Auto Browse';
      autoBrowseBtn.style.backgroundColor = '#ff5722';
      await browsePost();
    }
  });

  const speedSlider = document.getElementById('browseSpeed');
  const speedValue = document.getElementById('speedValue');

  // Add speed slider handler
  speedSlider.addEventListener('input', (e) => {
    browseSpeed = parseFloat(e.target.value);
    speedValue.textContent = browseSpeed.toFixed(1) + 'x';
    
    // Save speed to localStorage
    localStorage.setItem('xhs_browse_speed', browseSpeed);
  });

  // Load saved speed
  const savedSpeed = localStorage.getItem('xhs_browse_speed');
  if (savedSpeed) {
    browseSpeed = parseFloat(savedSpeed);
    speedSlider.value = browseSpeed;
    speedValue.textContent = browseSpeed.toFixed(1) + 'x';
  }

  // Load auto-reply state
  toggleAutoReply.checked = config.autoReplyEnabled;
  autoReplySection.style.display = config.autoReplyEnabled ? 'block' : 'none';

  // Add toggle handler
  toggleAutoReply.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    autoReplySection.style.display = isEnabled ? 'block' : 'none';
    
    // Save the state
    saveConfig({
      ...config,
      autoReplyEnabled: isEnabled
    });

    // Update the switch style
    const switchSpan = toggleAutoReply.nextElementSibling;
    if (switchSpan) {
      switchSpan.style.backgroundColor = isEnabled ? '#4CAF50' : '#ccc';
      const switchDot = switchSpan.querySelector('span');
      if (switchDot) {
        switchDot.style.transform = isEnabled ? 'translateX(20px)' : 'translateX(0)';
      }
    }
  });

  // Initialize switch style
  const switchSpan = toggleAutoReply.nextElementSibling;
  if (switchSpan) {
    switchSpan.style.backgroundColor = config.autoReplyEnabled ? '#4CAF50' : '#ccc';
    const switchDot = switchSpan.querySelector('span');
    if (switchDot) {
      switchDot.style.transform = config.autoReplyEnabled ? 'translateX(20px)' : 'translateX(0)';
    }
  }

  // Load saved frequency
  replyFrequency.value = config.replyFrequency;

  // Save frequency when changed
  replyFrequency.addEventListener('change', (e) => {
    saveConfig({
      ...config,
      replyFrequency: e.target.value
    });
  });

  // Add logout button handler
  logoutBtn.addEventListener('click', handleLogout);

  // Add check subscription button handler
  checkSubscriptionBtn.addEventListener('click', async () => {
    const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
    const subscriptionStatus = document.getElementById('subscription-status');
    
    checkSubscriptionBtn.textContent = 'Checking...';
    checkSubscriptionBtn.disabled = true;
    
    try {
      const result = await checkSubscription(loginState.username);
      
      if (result.success) {
        const subscription = result.subscription;
        if (subscription.is_active) {
          subscriptionStatus.innerHTML = `
            <span style="color: #4CAF50;">✓ Active</span> · 
            <span>${subscription.days_remaining} days left</span> · 
            <span>Expires: ${new Date(subscription.end_date).toLocaleDateString()}</span>
          `;
        } else {
          subscriptionStatus.innerHTML = `
            <span style="color: #f44336;">✗ Inactive</span> · 
            <span>${subscription.message || 'Subscription expired'}</span>
          `;
          // Logout after 3 seconds if subscription is inactive
          setTimeout(handleLogout, 3000);
        }
      } else {
        subscriptionStatus.innerHTML = `
          <span style="color: #f44336;">✗ Error</span> · 
          <span>${result.message}</span>
        `;
      }
    } catch (error) {
      subscriptionStatus.innerHTML = `
        <span style="color: #f44336;">✗ Error</span> · 
        <span>Failed to check subscription</span>
      `;
    } finally {
      checkSubscriptionBtn.textContent = 'Check Subscription';
      checkSubscriptionBtn.disabled = false;
    }
  });

  // Add event listeners for token counting
  [prompt1, prompt2].forEach(input => {
    input.addEventListener('change', () => {
      config = loadConfig();
      if (input === prompt1) config.prompt1 = input.value;
      if (input === prompt2) config.prompt2 = input.value;
      saveConfig(config);
    });
  });

  // Remove token-related code
  const originalDisplayComments = displayComments;
  displayComments = function(comments) {
    originalDisplayComments(comments);
  };

  // Initialize all values from config
}

function displayComments(comments) {
  const commentList = document.getElementById('commentList');
  const commentCount = document.getElementById('commentCount');

  // Update global currentComments
  currentComments = comments;

  if (comments.length === 0) {
    commentCount.textContent = 'No comments found';
    commentList.innerHTML = '';
    return;
  }

  commentCount.textContent = `Found ${comments.length} comments`;
  commentList.innerHTML = '';
  
  comments.forEach(comment => {
    const div = document.createElement('div');
    div.style.cssText = `
      padding: 8px;
      border-bottom: 1px solid #eee;
    `;
    div.innerHTML = `
      <span style="font-weight: bold; color: #333;">${escapeHtml(comment.author)}</span>
      <span style="color: #666; margin-left: 8px;">${escapeHtml(comment.content)}</span>
    `;
    commentList.appendChild(div);
  });
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function extractComments() {
  console.log('Extracting comments...');
  
  // First extract the note content
  const noteContent = document.querySelector('.note-content');
  let mainContent = '';
  
  if (noteContent) {
    const title = noteContent.querySelector('#detail-title');
    const desc = noteContent.querySelector('#detail-desc');
    
    const titleText = title ? title.textContent.trim() : '';
    const descText = desc ? desc.textContent.trim() : '';
    
    mainContent = [titleText, descText].filter(Boolean).join('\n');
    console.log('Found note content:', mainContent);
  }
  
  // Try multiple possible selectors for comments
  const selectors = [
    '.comment-item',
    '.commentItem',
    '[data-testid="comment-item"]',
    '.comment-wrapper',
    '.feed-comment'
  ];
  
  let comments = [];
  for (const selector of selectors) {
    comments = document.querySelectorAll(selector);
    console.log(`Trying selector "${selector}": found ${comments.length} comments`);
    if (comments.length > 0) break;
  }

  const results = [];

  // Add the main note content as the first item if it exists
  if (mainContent) {
    results.push({
      author: '原帖内容',
      content: mainContent
    });
  }
  
  comments.forEach((comment, index) => {
    console.log(`Processing comment ${index + 1}`);
    
    // Try multiple possible selectors for author and text
    const authorSelectors = [
      '.author-wrapper .name',
      '.user-name',
      '.nickname',
      '[data-testid="comment-username"]'
    ];
    
    const textSelectors = [
      '.note-text',
      '.content',
      '.comment-text',
      '[data-testid="comment-content"]'
    ];
    
    let authorElement = null;
    let textElement = null;
    
    // Find author element
    for (const selector of authorSelectors) {
      authorElement = comment.querySelector(selector);
      if (authorElement) {
        console.log(`Found author with selector: ${selector}`);
        break;
      }
    }
    
    // Find text element
    for (const selector of textSelectors) {
      textElement = comment.querySelector(selector);
      if (textElement) {
        console.log(`Found text with selector: ${selector}`);
        break;
      }
    }
    
    if (authorElement && textElement) {
      const author = authorElement.textContent.trim();
      const text = textElement.textContent.trim();
      
      if (author && text) {
        results.push({
          author: author,
          content: text
        });
      }
    }
  });
  
  console.log(`Total content extracted: ${results.length} (including note content)`);
  
  // Update global currentComments before returning
  currentComments = results;
  return results;
}

// Initialize UI when the page loads
async function initializeExtension() {
  const isLoggedIn = await checkLoginState();
  if (isLoggedIn) {
    createExtensionUI();
  } else {
    createLoginUI();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
} 