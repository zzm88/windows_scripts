// Load saved input when popup opens
document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.getElementById('videoInput');
    const videoPath = document.getElementById('videoPath');
    
    // Load saved filename
    chrome.storage.local.get(['videoFilename'], (result) => {
        if (result.videoFilename) {
            videoInput.value = result.videoFilename;
            updateVideoPath(result.videoFilename);
        }
    });
});

// Update and save input when changed
document.getElementById('videoInput').addEventListener('input', (event) => {
    const filename = event.target.value;
    updateVideoPath(filename);
    
    chrome.storage.local.set({
        videoFilename: filename
    });
});

// Function to update the video path display
function updateVideoPath(filename) {
    const videoPath = document.getElementById('videoPath');
    if (filename) {
        const fullPath = `videos/${filename}`;
        videoPath.textContent = fullPath;
        videoPath.style.display = 'block';
    } else {
        videoPath.style.display = 'none';
    }
}

// Modify upload button to use input value
document.getElementById('uploadBtn').addEventListener('click', async () => {
    console.log('Upload button clicked');
    
    const filename = document.getElementById('videoInput').value.trim();
    if (!filename) {
        console.error('No filename entered');
        return;
    }
    
    const videoPath = `videos/${filename}`;
    console.log('Video path:', videoPath);
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Current tab:', tab);

        // First inject the content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        console.log('Content script injected');

        // Then send the message with the video path
        chrome.tabs.sendMessage(tab.id, {
            action: 'uploadSelectedVideo',
            videoPath: videoPath
        }, response => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                return;
            }
            console.log('Response from content script:', response);
        });
    } catch (error) {
        console.error('Error:', error);
    }
});

// Add new event listener for test read file button
document.getElementById('testReadFileBtn').addEventListener('click', async () => {
    console.log('Test download file button clicked');
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Current tab:', tab);

        // First inject the content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        console.log('Content script injected');

        // Then send the message
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

// Add new event listener for test read local file button
document.getElementById('testReadLocalFileBtn').addEventListener('click', async () => {
    console.log('Test read local file button clicked');
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Current tab:', tab);

        // First inject the content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        console.log('Content script injected');

        // Then send the message
        chrome.tabs.sendMessage(tab.id, {
            action: 'readLocalFile'
        }, response => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                return;
            }
            console.log('Response from content script:', response);
        });
    } catch (error) {
        console.error('Error in test read local:', error);
    }
});

// Add listener for the new button
document.getElementById('addCoverImgListenerBtn').addEventListener('click', async () => {
    console.log('Add cover image listener button clicked');
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Current tab:', tab);

        // First inject the content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        console.log('Content script injected');

        // Then send the message to add the listener
        chrome.tabs.sendMessage(tab.id, {
            action: 'addCoverImgListener'
        }, response => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                return;
            }
            console.log('Response from content script:', response);
        });
    } catch (error) {
        console.error('Error adding cover image listener:', error);
    }
});

// Add stop listener button handler
document.getElementById('stopCoverImgListenerBtn').addEventListener('click', async () => {
    console.log('Stop cover image listener button clicked');
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Current tab:', tab);

        // Send the message to stop the listener
        chrome.tabs.sendMessage(tab.id, {
            action: 'stopCoverImgListener'
        }, response => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                return;
            }
            console.log('Response from content script:', response);
        });
    } catch (error) {
        console.error('Error stopping cover image listener:', error);
    }
});

console.log('Popup script loaded');