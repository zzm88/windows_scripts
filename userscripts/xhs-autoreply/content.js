// Load saved configuration from storage
function loadConfig() {
  const config = {
    apiAddress: localStorage.getItem('xhs_api_address') || 'https://api.deepseek.com/chat/completions',
    apiKey: localStorage.getItem('xhs_api_key') || 'sk-91b44bc0e0d445b49757738c7e8acf3a',
    prompt1: localStorage.getItem('xhs_prompt1') || '',
    prompt2: localStorage.getItem('xhs_prompt2') || ''
  };
  return config;
}

// Save configuration to storage
function saveConfig(config) {
  localStorage.setItem('xhs_api_address', config.apiAddress);
  localStorage.setItem('xhs_api_key', config.apiKey);
  localStorage.setItem('xhs_prompt1', config.prompt1);
  localStorage.setItem('xhs_prompt2', config.prompt2);
}

// Call the API with prompts and comments
async function callApi(apiAddress, apiKey, prompt1, prompt2, comments) {
  console.log('API Call Inputs:', {
    prompt1: prompt1,
    prompt2: prompt2,
    commentsCount: comments.length
  });

  const messages = [];
  
  // Always add system message with prompt1
  const systemMessage = {
    role: "system",
    content: prompt1.trim() || "You are a helpful assistant."
  };
  messages.push(systemMessage);
  console.log('System Message:', systemMessage);

  // Add user message with prompt2 and comments if they exist
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
  console.log('User Message:', userMessage);

  console.log('Final API Request Messages:', JSON.stringify(messages, null, 2));

  try {
    const response = await fetch(apiAddress, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
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
  return new Promise(resolve => setTimeout(resolve, delay));
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
  const toggleBtn = document.getElementById('toggleExtractor');
  const reloadBtn = document.getElementById('reloadExtension');
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

  let isCollapsed = false;
  let currentComments = [];

  // Load saved configuration
  const config = loadConfig();
  apiAddress.value = config.apiAddress;
  apiKey.value = config.apiKey;
  prompt1.value = config.prompt1;
  prompt2.value = config.prompt2;

  // Save configuration when inputs change
  [apiAddress, apiKey, prompt1, prompt2].forEach(input => {
    input.addEventListener('change', () => {
      saveConfig({
        apiAddress: apiAddress.value,
        apiKey: apiKey.value,
        prompt1: prompt1.value,
        prompt2: prompt2.value
      });
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
}

function displayComments(comments) {
  const commentList = document.getElementById('commentList');
  const commentCount = document.getElementById('commentCount');

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
    '.comment-item',                    // Original selector
    '.commentItem',                     // Alternative class
    '[data-testid="comment-item"]',     // Test ID
    '.comment-wrapper',                 // Another possible class
    '.feed-comment'                     // Another possible class
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
  return results;
}

// Initialize UI when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createExtensionUI);
} else {
  createExtensionUI();
} 