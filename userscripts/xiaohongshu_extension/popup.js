document.getElementById('uploadBtn').addEventListener('click', async () => {
  console.log('Upload button clicked');
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('Current tab:', tab);
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      console.log('Executing content script injection');
      const filePath = 'C:/Users/zzm88/Downloads/01e6d5bb486e05110103730391b2e623d6_259.mp4video.mp4';
      console.log('File path:', filePath);
      
      // Create a File object
      const file = new File([''], filePath, {
        type: 'video/mp4'
      });
      console.log('File object created:', file);

      // Create DataTransfer
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      console.log('DataTransfer object created with file');

      // Find upload input
      const uploadInput = document.querySelector('.upload-input');
      console.log('Found upload input element:', uploadInput);

      // Create and dispatch dragenter event
      const dragEnterEvent = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      console.log('Dispatching dragenter event');
      uploadInput.dispatchEvent(dragEnterEvent);

      // Create and dispatch dragover event
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      console.log('Dispatching dragover event');
      uploadInput.dispatchEvent(dragOverEvent);

      // Create and dispatch drop event
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      console.log('Dispatching drop event');
      uploadInput.dispatchEvent(dropEvent);

      // Set files and dispatch change event
      uploadInput.files = dataTransfer.files;
      console.log('Files set on input:', uploadInput.files);
      const changeEvent = new Event('change', { bubbles: true });
      console.log('Dispatching change event');
      uploadInput.dispatchEvent(changeEvent);
    }
  }).then(() => {
    console.log('Script injection completed');
  }).catch(err => {
    console.error('Script injection failed:', err);
  });
});

// Add new event listener for test read file button
document.getElementById('testReadFileBtn').addEventListener('click', async () => {
  console.log('Test download file button clicked');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Current tab:', tab);

    // Send message to trigger download
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