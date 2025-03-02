// UI-related functions
window.ui = {
  currentComments: [],
  currentLanguage: 'zh', // Default language to Chinese
  translations: {
    en: {
      commentsExtractor: 'Comments Extractor',
      active: 'Active',
      inactive: 'Inactive',
      daysLeft: 'days left',
      expires: 'Expires',
      checkSubscription: 'Check Subscription',
      debugCheck: 'Debug Check',
      nextPost: 'Next Post (N)',
      clickPost: 'Click Post (C)',
      startAutoBrowse: 'Start Auto Browse',
      stopAutoBrowse: 'Stop Auto Browse',
      browseSpeed: 'Browse Speed',
      autoReply: 'Manual Reply',
      replyFrequency: 'Reply Frequency',
      always: 'Always (100%)',
      often: 'Often (75%)',
      sometimes: 'Sometimes (50%)',
      rarely: 'Rarely (25%)',
      veryRarely: 'Very Rarely (10%)',
      apiProvider: 'API Provider',
      defaultProvider: 'Default (No API Key Required)',
      apiAddress: 'API Address',
      apiKey: 'API Key',
      prompt1: 'Prompt 1',
      prompt2: 'Prompt 2',
      extractComments: 'Extract Comments',
      copyToClipboard: 'Copy to Clipboard',
      callApi: 'Call API',
      noCommentsFound: 'No comments found',
      noCommentsToCopy: 'No comments to copy',
      pleaseExtractFirst: 'Please extract comments first',
      waitingForApi: 'Waiting for API response...',
      copied: 'Copied!',
      replying: 'Replying...',
      replySent: 'Reply Sent!',
      replyFailed: 'Reply Failed',
      originalPost: 'Original Post',
      tokenCredit: 'Token Credit',
      updated: 'Updated',
      loginRequired: 'Login Required',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      loggingIn: 'Logging in...',
      enterBoth: 'Please enter both username and password',
      subscriptionActive: 'Subscription Active',
      daysRemaining: 'Days Remaining',
      failedToCopy: 'Failed to copy to clipboard',
      callingApi: 'Calling API...',
      foundComments: 'Found {count} comments',
      lastCheck: 'Last check',
      hoursAgo: '{hours} hours ago',
      debugMode: 'Debug Mode',
      checking: 'Checking...',
      speed: 'Speed',
      tokenCreditInfo: 'Token Credit Info',
      remainingTokens: 'Remaining Tokens',
      totalTokens: 'Total Tokens',
      lastUpdated: 'Last Updated',
      copySuccess: 'Copy Success',
      copyFailed: 'Copy Failed',
      autoReplyFailed: 'Auto-reply failed: {error}',
      characters: 'Characters',
      saveCharacter: 'Save Character',
      deleteCharacter: 'Delete',
      characterName: 'Character Name',
      saveCurrentPrompts: 'Save Current Prompts',
      noCharactersSaved: 'No characters saved',
      characterSaved: 'Character saved successfully',
      characterDeleted: 'Character deleted',
      enterCharacterName: 'Please enter a character name',
      confirmDelete: 'Are you sure you want to delete this character?',
      registerOrLogin: 'Register or Login'
    },
    zh: {
      commentsExtractor: '📕自动评论',
      active: '已激活',
      inactive: '未激活',
      daysLeft: '天剩余',
      expires: '到期时间',
      checkSubscription: '检查订阅',
      debugCheck: '调试检查',
      nextPost: '下一篇 (N)',
      clickPost: '点击帖子 (C)',
      startAutoBrowse: '开始全自动评论',
      stopAutoBrowse: '停止自动浏览',
      browseSpeed: '浏览速度',
      autoReply: '半自动回复',
      replyFrequency: '回复频率',
      always: '总是 (100%)',
      often: '经常 (75%)',
      sometimes: '有时 (50%)',
      rarely: '很少 (25%)',
      veryRarely: '非常少 (10%)',
      apiProvider: 'API提供商',
      defaultProvider: '默认 (无需API密钥)',
      apiAddress: 'API地址',
      apiKey: 'API密钥',
      prompt1: '角色背景设定',
      prompt2: '评论生成规则',
      extractComments: '提取评论',
      copyToClipboard: '复制到剪贴板',
      callApi: '生成评论',
      noCommentsFound: '未找到评论',
      noCommentsToCopy: '没有可复制的评论',
      pleaseExtractFirst: '请先提取评论',
      waitingForApi: '等待API响应...',
      copied: '已复制！',
      replying: '回复中...',
      replySent: '回复已发送！',
      replyFailed: '回复失败',
      originalPost: '原帖内容',
      tokenCredit: '令牌余额',
      updated: '更新于',
      loginRequired: '📕自动评论',
      username: '用户名',
      password: '密码',
      login: '登录',
      loggingIn: '登录中...',
      enterBoth: '请输入用户名和密码',
      subscriptionActive: '订阅已激活',
      daysRemaining: '剩余天数',
      failedToCopy: '复制到剪贴板失败',
      callingApi: '调用API中...',
      foundComments: '找到 {count} 条评论',
      lastCheck: '上次检查',
      hoursAgo: '{hours} 小时前',
      debugMode: '调试模式',
      checking: '检查中...',
      speed: '速度',
      tokenCreditInfo: '令牌信息',
      remainingTokens: '剩余令牌',
      totalTokens: '总令牌数',
      lastUpdated: '最后更新',
      copySuccess: '复制成功',
      copyFailed: '复制失败',
      autoReplyFailed: '自动回复失败: {error}',
      characters: '角色管理',
      saveCharacter: '保存角色',
      deleteCharacter: '删除',
      characterName: '角色名称',
      saveCurrentPrompts: '保存当前提示词',
      noCharactersSaved: '未保存角色',
      characterSaved: '角色保存成功',
      characterDeleted: '角色已删除',
      enterCharacterName: '请输入角色名称',
      confirmDelete: '确定要删除这个角色吗？',
      registerOrLogin: '注册'
    }
  },

  // Function to get translated text
  t(key) {
    return this.translations[this.currentLanguage][key] || key;
  },

  // Function to switch language
  switchLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'zh' : 'en';
    localStorage.setItem('xhs_ui_language', this.currentLanguage);
    this.updateUILanguage();
  },

  // Function to update UI language
  updateUILanguage() {
    const updateElementText = (selector, key, suffix = '') => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = this.t(key) + suffix;
      }
    };

    // Update main title
    updateElementText('#xhs-comment-extractor h3', 'commentsExtractor');
    
    // Update buttons
    updateElementText('#checkSubscriptionBtn', 'checkSubscription');
    updateElementText('#debugCheckBtn', 'debugCheck');
    updateElementText('#nextPostBtn', 'nextPost');
    updateElementText('#clickPostBtn', 'clickPost');
    
    const autoBrowseBtn = document.getElementById('autoBrowseBtn');
    if (autoBrowseBtn) {
      autoBrowseBtn.textContent = window.browse.isAutoBrowsing ? 
        this.t('stopAutoBrowse') : this.t('startAutoBrowse');
    }

    // Update labels
    updateElementText('label[for="browseSpeed"]', 'browseSpeed', ':');
    updateElementText('label[for="toggleAutoReply"]', 'autoReply');
    updateElementText('label[for="replyFrequency"]', 'replyFrequency', ':');
    updateElementText('label[for="apiProvider"]', 'apiProvider', ':');
    updateElementText('label[for="apiAddress"]', 'apiAddress', ':');
    updateElementText('label[for="apiKey"]', 'apiKey', ':');
    updateElementText('label[for="prompt1"]', 'prompt1', ':');
    updateElementText('label[for="prompt2"]', 'prompt2', ':');

    // Update select options
    const replyFrequency = document.getElementById('replyFrequency');
    if (replyFrequency) {
      replyFrequency.options[0].textContent = this.t('always');
      replyFrequency.options[1].textContent = this.t('often');
      replyFrequency.options[2].textContent = this.t('sometimes');
      replyFrequency.options[3].textContent = this.t('rarely');
      replyFrequency.options[4].textContent = this.t('veryRarely');
    }

    const apiProvider = document.getElementById('apiProvider');
    if (apiProvider && apiProvider.options[0]) {
      apiProvider.options[0].textContent = this.t('defaultProvider');
    }

    // Update other buttons
    updateElementText('#extractBtn', 'extractComments');
    updateElementText('#copyBtn', 'copyToClipboard');
    updateElementText('#callApiBtn', 'callApi');
    updateElementText('#autoReplyBtn', 'autoReply');

    // Update token credit label
    updateElementText('#token-credit-info span:first-child', 'tokenCredit', ':');

    // Update subscription display if exists
    this.updateSubscriptionDisplay();
  },

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

    // Get saved credentials
    const savedUsername = localStorage.getItem('xhs_saved_username') || '';
    const savedPassword = localStorage.getItem('xhs_saved_password') || '';

    loginContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #333;">${this.t('loginRequired')}</h3>
        <button id="login-lang-btn" style="
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #666;
          padding: 0 4px;
        ">${this.currentLanguage === 'en' ? '🇨🇳' : '🇺🇸'}</button>
      </div>
      <div style="margin-bottom: 15px;">
        <input type="text" id="login-username" value="${savedUsername}" placeholder="${this.t('username')}" style="
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        ">
        <input type="password" id="login-password" value="${savedPassword}" placeholder="${this.t('password')}" style="
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
          margin-bottom: 10px;
        ">${this.t('login')}</button>
        <div style="text-align: center;">
          <a href="${window.apiConfig.getBaseUrl()}/login/" target="_blank" style="
            color: #666;
            text-decoration: none;
            font-size: 12px;
          ">${this.t('registerOrLogin')} →</a>
        </div>
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

    // Add language switch button handler
    const langBtn = document.getElementById('login-lang-btn');
    langBtn.addEventListener('click', () => {
      this.switchLanguage();
      langBtn.textContent = this.currentLanguage === 'en' ? '🇨🇳' : '🇺🇸';
      this.updateLoginUILanguage();
    });

    // Add input event listeners to save credentials while typing
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    usernameInput.addEventListener('input', (e) => {
      localStorage.setItem('xhs_saved_username', e.target.value);
    });

    passwordInput.addEventListener('input', (e) => {
      localStorage.setItem('xhs_saved_password', e.target.value);
    });

    // Add login button handler
    document.getElementById('login-button').addEventListener('click', async () => {
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      
      if (!username || !password) {
        document.getElementById('login-message').textContent = this.t('enterBoth');
        return;
      }

      const loginButton = document.getElementById('login-button');
      const loginMessage = document.getElementById('login-message');
      const subscriptionInfo = document.getElementById('subscription-info');
      
      loginButton.textContent = this.t('loggingIn');
      loginButton.disabled = true;

      const result = await window.auth.handleLogin(username, password);
      
      if (result.success) {
        if (result.subscription) {
          subscriptionInfo.style.display = 'block';
          subscriptionInfo.innerHTML = `
            <div style="color: #4CAF50; margin-bottom: 5px;">✓ ${this.t('subscriptionActive')}</div>
            <div>${this.t('daysRemaining')}: ${result.subscription.days_remaining}</div>
            <div>${this.t('expires')}: ${new Date(result.subscription.end_date).toLocaleDateString()}</div>
          `;
          // Wait 2 seconds to show subscription info before proceeding
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        loginContainer.remove();
        this.createExtensionUI();
      } else {
        loginMessage.textContent = result.message;
        loginButton.textContent = this.t('login');
        loginButton.disabled = false;
      }
    });
  },

  // Function to update login UI language
  updateLoginUILanguage() {
    const loginContainer = document.getElementById('xhs-login-container');
    if (!loginContainer) return;

    const title = loginContainer.querySelector('h3');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const loginButton = document.getElementById('login-button');
    const loginMessage = document.getElementById('login-message');
    const subscriptionInfo = document.getElementById('subscription-info');

    if (title) title.textContent = this.t('loginRequired');
    if (usernameInput) usernameInput.placeholder = this.t('username');
    if (passwordInput) passwordInput.placeholder = this.t('password');
    if (loginButton && !loginButton.disabled) loginButton.textContent = this.t('login');
    if (loginMessage && loginMessage.textContent === this.translations.en.enterBoth) {
      loginMessage.textContent = this.t('enterBoth');
    }

    if (subscriptionInfo && subscriptionInfo.style.display === 'block') {
      const subscription = JSON.parse(localStorage.getItem('xhs_login_state') || '{}').subscription;
      if (subscription) {
        subscriptionInfo.innerHTML = `
          <div style="color: #4CAF50; margin-bottom: 5px;">✓ ${this.t('subscriptionActive')}</div>
          <div>${this.t('daysRemaining')}: ${subscription.days_remaining}</div>
          <div>${this.t('expires')}: ${new Date(subscription.end_date).toLocaleDateString()}</div>
        `;
      }
    }
  },

  // Function to create main extension UI
  async createExtensionUI() {
    this.removeExistingUI();

    // Load saved language preference or use Chinese as default
    const savedLanguage = localStorage.getItem('xhs_ui_language');
    this.currentLanguage = savedLanguage || 'zh';

    // Fetch the UI HTML template
    const response = await fetch(chrome.runtime.getURL('ui.html'));
    const uiHTML = await response.text();

    const uiContainer = document.createElement('div');
    uiContainer.innerHTML = uiHTML;

    // Add language switch button
    const headerButtons = uiContainer.querySelector('#xhs-comment-extractor > div > div:last-child');
    const langBtn = document.createElement('button');
    langBtn.id = 'languageBtn';
    langBtn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      color: #666;
      padding: 0 4px;
    `;
    langBtn.textContent = this.currentLanguage === 'en' ? '🇨🇳' : '🇺🇸';
    headerButtons.insertBefore(langBtn, headerButtons.firstChild);

    document.body.appendChild(uiContainer);

    // Add max-height and scrolling to the UI container
    const container = document.getElementById('xhs-comment-extractor');
    if (container) {
      container.style.maxHeight = '90vh'; // Increase from 800px to 90% of viewport height
      container.style.overflowY = 'auto';
      // Add some padding to account for scrollbar
      container.style.paddingRight = '20px';
      // Ensure the scrollbar looks good across browsers
      container.style.scrollbarWidth = 'thin';
      container.style.scrollbarColor = '#ff2442 #f5f5f5';
      // Add webkit scrollbar styles for Chrome/Safari
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        #xhs-comment-extractor::-webkit-scrollbar {
          width: 8px;
        }
        #xhs-comment-extractor::-webkit-scrollbar-track {
          background: #f5f5f5;
          border-radius: 4px;
        }
        #xhs-comment-extractor::-webkit-scrollbar-thumb {
          background: #ff2442;
          border-radius: 4px;
        }
        #xhs-comment-extractor::-webkit-scrollbar-thumb:hover {
          background: #ff4d66;
        }
      `;
      document.head.appendChild(styleSheet);
    }

    // Initialize all UI elements and event listeners
    this.initializeUI();
    this.updateUILanguage();
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
    let config = window.api.loadConfig();

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
    autoReplySection.style.display = config.autoReplyEnabled ? 'none' : 'block';
    autoBrowseBtn.style.display = config.autoReplyEnabled ? 'block' : 'none';
    
    // Set initial text colors for auto reply toggle
    const manualReplyText = document.getElementById('manual-reply-text');
    const autoReplyText = document.getElementById('auto-reply-text');
    if (config.autoReplyEnabled) {
      manualReplyText.style.color = '#666';
      autoReplyText.style.color = '#ff2442';
    } else {
      manualReplyText.style.color = '#ff2442';
      autoReplyText.style.color = '#666';
    }
    
    replyFrequency.value = config.replyFrequency;

    // Load saved characters
    this.loadCharacters();
    this.updateCharacterList();

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
        defaultAddress = `${window.apiConfig.getBaseUrl()}/api/subscriptions/proxy-deepseek/`;
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
      config = window.api.loadConfig(); // Update local config after saving
    });

    // API key change handler
    apiKey.addEventListener('change', () => {
      config = window.api.loadConfig();
      const newConfig = {
        ...config,
        [apiProvider.value === 'gemini' ? 'geminiApiKey' : 'deepseekApiKey']: apiKey.value
      };
      window.api.saveConfig(newConfig);
      config = window.api.loadConfig(); // Update local config after saving
    });

    // Save configuration when inputs change
    [apiAddress, prompt1, prompt2].forEach(input => {
      input.addEventListener('change', () => {
        config = window.api.loadConfig();
        const newConfig = { ...config };
        if (input === apiAddress) newConfig.apiAddress = input.value;
        if (input === prompt1) newConfig.prompt1 = input.value;
        if (input === prompt2) newConfig.prompt2 = input.value;
        window.api.saveConfig(newConfig);
        config = window.api.loadConfig(); // Update local config after saving
      });
    });

    // Extract and copy buttons
    extractBtn.addEventListener('click', () => {
      const comments = this.extractComments();
      this.displayComments(comments);
    });

    copyBtn.addEventListener('click', () => {
      if (this.currentComments.length === 0) {
        commentCount.textContent = this.t('noCommentsToCopy');
        return;
      }

      const text = this.currentComments
        .map(comment => `${comment.author}: ${comment.content}`)
        .join('\n');
      
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = this.t('copied');
        setTimeout(() => {
          copyBtn.textContent = this.t('copyToClipboard');
        }, 2000);
      }).catch(error => {
        console.error('Failed to copy:', error);
        commentCount.textContent = this.t('failedToCopy');
      });
    });

    // API call and auto-reply buttons
    callApiBtn.addEventListener('click', async () => {
      if (this.currentComments.length === 0) {
        apiResponse.textContent = this.t('pleaseExtractFirst');
        apiResponse.style.display = 'block';
        return;
      }

      try {
        callApiBtn.textContent = this.t('callingApi');
        callApiBtn.disabled = true;
        apiResponse.textContent = this.t('waitingForApi');
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
        callApiBtn.textContent = this.t('callApi');
        callApiBtn.disabled = false;
      }
    });

    autoReplyBtn.addEventListener('click', async () => {
      try {
        autoReplyBtn.textContent = this.t('replying');
        autoReplyBtn.disabled = true;

        await window.browse.autoReply(apiResponse.textContent);

        autoReplyBtn.textContent = this.t('replySent');
        setTimeout(() => {
          autoReplyBtn.textContent = this.t('autoReply');
          autoReplyBtn.disabled = false;
        }, 2000);
      } catch (error) {
        console.error('Auto-reply error:', error);
        autoReplyBtn.textContent = this.t('replyFailed');
        apiResponse.textContent += '\n\n' + this.t('autoReplyFailed').replace('{error}', error.message);
        setTimeout(() => {
          autoReplyBtn.textContent = this.t('autoReply');
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
        autoBrowseBtn.textContent = '开始自动评论';
        autoBrowseBtn.style.backgroundColor = '#9c27b0';
      } else {
        window.browse.isAutoBrowsing = true;
        window.browse.autoBrowseCount = 0;
        autoBrowseBtn.textContent = '停止自动评论';
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
      autoReplySection.style.display = isEnabled ? 'none' : 'block';
      autoBrowseBtn.style.display = isEnabled ? 'block' : 'none';
      
      // Update text colors
      const manualReplyText = document.getElementById('manual-reply-text');
      const autoReplyText = document.getElementById('auto-reply-text');
      
      if (isEnabled) {
        manualReplyText.style.color = '#666';
        autoReplyText.style.color = '#ff2442';
      } else {
        manualReplyText.style.color = '#ff2442';
        autoReplyText.style.color = '#666';
      }
      
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
      
      checkSubscriptionBtn.textContent = this.t('checking');
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
        checkSubscriptionBtn.textContent = this.t('checkSubscription');
        checkSubscriptionBtn.disabled = false;
        debugCheckBtn.disabled = false;
      }
    });

    debugCheckBtn.addEventListener('click', async () => {
      const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
      
      debugCheckBtn.textContent = this.t('checking');
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
        debugCheckBtn.textContent = this.t('debugCheck');
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

    // Add language button handler
    const langBtn = document.getElementById('languageBtn');
    langBtn.addEventListener('click', () => {
      this.switchLanguage();
      langBtn.textContent = this.currentLanguage === 'en' ? '🇨🇳' : '🇺🇸';
    });

    // Add character management event listeners
    const saveCharacterBtn = document.getElementById('saveCharacterBtn');
    if (saveCharacterBtn) {
      saveCharacterBtn.addEventListener('click', () => {
        const name = prompt(this.t('characterName'));
        if (!name) {
          this.showNotification(this.t('enterCharacterName'), 'error');
          return;
        }

        this.saveCharacter(
          name,
          prompt1.value,
          prompt2.value
        );
        this.showNotification(this.t('characterSaved'), 'success');
      });
    }
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
    
    // Return early if elements don't exist (e.g., in login page)
    if (!subscriptionStatus) return;

    if (subscription && subscription.is_active) {
      subscriptionStatus.innerHTML = `
        <span style="color: #4CAF50;">✓ ${this.t('active')}</span> · 
        <span>${subscription.days_remaining} ${this.t('daysLeft')}</span> · 
        <span>${this.t('expires')}: ${new Date(subscription.end_date).toLocaleDateString()}</span>
      `;
    } else {
      subscriptionStatus.innerHTML = `
        <span style="color: #f44336;">✗ ${this.t('inactive')}</span>
      `;
    }

    if (lastCheckInfo && debugInfo) {
      lastCheckInfo.innerHTML = `
        <div style="font-size: 11px; color: #666;">
          ${window.auth.getLastCheckInfo()}
          ${debugInfo.isDebugCheck ? ` (${this.t('debugMode')})` : ''}
        </div>
      `;
    }
  },

  // Add character management functions
  characters: [],

  loadCharacters() {
    try {
      const savedCharacters = localStorage.getItem('xhs_characters');
      if (!savedCharacters || savedCharacters === '[]') {
        // Default character presets
        this.characters = [
          {
            name: '热情友好',
            prompt1: '你是一个热情友好的小红书用户，喜欢与他人互动和分享。语气温暖亲切，经常使用"亲"、"宝贝"等称呼。回复要真诚、积极、富有同理心。',
            prompt2: '请根据以上评论，以热情友好的语气回复。回复要体现关心和支持，同时保持真诚自然。可以适当使用emoji表情增加亲和力。回复在15字以内。'
          },
          {
            name: '专业达人',
            prompt1: '你是该领域的资深专家，拥有丰富的专业知识和经验。说话专业、理性、有见地，善于分析和解答问题。',
            prompt2: '请以专业的角度分析评论内容，给出专业、有见地的回应。回复要体现你的专业素养和经验，帮助他人解决问题或提供建议。回复在15字以内。'
          },
          {
            name: '幽默有趣',
            prompt1: '你是一个风趣幽默的评论者，善于活跃气氛，让人感到开心。喜欢用俏皮的语气和创意的表达方式。',
            prompt2: '请用轻松幽默的方式回应评论。可以适当使用梗、双关语或俏皮话，但要把握好度，不能过分。回复在15字以内。'
          }
        ];
        this.saveCharacters();
      } else {
        this.characters = JSON.parse(savedCharacters);
      }
      
      // Ensure characters is always an array
      if (!Array.isArray(this.characters)) {
        console.warn('Characters data was not an array, resetting to empty array');
        this.characters = [];
      }
    } catch (error) {
      console.error('Error loading characters:', error);
      this.characters = [];
    }
  },

  saveCharacters() {
    localStorage.setItem('xhs_characters', JSON.stringify(this.characters));
  },

  saveCharacter(name, prompt1, prompt2) {
    this.characters.push({ name, prompt1, prompt2 });
    this.saveCharacters();
    this.updateCharacterList();
  },

  deleteCharacter(index) {
    this.characters.splice(index, 1);
    this.saveCharacters();
    this.updateCharacterList();
  },

  updateCharacterList() {
    const characterList = document.getElementById('characterList');
    if (!characterList) return;

    if (this.characters.length === 0) {
      characterList.innerHTML = `
        <div style="text-align: center; color: #666; padding: 10px;">
          ${this.t('noCharactersSaved')}
        </div>
      `;
      return;
    }

    // Remove existing event listeners
    const oldCharacterList = characterList.cloneNode(false);
    characterList.parentNode.replaceChild(oldCharacterList, characterList);

    oldCharacterList.innerHTML = this.characters.map((char, index) => `
      <div class="character-item" data-index="${index}" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
      ">
        <span style="font-weight: bold;">${window.utils.escapeHtml(char.name)}</span>
        <div style="display: flex; gap: 8px;">
          <button class="save-character" data-index="${index}" style="
            background: none;
            border: 1px solid #4CAF50;
            color: #4CAF50;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: none;
          ">${this.t('save')}</button>
          <button class="delete-character" data-index="${index}" style="
            background: none;
            border: 1px solid #ff2442;
            color: #ff2442;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">${this.t('deleteCharacter')}</button>
        </div>
      </div>
    `).join('');

    // Add event listeners using event delegation
    oldCharacterList.addEventListener('click', (e) => {
      const characterItem = e.target.closest('.character-item');
      const deleteButton = e.target.closest('.delete-character');
      const saveButton = e.target.closest('.save-character');
      
      if (deleteButton) {
        e.stopPropagation();
        if (confirm(this.t('confirmDelete'))) {
          const index = parseInt(deleteButton.dataset.index);
          this.deleteCharacter(index);
        }
      } else if (saveButton) {
        e.stopPropagation();
        const index = parseInt(saveButton.dataset.index);
        this.updateCharacter(index);
      } else if (characterItem) {
        const index = parseInt(characterItem.dataset.index);
        this.loadCharacter(index);
        
        // Hide all save buttons first
        oldCharacterList.querySelectorAll('.save-character').forEach(btn => btn.style.display = 'none');
        // Show save button for selected character
        const saveButton = characterItem.querySelector('.save-character');
        if (saveButton) saveButton.style.display = 'block';
      }
    });
  },

  loadCharacter(index) {
    const character = this.characters[index];
    if (!character) return;

    const prompt1Input = document.getElementById('prompt1');
    const prompt2Input = document.getElementById('prompt2');
    if (prompt1Input && prompt2Input) {
      prompt1Input.value = character.prompt1;
      prompt2Input.value = character.prompt2;
      
      // Save to config
      const config = window.api.loadConfig();
      window.api.saveConfig({
        ...config,
        prompt1: character.prompt1,
        prompt2: character.prompt2
      });
    }
  },

  updateCharacter(index) {
    const character = this.characters[index];
    if (!character) return;

    const prompt1Input = document.getElementById('prompt1');
    const prompt2Input = document.getElementById('prompt2');
    if (prompt1Input && prompt2Input) {
      character.prompt1 = prompt1Input.value;
      character.prompt2 = prompt2Input.value;
      this.saveCharacters();
      this.showNotification(this.t('characterUpdated'), 'success');
    }
  },

  // Function to show notification
  showNotification(message, type = 'error', duration = 5000) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.xhs-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'xhs-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      transition: opacity 0.3s;
      background-color: ${type === 'error' ? '#ff4d4f' : '#52c41a'};
      color: white;
    `;
    notification.textContent = message;

    // Add to document
    document.body.appendChild(notification);

    // Remove after duration
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  },

  // Function to update status message
  updateStatusMessage(message, type = 'info') {
    const statusMessageElement = document.getElementById('statusMessage');
    const statusMessageArea = document.getElementById('statusMessageArea');
    
    if (!statusMessageElement || !statusMessageArea) return;
    
    // Update the message text
    statusMessageElement.textContent = message;
    
    // Update the styling based on message type
    switch (type) {
      case 'info':
        statusMessageArea.style.backgroundColor = '#f5f5f5';
        statusMessageArea.style.color = '#666';
        break;
      case 'success':
        statusMessageArea.style.backgroundColor = '#f0f9eb';
        statusMessageArea.style.color = '#52c41a';
        break;
      case 'warning':
        statusMessageArea.style.backgroundColor = '#fff7e6';
        statusMessageArea.style.color = '#fa8c16';
        break;
      case 'error':
        statusMessageArea.style.backgroundColor = '#fff1f0';
        statusMessageArea.style.color = '#ff4d4f';
        break;
      case 'processing':
        statusMessageArea.style.backgroundColor = '#e6f7ff';
        statusMessageArea.style.color = '#1890ff';
        break;
      default:
        statusMessageArea.style.backgroundColor = '#f5f5f5';
        statusMessageArea.style.color = '#666';
    }
  }
}; 