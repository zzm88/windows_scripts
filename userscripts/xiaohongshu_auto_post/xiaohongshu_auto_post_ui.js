// ==UserScript==
// @name         XHS Post Navigator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Navigate through posts with a button
// @match        https://creator.xiaohongshu.com/publish/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create and style the main container
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        borderRadius: '5px',
        zIndex: '10000',
        width: '300px'
    });

    // Input field configurations
    const fields = [
        { label: '视频链径', id: '' },
        
        { label: '文案', id: 'text' },
        { label: 'api-url', id: 'api-url' },
        { label: 'prompt', id: 'prompt', isTextarea: true },
        { label: 'Interval Minutes', id: 'interval-minutes' }
    ];

    // Function to save data to localStorage
    const saveData = () => {
        console.log('Saving data...'); // Debug log
        const data = {
            videoUrl: document.getElementById('video-url').value,
            text: document.getElementById('text').value,
            apiUrl: document.getElementById('api-url').value,
            prompt: document.getElementById('prompt').value,
            intervalMinutes: document.getElementById('interval-minutes').value
        };
        console.log('Data to save:', data); // Debug log
        localStorage.setItem('xhsPostData', JSON.stringify(data));
    };

    // Function to load saved data
    const loadSavedData = () => {
        console.log('Loading saved data...'); // Debug log
        const savedData = localStorage.getItem('xhsPostData');
        console.log('Retrieved data:', savedData); // Debug log
        if (savedData) {
            const data = JSON.parse(savedData);
            const elements = {
                'video-url': data.videoUrl,
                'text': data.text,
                'api-url': data.apiUrl,
                'prompt': data.prompt,
                'interval-minutes': data.intervalMinutes
            };

            // Set values and trigger change events
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element && value !== undefined) {
                    element.value = value || '';
                    // Trigger change event
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }
    };

    // Create input fields
    fields.forEach(field => {
        const label = document.createElement('div');
        label.textContent = field.label;
        label.style.marginBottom = '5px';
        label.style.fontWeight = 'bold';

        const input = field.isTextarea ? 
            document.createElement('textarea') : 
            document.createElement('input');
        
        Object.assign(input.style, {
            width: '100%',
            padding: '8px',
            marginBottom: '15px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            boxSizing: 'border-box'
        });

        if (field.isTextarea) {
            input.style.height = '100px';
            input.style.resize = 'vertical';
        }

        // Add change event listener to save data
        input.addEventListener('input', saveData);
        
        input.id = field.id;
        container.appendChild(label);
        container.appendChild(input);
    });

    // Add preset name input
    const presetNameLabel = document.createElement('div');
    presetNameLabel.textContent = 'Preset Name';
    presetNameLabel.style.marginBottom = '5px';
    presetNameLabel.style.fontWeight = 'bold';

    const presetNameInput = document.createElement('input');
    Object.assign(presetNameInput.style, {
        width: '100%',
        padding: '8px',
        marginBottom: '15px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        boxSizing: 'border-box'
    });

    container.appendChild(presetNameLabel);
    container.appendChild(presetNameInput);

    // Add list box for presets
    const presetList = document.createElement('select');
    presetList.size = 5; // Show 5 items at a time
    Object.assign(presetList.style, {
        width: '100%',
        padding: '8px',
        marginBottom: '15px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        boxSizing: 'border-box'
    });

    container.appendChild(presetList);

    // Function to save a new preset
    const savePreset = () => {
        const presetName = presetNameInput.value.trim();
        if (!presetName) {
            alert('Please enter a preset name.');
            return;
        }

        const data = {
            videoUrl: document.getElementById('video-url').value,
            text: document.getElementById('text').value,
            apiUrl: document.getElementById('api-url').value,
            prompt: document.getElementById('prompt').value,
            intervalMinutes: document.getElementById('interval-minutes').value
        };

        const presets = JSON.parse(localStorage.getItem('xhsPresets') || '{}');
        presets[presetName] = data;
        localStorage.setItem('xhsPresets', JSON.stringify(presets));

        updatePresetList();
    };

    // Function to load a selected preset
    const loadPreset = () => {
        const selectedPreset = presetList.value;
        if (!selectedPreset) return;

        const presets = JSON.parse(localStorage.getItem('xhsPresets') || '{}');
        const data = presets[selectedPreset];
        if (data) {
            document.getElementById('video-url').value = data.videoUrl || '';
            document.getElementById('text').value = data.text || '';
            document.getElementById('api-url').value = data.apiUrl || '';
            document.getElementById('prompt').value = data.prompt || '';
            document.getElementById('interval-minutes').value = data.intervalMinutes || '';
        }
    };

    // Function to delete a selected preset
    const deletePreset = () => {
        const selectedPreset = presetList.value;
        if (!selectedPreset) return;

        const presets = JSON.parse(localStorage.getItem('xhsPresets') || '{}');
        delete presets[selectedPreset];
        localStorage.setItem('xhsPresets', JSON.stringify(presets));

        updatePresetList();
    };

    // Function to update the preset list
    const updatePresetList = () => {
        const presets = JSON.parse(localStorage.getItem('xhsPresets') || '{}');
        presetList.innerHTML = ''; // Clear existing options
        Object.keys(presets).forEach(presetName => {
            const option = document.createElement('option');
            option.value = presetName;
            option.textContent = presetName;
            presetList.appendChild(option);
        });
    };

    // Add buttons for adding and deleting presets
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Preset';
    Object.assign(addButton.style, {
        width: '48%',
        padding: '10px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '4%'
    });
    addButton.addEventListener('click', savePreset);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Preset';
    Object.assign(deleteButton.style, {
        width: '48%',
        padding: '10px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    });
    deleteButton.addEventListener('click', deletePreset);

    container.appendChild(addButton);
    container.appendChild(deleteButton);

    // Load saved data and presets when the script initializes
    loadSavedData();
    updatePresetList();

    // Add event listener to load preset on selection
    presetList.addEventListener('change', loadPreset);

    // Add submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    Object.assign(submitButton.style, {
        width: '100%',
        padding: '10px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    });

    submitButton.addEventListener('click', () => {
        const data = {
            videoUrl: document.getElementById('video-url').value,
            text: document.getElementById('text').value,
            apiUrl: document.getElementById('api-url').value,
            prompt: document.getElementById('prompt').value,
            intervalMinutes: document.getElementById('interval-minutes').value
        };
        
        const autoPost = new XHSAutoPost();
        autoPost.startPosting(data);
    });

    container.appendChild(submitButton);

    // Add the container to the page
    document.body.appendChild(container);
})();