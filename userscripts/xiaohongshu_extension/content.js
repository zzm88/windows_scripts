// Add message listener at the top level
console.log('Content script initializing...');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request);
    console.log('Sender:', sender);
    
    if (request.action === 'triggerUpload') {
      console.log('Triggering upload process...');
      uploadVideo();
      sendResponse({ success: true });
    }
    return true;
  });
  
  function uploadVideo() {
      console.log('=== Starting uploadVideo function ===');
      const filePath = 'file:///C:/Users/zzm88/Downloads/01e6d5bb486e05110103730391b2e623d6_259.mp4video.mp4';
      console.log('File path:', filePath);
      
      console.log('Sending readFile message to background script...');
      chrome.runtime.sendMessage({ 
        action: 'readFile', 
        filePath: filePath 
      }, response => {
        console.log('Received response from background script:', response);
        
        if (response && response.success) {
          try {
            console.log('Response data received, size:', response.data.byteLength, 'bytes');
            
            // Convert ArrayBuffer to Blob
            const blob = new Blob([response.data], { type: 'video/mp4' });
            console.log('Blob created successfully, size:', blob.size, 'bytes');
            
            // Create File object
            const file = new File([blob], "01e6d5bb486e05110103730391b2e623d6_259.mp4video.mp4", {
              type: "video/mp4",
              lastModified: new Date().getTime()
            });
            console.log('File object created:', {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified
            });
      
            // Create DataTransfer
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            console.log('DataTransfer object created with file');
      
            // Find upload input
            const uploadInput = document.querySelector('.upload-input');
            console.log('Upload input element:', uploadInput);
            
            if (!uploadInput) {
              throw new Error('Upload input element not found in DOM');
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
            console.log('Files set on input:', {
              filesCount: uploadInput.files.length,
              firstFileName: uploadInput.files[0]?.name
            });
    
            // Dispatch the drop event
            uploadInput.dispatchEvent(dropEvent);
            console.log('Drop event dispatched successfully');
    
            // Trigger change event
            const changeEvent = new Event('change', {
                bubbles: true
            });
            uploadInput.dispatchEvent(changeEvent);
            console.log('Change event dispatched successfully');
            
          } catch (error) {
            console.error('Error in upload process:', error);
            console.error('Error stack:', error.stack);
          }
        } else {
          console.error('Failed to read file:', response ? response.error : 'No response received');
        }
      });
      console.log('ReadFile message sent to background script');
  }
  
  console.log('Content script fully loaded and initialized');