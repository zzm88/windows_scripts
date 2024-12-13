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
    
    if (request.action === 'fillContent') {
        console.log('Filling content with:', request.data);
        fillTitleAndContent(request.data);
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
  
  function downloadAndLogFile() {
      console.log('=== Starting downloadAndLogFile function ===');
      const fileUrl = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';
      
      console.log('Sending downloadFile message to background script...');
      chrome.runtime.sendMessage({ 
          action: 'downloadFile', 
          url: fileUrl 
      }, response => {
          console.log('Raw response from background script:', {
              success: response.success,
              byteLength: response.byteLength,
              contentType: response.contentType
          });
          
          if (response && response.success && response.data) {
              // Convert base64 back to ArrayBuffer
              const binaryString = atob(response.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
              }
              const arrayBuffer = bytes.buffer;
              
              console.log('Download successful!');
              console.log('ArrayBuffer created, size:', arrayBuffer.byteLength, 'bytes');
              
              // Create a Blob from the downloaded data
              const blob = new Blob([arrayBuffer], { 
                  type: response.contentType || 'video/mp4' 
              });
              console.log('Blob created:', {
                  size: blob.size,
                  type: blob.type
              });

              // Create an object URL to verify the video
              const url = URL.createObjectURL(blob);
              console.log('Created blob URL:', url);

              // Rest of your video testing code...
          } else {
              console.error('Download failed:', response ? response.error : 'No response');
              console.error('Full response:', response);
          }
      });
  }
  
  // Add message listener for the new action
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Message received in content script:', request);
      
      if (request.action === 'triggerDownload') {
          console.log('Triggering download process...');
          downloadAndLogFile();
          sendResponse({ success: true });
      }
      // ... existing message handlers ...
      return true;
  });
  
  // Add to your existing message listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Message received in content script:', request);
      
      if (request.action === 'downloadAndUpload') {
          console.log('Triggering download and upload process...');
          downloadAndUploadVideo();
          sendResponse({ success: true });
      }
      return true;
  });
  
  // Add new function that combines download and upload
  function downloadAndUploadVideo() {
      console.log('=== Starting downloadAndUploadVideo function ===');
      const fileUrl = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';
      
      console.log('Sending downloadFile message to background script...');
      chrome.runtime.sendMessage({ 
          action: 'downloadFile', 
          url: fileUrl 
      }, function(response) {
          console.log('Raw response from background script:', {
              success: response?.success,
              hasData: !!response?.data,
              dataType: response?.data ? typeof response.data : 'none',
              contentType: response?.contentType
          });
          
          if (response?.success && response?.data) {
              try {
                  // Convert Base64 back to ArrayBuffer
                  const binaryString = atob(response.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                      bytes[i] = binaryString.charCodeAt(i);
                  }
                  const arrayBuffer = bytes.buffer;
                  
                  console.log('Download successful!');
                  console.log('ArrayBuffer received, size:', arrayBuffer.byteLength, 'bytes');
                  
                  // Create a Blob from the downloaded data
                  const blob = new Blob([arrayBuffer], { 
                      type: response.contentType || 'video/mp4' 
                  });
                  console.log('Blob created:', {
                      size: blob.size,
                      type: blob.type
                  });

                  // Create File object
                  const file = new File([blob], "test_video.mp4", {
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
              console.error('Download failed:', response?.error || 'No response');
              console.error('Full response:', response);
          }
      });
  }
  
  function readLocalFile() {
      console.log('=== Starting readLocalFile function ===');
      
      // Get extension URL for the video file
      const extensionUrl = chrome.runtime.getURL('videos/01e6d5bb486e05110103730391b2e623d6_259.mp4video.mp4');
      console.log('Extension file URL:', extensionUrl);
      
      // Use fetch to read the file
      fetch(extensionUrl)
          .then(response => {
              console.log('Fetch response received:', {
                  ok: response.ok,
                  status: response.status,
                  statusText: response.statusText
              });
              
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.arrayBuffer();
          })
          .then(data => {
              console.log('File read successfully!');
              console.log('File size:', data.byteLength, 'bytes');
              
              // Create a Blob to verify the data
              const blob = new Blob([data], { type: 'video/mp4' });
              console.log('Blob created:', {
                  size: blob.size,
                  type: blob.type
              });

              // Create an object URL to verify the video
              const url = URL.createObjectURL(blob);
              console.log('Created blob URL:', url);

              // Optional: Create a video element to test the blob
              const video = document.createElement('video');
              video.src = url;
              video.controls = true;
              video.style.display = 'none';
              document.body.appendChild(video);
              
              // Test if video is playable
              video.addEventListener('loadedmetadata', () => {
                  console.log('Video metadata loaded:', {
                      duration: video.duration,
                      videoWidth: video.videoWidth,
                      videoHeight: video.videoHeight
                  });
                  document.body.removeChild(video);
              });
              
              video.addEventListener('error', (e) => {
                  console.error('Video load error:', video.error);
                  document.body.removeChild(video);
              });
          })
          .catch(error => {
              console.error('Error reading local file:', error);
              console.error('Error stack:', error.stack);
          });
  }
  
  // Add to your existing message listeners
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Message received in content script:', request);
      
      if (request.action === 'readLocalFile') {
          console.log('Triggering local file read...');
          readLocalFile();
          sendResponse({ success: true });
      }
      return true;
  });
  
  // Add new function for uploading selected video
  function uploadSelectedVideo(videoPath) {
      console.log('=== Starting uploadSelectedVideo function ===');
      
      // Get extension URL for the video file
      const extensionUrl = chrome.runtime.getURL(videoPath);
      console.log('Extension file URL:', extensionUrl);
      
      // Use fetch to read the file
      fetch(extensionUrl)
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.arrayBuffer();
          })
          .then(data => {
              console.log('File read successfully!');
              console.log('File size:', data.byteLength, 'bytes');
              
              // Create a Blob from the downloaded data
              const blob = new Blob([data], { type: 'video/mp4' });
              console.log('Blob created:', {
                  size: blob.size,
                  type: blob.type
              });

              // Create File object
              const file = new File([blob], videoPath.split('/').pop(), {
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
              
          })
          .catch(error => {
              console.error('Error in upload process:', error);
              console.error('Error stack:', error.stack);
          });
  }

  // Add to your existing message listeners
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Message received in content script:', request);
      
      if (request.action === 'uploadSelectedVideo') {
          console.log('Triggering selected video upload...');
          uploadSelectedVideo(request.videoPath);
          sendResponse({ success: true });
      }
      return true;
  });
  
  function addCoverImgListener() {
      console.log('=== Starting addCoverImgListener function ===');
      
      // Function to check for coverImg
      function checkForCoverImg() {
          console.log('Checking for cover image...');
          const coverImg = document.querySelector('.coverImg');
          
          if (coverImg) {
              console.log('Cover image found!', {
                  element: coverImg,
                  src: coverImg.src,
                  timestamp: new Date().toISOString()
              });
              
              // Send message to popup to trigger API request
              chrome.runtime.sendMessage({ 
                  action: 'coverImageFound',
                  coverImgSrc: coverImg.src 
              }, response => {
                  if (chrome.runtime.lastError) {
                      console.error('Error sending message:', chrome.runtime.lastError);
                      return;
                  }
                  console.log('Cover image found message sent:', response);
              });

              // Stop checking once found
              if (window._coverImgInterval) {
                  clearInterval(window._coverImgInterval);
                  delete window._coverImgInterval;
              }
          } else {
              console.log('Cover image not found', {
                  timestamp: new Date().toISOString()
              });
          }
      }

      // Start periodic checking
      const intervalId = setInterval(checkForCoverImg, 3000);
      console.log('Cover image listener started with interval ID:', intervalId);

      // Store interval ID in window to allow stopping if needed
      window._coverImgInterval = intervalId;

      // Optional: Add function to stop the listener
      window.stopCoverImgListener = function() {
          if (window._coverImgInterval) {
              clearInterval(window._coverImgInterval);
              console.log('Cover image listener stopped');
          }
      };
  }

  // Add to your existing message listeners
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Message received in content script:', request);
      
      if (request.action === 'addCoverImgListener') {
          console.log('Adding cover image listener...');
          // Clear existing interval if any
          if (window._coverImgInterval) {
              clearInterval(window._coverImgInterval);
          }
          addCoverImgListener();
          sendResponse({ success: true });
      } else if (request.action === 'stopCoverImgListener') {
          console.log('Stopping cover image listener...');
          if (window._coverImgInterval) {
              clearInterval(window._coverImgInterval);
              delete window._coverImgInterval;
          }
          sendResponse({ success: true });
      }
      return true;
  });
  
  function fillTitleAndContent(data) {
      try {
          // Find the title input
          const titleInput = document.querySelector('input.d-text[placeholder*="标题"]');
          if (titleInput) {
              titleInput.value = data.title;
              titleInput.dispatchEvent(new Event('input', { bubbles: true }));
              console.log('Title filled successfully');
          } else {
              console.error('Title input not found');
          }

          // Find the content editor
          const contentEditor = document.querySelector('.ql-editor[contenteditable="true"]');
          if (contentEditor) {
              contentEditor.innerHTML = data.content.split('\n').map(line => `<p>${line}</p>`).join('');
              contentEditor.dispatchEvent(new Event('input', { bubbles: true }));
              console.log('Content filled successfully');
          } else {
              console.error('Content editor not found');
          }
      } catch (error) {
          console.error('Error filling content:', error);
      }
  }
  
  console.log('Content script fully loaded and initialized');