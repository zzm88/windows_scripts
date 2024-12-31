// Authentication and subscription-related functions
window.auth = {
    isLoggedIn: false,
    userId: null,
    subscriptionInfo: null,
  
    // Function to handle login
    async handleLogin(username, password) {
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
  
          this.isLoggedIn = true;
          this.userId = data.user_id;
          this.subscriptionInfo = data.subscription;
          
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
    },
  
    // Function to check login state
    async checkLoginState() {
      const loginState = localStorage.getItem('xhs_login_state');
      if (loginState) {
        const state = JSON.parse(loginState);
        
        // Check if we need to verify subscription
        if (this.needsSubscriptionCheck()) {
          console.log('Performing daily subscription check...');
          const checkResult = await this.checkSubscription(state.username);
          
          if (!checkResult.success || !checkResult.subscription.is_active) {
            this.handleLogout();
            return false;
          }
        }
        
        this.isLoggedIn = state.isLoggedIn;
        this.userId = state.userId;
        this.subscriptionInfo = state.subscription;
        
        // Check if subscription is still active
        if (!this.subscriptionInfo || !this.subscriptionInfo.is_active) {
          this.handleLogout();
          return false;
        }
        
        // Check if subscription has expired
        const endDate = new Date(this.subscriptionInfo.end_date);
        if (endDate < new Date()) {
          this.handleLogout();
          return false;
        }
      }
      return this.isLoggedIn;
    },
  
    // Function to check if we need to verify subscription
    needsSubscriptionCheck() {
      const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
      if (!loginState.lastSubscriptionCheck) return true;
      
      const lastCheck = new Date(loginState.lastSubscriptionCheck);
      const now = new Date();
      
      // Check if last check was on a different day
      return lastCheck.getDate() !== now.getDate() ||
             lastCheck.getMonth() !== now.getMonth() ||
             lastCheck.getFullYear() !== now.getFullYear();
    },
  
    // Function to check subscription status
    async checkSubscription(username, isDebug = false) {
      try {
        console.log(`[Subscription Check] Starting check for ${username}${isDebug ? ' (Debug Mode)' : ''}`);
        console.log(`[Subscription Check] Current time: ${new Date().toLocaleString()}`);
        console.log(`[Subscription Check] Last check: ${this.getLastCheckInfo()}`);
  
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
    },
  
    // Function to get last check info
    getLastCheckInfo() {
      const loginState = JSON.parse(localStorage.getItem('xhs_login_state') || '{}');
      const lastCheck = loginState.lastSubscriptionCheck;
      if (!lastCheck) return 'Never checked';
      
      const lastCheckDate = new Date(lastCheck);
      const now = new Date();
      const diffHours = Math.round((now - lastCheckDate) / (1000 * 60 * 60));
      
      return `Last check: ${lastCheckDate.toLocaleString()} (${diffHours} hours ago)`;
    },
  
    // Function to handle logout
    handleLogout() {
      this.isLoggedIn = false;
      this.userId = null;
      localStorage.removeItem('xhs_login_state');
      document.getElementById('xhs-comment-extractor')?.remove();
      window.ui.createLoginUI();
    }
  }; 