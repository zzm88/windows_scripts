// Create and inject UI
async function createExtensionUI() {
  // Fetch the UI HTML template
  const response = await fetch(chrome.runtime.getURL('ui.html'));
  const uiHTML = await response.text();

  const uiContainer = document.createElement('div');
  uiContainer.innerHTML = uiHTML;
  document.body.appendChild(uiContainer);

  // Add event listeners
  const toggleBtn = document.getElementById('toggleExtractor');
  const content = document.getElementById('extractorContent');
  const extractBtn = document.getElementById('extractBtn');
  const copyBtn = document.getElementById('copyBtn');
  const commentList = document.getElementById('commentList');
  const commentCount = document.getElementById('commentCount');
  
  let isCollapsed = false;
  let currentComments = [];

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
  
  console.log(`Total comments extracted: ${results.length}`);
  return results;
}

// Initialize UI when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createExtensionUI);
} else {
  createExtensionUI();
} 