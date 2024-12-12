console.log('Background script initializing...');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background:', request);
    console.log('Sender details:', {
        tabId: sender.tab?.id,
        url: sender.url,
        origin: sender.origin
    });
    
    if (request.action === 'downloadFile') {
        console.log('Starting file download process for:', request.url);
        
        fetch(request.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(data => {
                if (!data || data.byteLength === 0) {
                    throw new Error('Received empty data');
                }
                
                // Convert ArrayBuffer to Base64
                const binary = new Uint8Array(data);
                let base64 = '';
                binary.forEach(byte => {
                    base64 += String.fromCharCode(byte);
                });
                const base64Data = btoa(base64);
                
                console.log('File downloaded and converted to base64, size:', base64Data.length);
                
                sendResponse({ 
                    success: true, 
                    data: base64Data,
                    byteLength: data.byteLength,
                    contentType: 'video/mp4'
                });
            })
            .catch(error => {
                console.error('Download failed:', error);
                sendResponse({ 
                    success: false, 
                    error: error.message 
                });
            });
            
        return true;
    }
    
    if (request.action === 'readFile') {
        console.log('Starting file read process for:', request.filePath);
        
        // Use XMLHttpRequest instead of fetch for local files
        const xhr = new XMLHttpRequest();
        xhr.open('GET', request.filePath, true);
        xhr.responseType = 'arraybuffer';
        
        xhr.onloadstart = function() {
            console.log('XHR load started');
        };
        
        xhr.onprogress = function(event) {
            if (event.lengthComputable) {
                console.log(`Loading progress: ${Math.round((event.loaded / event.total) * 100)}%`);
            }
        };
        
        xhr.onload = function() {
            console.log('XHR load completed, status:', xhr.status);
            if (xhr.status === 200) {
                console.log('File read successfully');
                console.log('Response size:', xhr.response.byteLength, 'bytes');
                sendResponse({ success: true, data: xhr.response });
            } else {
                console.error('Failed to read file');
                console.error('Status:', xhr.status);
                console.error('StatusText:', xhr.statusText);
                sendResponse({ success: false, error: xhr.statusText });
            }
        };
        
        xhr.onerror = function(error) {
            console.error('XHR error occurred:', error);
            console.error('XHR details:', {
                readyState: xhr.readyState,
                status: xhr.status,
                statusText: xhr.statusText
            });
            sendResponse({ success: false, error: 'XHR error' });
        };
        
        xhr.send();
        console.log('XHR request sent');
        return true; // Will respond asynchronously
    }
});

console.log('Background script fully loaded and initialized');