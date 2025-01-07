// API-related functions

// Configuration object for API settings
window.apiConfig = {
  baseDomain: localStorage.getItem('xhs_base_domain') || 'rednote.online',
  setBaseDomain(domain) {
    this.baseDomain = domain;
    localStorage.setItem('xhs_base_domain', domain);
  },
  getBaseUrl() {
    return `https://${this.baseDomain}`;
  }
};

window.api = {
  // Load saved configuration from storage
  loadConfig() {
    const config = {
      apiProvider: localStorage.getItem('xhs_api_provider') || 'default',
      apiAddress: localStorage.getItem('xhs_api_address') || `${window.apiConfig.getBaseUrl()}/api/subscriptions/proxy-deepseek/`,
      deepseekApiKey: localStorage.getItem('xhs_deepseek_api_key') || '',
      geminiApiKey: localStorage.getItem('xhs_gemini_api_key') || '',
      prompt1: localStorage.getItem('xhs_prompt1') || '',
      prompt2: localStorage.getItem('xhs_prompt2') || '',
      autoReplyEnabled: localStorage.getItem('xhs_auto_reply_enabled') === 'true',
      replyFrequency: localStorage.getItem('xhs_reply_frequency') || '1.0'
    };
    return config;
  },

  // Save configuration to storage
  saveConfig(config) {
    localStorage.setItem('xhs_api_provider', config.apiProvider);
    localStorage.setItem('xhs_api_address', config.apiAddress);
    localStorage.setItem('xhs_deepseek_api_key', config.deepseekApiKey);
    localStorage.setItem('xhs_gemini_api_key', config.geminiApiKey);
    localStorage.setItem('xhs_prompt1', config.prompt1);
    localStorage.setItem('xhs_prompt2', config.prompt2);
    localStorage.setItem('xhs_auto_reply_enabled', config.autoReplyEnabled);
    localStorage.setItem('xhs_reply_frequency', config.replyFrequency);
  },

  // Call the API with prompts and comments
  async callApi(apiAddress, apiKey, prompt1, prompt2, comments) {
    const config = this.loadConfig();
    console.log('API Call Inputs:', {
      provider: config.apiProvider,
      prompt1: prompt1,
      prompt2: prompt2,
      commentsCount: comments.length
    });

    if (config.apiProvider === 'default') {
      return await this.callProxyApi(prompt1, prompt2, comments);
    } else if (config.apiProvider === 'gemini') {
      return await this.callGeminiApi(config.geminiApiKey, prompt1, prompt2, comments);
    } else {
      return await this.callDeepseekApi(apiAddress, config.deepseekApiKey, prompt1, prompt2, comments);
    }
  },

  // Call the proxy API
  async callProxyApi(prompt1, prompt2, comments) {
    const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
    const username = loginState.username;
    
    if (!username) {
      throw new Error('User not logged in');
    }

    const fullPrompt = [
      prompt1,
      prompt2,
      "Comments:",
      ...comments.map(c => `${c.author}: ${c.content}`)
    ].filter(Boolean).join('\n\n');

    try {
      const response = await fetch(`${window.apiConfig.getBaseUrl()}/api/subscriptions/proxy-deepseek/`, {
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
        if (data.subscription_required) {
          const checkResult = await window.auth.checkSubscription(username);
          if (!checkResult.success || !checkResult.subscription.is_active) {
            setTimeout(window.auth.handleLogout, 1000);
          }
        }
        throw new Error(data.message || 'Proxy API call failed');
      }

      // Update token credit display if available
      if (data.tokens_remaining !== undefined && data.token_credit !== undefined) {
        window.ui.updateTokenCreditDisplay(data.tokens_remaining, data.token_credit);
      }

      if (data.data && data.data.choices && data.data.choices[0] && data.data.choices[0].message) {
        return data.data.choices[0].message.content;
      } else {
        throw new Error('Invalid response format from proxy API');
      }
    } catch (error) {
      console.error('Proxy API call error:', error);
      throw error;
    }
  },

  // Call the Gemini API
  async callGeminiApi(apiKey, prompt1, prompt2, comments) {
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
  },

  // Call the DeepSeek API
  async callDeepseekApi(apiAddress, apiKey, prompt1, prompt2, comments) {
    const messages = [];
    messages.push({
      role: "system",
      content: prompt1.trim() || "You are a helpful assistant."
    });

    const userContent = [
      prompt2,
      "Comments:",
      ...comments.map(c => `${c.author}: ${c.content}`)
    ].filter(Boolean).join('\n\n');

    messages.push({
      role: "user",
      content: userContent
    });

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
        throw new Error(`DeepSeek API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data.choices[0].message.content;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }
}; 