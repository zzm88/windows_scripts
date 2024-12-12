// Add message listener at the top level
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request);
    if (request.action === 'triggerUpload') {
      console.log('Triggering upload...');
      uploadVideo();
      sendResponse({ success: true });
    }
    return true;
  });
  
  function uploadVideo() {
      console.log('uploadVideo function called');
      const filePath = 'file:///C:/Users/zzm88/Downloads/01e6d5bb486e05110103730391b2e623d6_259.mp4video.mp4';
      
      console.log('Sending readFile message...');
      chrome.runtime.sendMessage({ 
        action: 'readFile', 
        filePath: filePath 
      }, response => {
        console.log('Got response from background:', response);
        
        if (response && response.success) {
          try {
            console.log('Response data size:', response.data.byteLength);
            
            // Convert ArrayBuffer to Blob
            const blob = new Blob([response.data], { type: 'video/mp4' });
            console.log('Blob created, size:', blob.size);
            
            // Create File object
            const file = new File([blob], "01e6d5bb486e05110103730391b2e623d6_259.mp4video.mp4", {
              type: "video/mp4",
              lastModified: new Date().getTime()
            });
            console.log('File object created:', file);
      
            // Create DataTransfer
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
      
            // Find upload input
            const uploadInput = document.querySelector('.upload-input');
            console.log('Found upload input:', uploadInput);
            
            if (!uploadInput) {
              throw new Error('Upload input not found');
            }
            
            // Create and dispatch drop event
            const dropEvent = new DragEvent('drop', {
                dataTransfer: dataTransfer,
                bubbles: true,
                cancelable: true
            });
            console.log('Drop event created');
    
            // Simulate file drop
            uploadInput.files = dataTransfer.files;
            console.log('Files set on input');
    
            // Dispatch the drop event
            uploadInput.dispatchEvent(dropEvent);
            console.log('Drop event dispatched');
    
            // Trigger change event
            const changeEvent = new Event('change', {
                bubbles: true
            });
            uploadInput.dispatchEvent(changeEvent);
            console.log('Change event dispatched');
            
          } catch (error) {
            console.error('Error in upload process:', error);
          }
        } else {
          console.error('Failed to read file:', response ? response.error : 'No response');
        }
      });
      console.log('ReadFile message sent');
  }
  
  // Log when content script loads
  console.log('Content script loaded');