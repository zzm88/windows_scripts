// Add CSS styles for selected posts
const styles = `
  .post-selected {
    border: 3px solid #ff2442 !important;
    box-shadow: 0 0 10px rgba(255, 36, 66, 0.5);
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize extension
async function initializeExtension() {
  const isLoggedIn = await window.auth.checkLoginState();
  if (isLoggedIn) {
    window.ui.createExtensionUI();
  } else {
    window.ui.createLoginUI();
  }
}

// Start initialization when the page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
} 