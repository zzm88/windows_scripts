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
                console.log('ArrayBuffer received:', {
                    byteLength: data.byteLength,
                    isArrayBuffer: data instanceof ArrayBuffer
                });
                
                if (!data || data.byteLength === 0) {
                    throw new Error('Received empty data');
                }
                
                // Convert ArrayBuffer to Base64
                const base64 = btoa(
                    new Uint8Array(data)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                
                console.log('File downloaded successfully, size:', data.byteLength);
                sendResponse({ 
                    success: true, 
                    data: base64,
                    contentType: 'video/mp4'
                });
            })
            .catch(error => {
                console.error('Download failed:', {
                    message: error.message,
                    stack: error.stack
                });
                sendResponse({ 
                    success: false, 
                    error: error.message 
                });
            });
            
        return true; // Will respond asynchronously
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