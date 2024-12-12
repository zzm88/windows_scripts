// Load saved selection when popup opens
document.addEventListener('DOMContentLoaded', async () => {
    const videoSelect = document.getElementById('videoSelect');
    
    // Load available videos from extension's videos directory
    const videos = await loadAvailableVideos();
    populateVideoSelect(videos);
    
    // Load saved selection
    chrome.storage.local.get(['selectedVideo'], (result) => {
        if (result.selectedVideo) {
            videoSelect.value = result.selectedVideo;
        }
    });
});

// Save selection when changed
document.getElementById('videoSelect').addEventListener('change', (event) => {
    chrome.storage.local.set({
        selectedVideo: event.target.value
    });
});

// Function to load available videos
async function loadAvailableVideos() {
    const videos = [
        {
            name: "Test Video 1",
            path: "videos/01e6d5bb486e05110103730391b2e623d6_259.mp4video.mp4"
        }
        // Add more videos here as needed
    ];
    return videos;
}

// Function to populate select box
function populateVideoSelect(videos) {
    const videoSelect = document.getElementById('videoSelect');
    
    // Clear existing options except the first one
    while (videoSelect.options.length > 1) {
        videoSelect.remove(1);
    }
    
    // Add video options
    videos.forEach(video => {
        const option = document.createElement('option');
        option.value = video.path;
        option.textContent = video.name;
        videoSelect.appendChild(option);
    });
}

// Modify upload button to use selected video
document.getElementById('uploadBtn').addEventListener('click', async () => {
    console.log('Upload button clicked');
    
    const selectedVideo = document.getElementById('videoSelect').value;
    if (!selectedVideo) {
        console.error('No video selected');
        return;
    }
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Current tab:', tab);

        // First inject the content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        console.log('Content script injected');

        // Then send the message with the selected video path
        chrome.tabs.sendMessage(tab.id, {
            action: 'uploadSelectedVideo',
            videoPath: selectedVideo
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

console.log('Popup script loaded');