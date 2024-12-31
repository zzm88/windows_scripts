// UI-related functions
window.ui = {
  currentComments: [],

  // Function to remove existing UI
  removeExistingUI() {
    const existingUI = document.getElementById('xhs-comment-extractor');
    if (existingUI) {
      existingUI.remove();
    }
  },

  // Function to create login UI
  async createLoginUI() {
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

      const result = await window.auth.handleLogin(username, password);
      
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
        this.createExtensionUI();
      } else {
        loginMessage.textContent = result.message;
        loginButton.textContent = 'Login';
        loginButton.disabled = false;
      }
    });
  },

  // Function to create main extension UI
  async createExtensionUI() {
    this.removeExistingUI();

    // Fetch the UI HTML template
    const response = await fetch(chrome.runtime.getURL('ui.html'));
    const uiHTML = await response.text();

    const uiContainer = document.createElement('div');
    uiContainer.innerHTML = uiHTML;
    document.body.appendChild(uiContainer);

    // Initialize all UI elements and event listeners
    this.initializeUI();
  },

  // Function to initialize UI elements and event listeners
  initializeUI() {
    // Load saved configuration
    const config = window.api.loadConfig();

    // Initialize token credit display
    this.loadTokenCredit();

    // Initialize subscription status
    const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
    if (loginState.subscription) {
      this.updateSubscriptionDisplay(loginState.subscription, {
        checkTime: loginState.lastSubscriptionCheck,
        isDebugCheck: false
      });
    }

    // Add event listeners for all UI elements
    this.addEventListeners();
  },

  // Function to add event listeners
  addEventListeners() {
    const config = window.api.loadConfig();

    // Get all UI elements
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
    const toggleAutoReply = document.getElementById('toggleAutoReply');
    const autoReplySection = document.getElementById('autoReplySection');
    const speedSlider = document.getElementById('browseSpeed');
    const speedValue = document.getElementById('speedValue');

    let isCollapsed = false;

    // Initialize values
    apiAddress.value = config.apiAddress;
    prompt1.value = config.prompt1;
    prompt2.value = config.prompt2;
    apiProvider.value = config.apiProvider;
    apiKey.value = config.apiProvider === 'gemini' ? config.geminiApiKey : config.deepseekApiKey;
    toggleAutoReply.checked = config.autoReplyEnabled;
    autoReplySection.style.display = config.autoReplyEnabled ? 'block' : 'none';
    replyFrequency.value = config.replyFrequency;

    // Load saved speed
    const savedSpeed = localStorage.getItem('xhs_browse_speed');
    if (savedSpeed) {
      window.browse.browseSpeed = parseFloat(savedSpeed);
      speedSlider.value = window.browse.browseSpeed;
      speedValue.textContent = window.browse.browseSpeed.toFixed(1) + 'x';
    }

    // Add event listeners
    logoutBtn.addEventListener('click', window.auth.handleLogout);
    
    toggleBtn.addEventListener('click', () => {
      isCollapsed = !isCollapsed;
      content.style.display = isCollapsed ? 'none' : 'block';
      toggleBtn.textContent = isCollapsed ? '+' : '−';
    });

    reloadBtn.addEventListener('click', async () => {
      reloadBtn.style.transform = 'rotate(360deg)';
      reloadBtn.style.transition = 'transform 0.5s';
      await this.createExtensionUI();
    });

    // API provider change handler
    apiProvider.addEventListener('change', (e) => {
      const provider = e.target.value;
      let defaultAddress = '';
      config = window.api.loadConfig();
      
      if (provider === 'default') {
        defaultAddress = 'https://45.38.143.67/api/subscriptions/proxy-deepseek/';
        apiKey.value = '';
        apiKey.disabled = true;
      } else if (provider === 'gemini') {
        defaultAddress = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
        apiKey.value = config.geminiApiKey;
        apiKey.disabled = false;
      } else {
        defaultAddress = 'https://api.deepseek.com/chat/completions';
        apiKey.value = config.deepseekApiKey;
        apiKey.disabled = false;
      }
      
      apiAddress.value = defaultAddress;
      window.api.saveConfig({
        ...config,
        apiProvider: provider,
        apiAddress: defaultAddress
      });
    });

    // API key change handler
    apiKey.addEventListener('change', () => {
      config = window.api.loadConfig();
      if (apiProvider.value === 'gemini') {
        config.geminiApiKey = apiKey.value;
      } else {
        config.deepseekApiKey = apiKey.value;
      }
      window.api.saveConfig(config);
    });

    // Save configuration when inputs change
    [apiAddress, prompt1, prompt2].forEach(input => {
      input.addEventListener('change', () => {
        config = window.api.loadConfig();
        if (input === apiAddress) config.apiAddress = input.value;
        if (input === prompt1) config.prompt1 = input.value;
        if (input === prompt2) config.prompt2 = input.value;
        window.api.saveConfig(config);
      });
    });

    // Extract and copy buttons
    extractBtn.addEventListener('click', () => {
      const comments = this.extractComments();
      this.displayComments(comments);
    });

    copyBtn.addEventListener('click', () => {
      if (this.currentComments.length === 0) {
        commentCount.textContent = 'No comments to copy';
        return;
      }

      const text = this.currentComments
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

    // API call and auto-reply buttons
    callApiBtn.addEventListener('click', async () => {
      if (this.currentComments.length === 0) {
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

        const response = await window.api.callApi(
          apiAddress.value,
          apiKey.value,
          prompt1.value,
          prompt2.value,
          this.currentComments
        );

        apiResponse.textContent = response;
        autoReplyBtn.style.display = 'block';
      } catch (error) {
        apiResponse.textContent = `Error: ${error.message}`;
      } finally {
        callApiBtn.textContent = 'Call API';
        callApiBtn.disabled = false;
      }
    });

    autoReplyBtn.addEventListener('click', async () => {
      try {
        autoReplyBtn.textContent = 'Replying...';
        autoReplyBtn.disabled = true;

        await window.browse.autoReply(apiResponse.textContent);

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

    // Navigation buttons
    nextPostBtn.addEventListener('click', () => window.browse.focusNextPost());
    clickPostBtn.addEventListener('click', () => window.browse.clickCurrentPost());

    // Auto-browse button
    autoBrowseBtn.addEventListener('click', async () => {
      if (window.browse.isAutoBrowsing) {
        window.browse.isAutoBrowsing = false;
        autoBrowseBtn.textContent = 'Start Auto Browse';
        autoBrowseBtn.style.backgroundColor = '#9c27b0';
      } else {
        window.browse.isAutoBrowsing = true;
        window.browse.autoBrowseCount = 0;
        autoBrowseBtn.textContent = 'Stop Auto Browse';
        autoBrowseBtn.style.backgroundColor = '#ff5722';
        await window.browse.browsePost();
      }
    });

    // Speed slider
    speedSlider.addEventListener('input', (e) => {
      window.browse.browseSpeed = parseFloat(e.target.value);
      speedValue.textContent = window.browse.browseSpeed.toFixed(1) + 'x';
      localStorage.setItem('xhs_browse_speed', window.browse.browseSpeed);
    });

    // Auto-reply toggle
    toggleAutoReply.addEventListener('change', (e) => {
      const isEnabled = e.target.checked;
      autoReplySection.style.display = isEnabled ? 'block' : 'none';
      
      window.api.saveConfig({
        ...config,
        autoReplyEnabled: isEnabled
      });
    });

    // Reply frequency
    replyFrequency.addEventListener('change', (e) => {
      window.api.saveConfig({
        ...config,
        replyFrequency: e.target.value
      });
    });

    // Subscription check buttons
    checkSubscriptionBtn.addEventListener('click', async () => {
      const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
      
      checkSubscriptionBtn.textContent = 'Checking...';
      checkSubscriptionBtn.disabled = true;
      debugCheckBtn.disabled = true;
      
      try {
        const result = await window.auth.checkSubscription(loginState.username, false);
        
        if (result.success) {
          this.updateSubscriptionDisplay(result.subscription, result.debugInfo);
          
          if (!result.subscription.is_active) {
            setTimeout(window.auth.handleLogout, 3000);
          }
        } else {
          this.updateSubscriptionDisplay(null, result.debugInfo);
        }
      } catch (error) {
        console.error('Check subscription error:', error);
        this.updateSubscriptionDisplay(null, {
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

    debugCheckBtn.addEventListener('click', async () => {
      const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
      
      debugCheckBtn.textContent = 'Checking...';
      debugCheckBtn.disabled = true;
      checkSubscriptionBtn.disabled = true;
      
      try {
        const result = await window.auth.checkSubscription(loginState.username, true);
        
        if (result.success) {
          this.updateSubscriptionDisplay(result.subscription, result.debugInfo);
          
          if (!result.subscription.is_active) {
            setTimeout(window.auth.handleLogout, 3000);
          }
        } else {
          this.updateSubscriptionDisplay(null, result.debugInfo);
        }
      } catch (error) {
        console.error('Debug check error:', error);
        this.updateSubscriptionDisplay(null, {
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

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'n') {
        window.browse.focusNextPost();
      } else if (e.key === 'c') {
        window.browse.clickCurrentPost();
      }
    });
  },

  // Function to extract comments
  extractComments() {
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
    this.currentComments = results;
    return results;
  },

  // Function to display comments
  displayComments(comments) {
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
        <span style="font-weight: bold; color: #333;">${window.utils.escapeHtml(comment.author)}</span>
        <span style="color: #666; margin-left: 8px;">${window.utils.escapeHtml(comment.content)}</span>
      `;
      commentList.appendChild(div);
    });
  },

  // Token credit functions
  saveTokenCredit(tokensRemaining, tokenCredit) {
    localStorage.setItem('xhs_token_credit', JSON.stringify({
      tokensRemaining,
      tokenCredit,
      lastUpdate: new Date().toISOString()
    }));
  },

  loadTokenCredit() {
    const savedCredit = localStorage.getItem('xhs_token_credit');
    if (savedCredit) {
      const data = JSON.parse(savedCredit);
      this.updateTokenCreditDisplay(data.tokensRemaining, data.tokenCredit, data.lastUpdate);
    }
  },

  updateTokenCreditDisplay(tokensRemaining, tokenCredit, timestamp = new Date().toISOString()) {
    const tokenCreditText = document.getElementById('token-credit-text');
    const tokenCreditBar = document.getElementById('token-credit-bar');
    const tokenCreditUpdate = document.getElementById('token-credit-update');
    
    if (tokenCreditText && tokenCreditBar) {
      tokenCreditText.textContent = `${tokensRemaining.toLocaleString()} / ${tokenCredit.toLocaleString()}`;
      const percentage = (tokensRemaining / tokenCredit) * 100;
      tokenCreditBar.style.width = `${percentage}%`;
      
      // Update color based on remaining percentage
      if (percentage > 50) {
        tokenCreditBar.style.backgroundColor = '#4CAF50'; // Green
      } else if (percentage > 20) {
        tokenCreditBar.style.backgroundColor = '#FFA726'; // Orange
      } else {
        tokenCreditBar.style.backgroundColor = '#EF5350'; // Red
      }

      // Update last update timestamp
      if (tokenCreditUpdate) {
        tokenCreditUpdate.textContent = `Updated ${window.utils.formatLastUpdate(timestamp)}`;
      }

      // Save the token credit info
      this.saveTokenCredit(tokensRemaining, tokenCredit);
    }
  },

  // Function to update subscription display
  updateSubscriptionDisplay(subscription, debugInfo = null) {
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
          ${window.auth.getLastCheckInfo()}
          ${debugInfo.isDebugCheck ? ' (Debug Check)' : ''}
        </div>
      `;
    }
  }
}; 