// Load saved input when popup opens
document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.getElementById('videoInput');
    const videoPath = document.getElementById('videoPath');
    const promptInput = document.getElementById('promptInput');
    const promptInput2 = document.getElementById('promptInput2');
    const apiAddressInput = document.getElementById('apiAddressInput');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const titleInput = document.getElementById('titleInput');
    const contentInput = document.getElementById('contentInput');
    
    // Load saved values
    chrome.storage.local.get([
        'videoFilename',
        'promptText',
        'promptText2',
        'apiAddress',
        'apiKey',
        'titleText',
        'contentText'
    ], (result) => {
        if (result.videoFilename) {
            videoInput.value = result.videoFilename;
            updateVideoPath(result.videoFilename);
        }
        if (result.promptText) {
            promptInput.value = result.promptText;
        }
        if (result.promptText2) {
            promptInput2.value = result.promptText2;
        }
        if (result.apiAddress) {
            apiAddressInput.value = result.apiAddress;
        }
        if (result.apiKey) {
            apiKeyInput.value = result.apiKey;
        }
        if (result.titleText) {
            titleInput.value = result.titleText;
        }
        if (result.contentText) {
            contentInput.value = result.contentText;
        }
    });

    // Setup password toggle
    const togglePassword = document.querySelector('.toggle-password');
    togglePassword.addEventListener('click', function() {
        const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        apiKeyInput.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁️' : '🔒';
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

// Save input values when they change
function saveInputValue(element, key) {
    element.addEventListener('input', (event) => {
        const value = event.target.value;
        chrome.storage.local.set({
            [key]: value
        });
    });
}

// Setup persistence for all inputs
document.addEventListener('DOMContentLoaded', () => {
    saveInputValue(document.getElementById('videoInput'), 'videoFilename');
    saveInputValue(document.getElementById('promptInput'), 'promptText');
    saveInputValue(document.getElementById('promptInput2'), 'promptText2');
    saveInputValue(document.getElementById('apiAddressInput'), 'apiAddress');
    saveInputValue(document.getElementById('apiKeyInput'), 'apiKey');
    saveInputValue(document.getElementById('titleInput'), 'titleText');
    saveInputValue(document.getElementById('contentInput'), 'contentText');
});

// Function to fill content from API response
async function processApiResponseAndFill(assistantMessage) {
    const titleInput = document.getElementById('titleInput');
    const contentInput = document.getElementById('contentInput');
    
    // Parse the response to extract title and content
    const titleMatch = assistantMessage.match(/Title:(.*?)(?=Content:|$)/s);
    const contentMatch = assistantMessage.match(/Content:(.*?)$/s);
    
    if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1].trim();
        titleInput.value = title;
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (contentMatch && contentMatch[1]) {
        const content = contentMatch[1].trim();
        contentInput.value = content;
        contentInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Trigger the fill content function
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, {
            action: 'fillContent',
            data: {
                title: titleInput.value,
                content: contentInput.value
            }
        }, response => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                return;
            }
            console.log('Content filled successfully:', response);
        });
    } catch (error) {
        console.error('Error filling content:', error);
    }
}

// Add API request functionality
document.getElementById('requestApiBtn').addEventListener('click', async () => {
    console.log('Request API button clicked');
    
    const promptInput = document.getElementById('promptInput');
    const promptInput2 = document.getElementById('promptInput2');
    const apiAddressInput = document.getElementById('apiAddressInput');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiResponse = document.getElementById('apiResponse');
    
    const prompt1 = promptInput.value.trim();
    const prompt2 = promptInput2.value.trim();
    const apiAddress = apiAddressInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    
    // Combine prompts
    const combinedPrompt = prompt2 ? `${prompt1}\n\n${prompt2}` : prompt1;
    
    if (!combinedPrompt || !apiAddress || !apiKey) {
        console.error('Prompt, API address, or API key is empty');
        apiResponse.textContent = 'Error: Please fill in at least one prompt, API address, and API key';
        apiResponse.style.display = 'block';
        return;
    }
    
    try {
        apiResponse.textContent = 'Loading...';
        apiResponse.style.display = 'block';
        
        const response = await fetch(apiAddress, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant. Please format your response in two parts: title and content. Start the title with 'Title:' and the content with 'Content:'"
                    },
                    {
                        role: "user",
                        content: combinedPrompt
                    }
                ],
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Extract the assistant's message from the response
        const assistantMessage = data.choices?.[0]?.message?.content;
        if (assistantMessage) {
            apiResponse.textContent = assistantMessage;
            await processApiResponseAndFill(assistantMessage);
        } else {
            apiResponse.textContent = JSON.stringify(data, null, 2);
        }
        apiResponse.style.display = 'block';
        
    } catch (error) {
        console.error('Error calling API:', error);
        apiResponse.textContent = `Error: ${error.message}`;
        apiResponse.style.display = 'block';
    }
});

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

// Add listener for fill content button
document.getElementById('fillContentBtn').addEventListener('click', async () => {
    console.log('Fill content button clicked');
    
    const titleInput = document.getElementById('titleInput');
    const contentInput = document.getElementById('contentInput');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        console.error('Title or content is empty');
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

        // Then send the message with the content
        chrome.tabs.sendMessage(tab.id, {
            action: 'fillContent',
            data: {
                title: title,
                content: content
            }
        }, response => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                return;
            }
            console.log('Response from content script:', response);
        });
    } catch (error) {
        console.error('Error in filling content:', error);
    }
});

// Add listener for coverImageFound message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in popup:', request);
    
    if (request.action === 'coverImageFound') {
        console.log('Cover image found, triggering API request...');
        // Simulate click on the request API button
        document.getElementById('requestApiBtn').click();
        sendResponse({ success: true });
    }
    return true;
});

console.log('Popup script loaded');