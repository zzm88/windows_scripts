document.getElementById('uploadBtn').addEventListener('click', async () => {
  console.log('Upload button clicked');
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('Current tab:', tab);
  
  try {
    // First inject the content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    console.log('Content script injected');

    // Then send the message
    chrome.tabs.sendMessage(tab.id, {
      action: 'downloadAndUpload'
    }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
        return;
      }
      console.log('Response from content script:', response);
    });
  } catch (error) {
    console.error('Error:', error);
  }
});

// Add new event listener for test read file button
document.getElementById('testReadFileBtn').addEventListener('click', async () => {
  console.log('Test download file button clicked');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Current tab:', tab);

    // First inject the content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    console.log('Content script injected');

    // Then send the message
    chrome.tabs.sendMessage(tab.id, {
      action: 'triggerDownload'
    }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
        return;
      }
      console.log('Response from content script:', response);
    });
  } catch (error) {
    console.error('Error in test download:', error);
  }
});

console.log('Popup script loaded');