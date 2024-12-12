// ==UserScript==
// @name         GitHub Quick Clone
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add a button to quickly clone GitHub repos to a specific local folder
// @author       You
// @match        https://github.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Only run on repository pages
    if (!window.location.pathname.includes('/')){
        return;
    }

    const baseClonePath = 'C:\\Users\\zzm88\\Documents';
    
    function addCloneButton() {
        // Find the repository name
        const repoName = window.location.pathname.split('/')[2];
        if (!repoName) return;

        // Find the clone button group
        const cloneButtonGroup = document.querySelector('get-repo');
        if (!cloneButtonGroup) return;

        // Create our custom clone button
        const quickCloneBtn = document.createElement('button');
        quickCloneBtn.className = 'btn btn-sm';
        quickCloneBtn.innerHTML = '🖥️ Clone to Documents';
        quickCloneBtn.style.marginLeft = '8px';

        // Add click handler
        quickCloneBtn.addEventListener('click', () => {
            const cloneUrl = `https://github.com${window.location.pathname}.git`;
            const command = `start cmd /K "cd ${baseClonePath} && git clone ${cloneUrl}"`;
            
            // Execute the clone command
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'file:///' + command.replace(/\\/g, '/'),
                onload: function(response) {
                    console.log('Clone initiated');
                }
            });
        });

        // Add button to the page
        cloneButtonGroup.appendChild(quickCloneBtn);
    }

    // Run when page loads
    addCloneButton();

    // Watch for navigation changes (for single page app navigation)
    const observer = new MutationObserver(() => {
        addCloneButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();