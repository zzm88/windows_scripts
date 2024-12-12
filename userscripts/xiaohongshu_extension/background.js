console.log('Background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background:', request);
    
    if (request.action === 'readFile') {
        console.log('Reading file:', request.filePath);
        
        // Use XMLHttpRequest instead of fetch for local files
        const xhr = new XMLHttpRequest();
        xhr.open('GET', request.filePath, true);
        xhr.responseType = 'arraybuffer';
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('File read successfully, size:', xhr.response.byteLength);
                sendResponse({ success: true, data: xhr.response });
            } else {
                console.error('Failed to read file:', xhr.statusText);
                sendResponse({ success: false, error: xhr.statusText });
            }
        };
        
        xhr.onerror = function() {
            console.error('XHR error');
            sendResponse({ success: false, error: 'XHR error' });
        };
        
        xhr.send();
        return true; // Will respond asynchronously
    }
});