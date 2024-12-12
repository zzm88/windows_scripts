     // background.js
     chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'SELECT_FILE') {
            chrome.fileSystem.chooseEntry({
                type: 'openFile',
                accepts: [{ 
                    mimeTypes: ['video/*'],
                    extensions: ['mp4', 'mov', 'flv']
                }],
                suggestedName: request.path
            }, function(fileEntry) {
                if (fileEntry) {
                    fileEntry.file((file) => {
                        // Create a simple object with necessary file properties
                        const fileInfo = {
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            lastModified: file.lastModified
                        };
                        
                        chrome.tabs.sendMessage(sender.tab.id, {
                            type: 'FILE_SELECTED',
                            file: fileInfo
                        });
                    });
                }
            });
            return true; // Keep the message channel open for async response
        }
    });