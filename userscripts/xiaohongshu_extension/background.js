console.log('Background script initializing...');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background:', request);
    console.log('Sender details:', {
        tabId: sender.tab?.id,
        url: sender.url,
        origin: sender.origin
    });
    
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