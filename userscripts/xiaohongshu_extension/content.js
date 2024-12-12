const container = document.createElement('div');
Object.assign(container.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '20px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 10000
});

const pathInput = document.createElement('input');
pathInput.placeholder = 'Enter video file path';
pathInput.style.width = '200px';
pathInput.style.marginRight = '10px';

const startButton = document.createElement('button');
startButton.textContent = 'Start';
startButton.style.padding = '5px 10px';

// Add status display
const statusDiv = document.createElement('div');
statusDiv.style.marginTop = '10px';
statusDiv.style.color = '#666';

startButton.onclick = async () => {
    try {
        statusDiv.textContent = 'Clicking start button...';
        const path = pathInput.value;
        if (!path) {
            statusDiv.textContent = 'Please enter a file path';
            return;
        }

        // Find the upload input - try multiple possible selectors
        const uploadInput = document.querySelector('.upload-input') || 
                          document.querySelector('input[type="file"]') ||
                          document.querySelector('input[accept*="video"]');

        if (!uploadInput) {
            statusDiv.textContent = 'Upload input not found! Please make sure you are on the correct page.';
            console.error('Upload input not found');
            return;
        }

        statusDiv.textContent = 'Found upload input, sending file select message...';
        console.log('Upload input found:', uploadInput);

        chrome.runtime.sendMessage({
            type: 'SELECT_FILE',
            path: path
        });
    } catch (error) {
        statusDiv.textContent = 'Error: ' + error.message;
        console.error('Error:', error);
    }
};

// Add message listener for file selection response
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message);
    
    if (message.type === 'FILE_SELECTED' && message.file) {
        statusDiv.textContent = 'File selected: ' + message.file.name;
        
        try {
            const uploadInput = document.querySelector('.upload-input') || 
                              document.querySelector('input[type="file"]') ||
                              document.querySelector('input[accept*="video"]');

            if (!uploadInput) {
                statusDiv.textContent = 'Upload input not found after file selection';
                return;
            }

            // Create a new File object from the selected file
            const file = new File(
                [new Blob([''], { type: message.file.type })], // temporary blob
                message.file.name,
                {
                    type: message.file.type,
                    lastModified: message.file.lastModified
                }
            );

            // Create a DataTransfer object and add the file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            // Set the files property of the upload input
            uploadInput.files = dataTransfer.files;

            // Dispatch change event to trigger the upload
            const event = new Event('change', { bubbles: true });
            uploadInput.dispatchEvent(event);

            statusDiv.textContent = 'File upload triggered';
        } catch (error) {
            statusDiv.textContent = 'Error during file upload: ' + error.message;
            console.error('Upload error:', error);
        }
    }
});

container.appendChild(pathInput);
container.appendChild(startButton);
container.appendChild(statusDiv);
document.body.appendChild(container);

// Log when the script is loaded
console.log('XHS File Selector content script loaded');