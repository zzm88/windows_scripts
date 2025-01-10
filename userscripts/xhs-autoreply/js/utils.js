// Utility functions for the extension
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper function to simulate random delay
function randomDelay(min, max, ignoreSpeed = false) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, ignoreSpeed ? delay : delay / window.browseSpeed));
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

// Helper function to wait for element
async function waitForElement(selector, maxAttempts = 10, interval = 500) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const element = document.querySelector(selector);
    if (element && element.offsetParent !== null) {
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error(`Element ${selector} not found or not visible after ${maxAttempts} attempts`);
}

// Function to format last update time
function formatLastUpdate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

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

// Export functions
window.utils = {
  escapeHtml,
  randomDelay,
  simulateKeyboardEvent,
  waitForElement,
  formatLastUpdate,
  simulateScroll
}; 