// ==UserScript==
// @name         GitHub Quick Clone
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add button to clone GitHub repos to specific local directory
// @author       Your Name
// @match        https://github.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Only run on repository pages
    if (!window.location.pathname.match(/\/[^\/]+\/[^\/]+$/)) return;

    // Get repository name from URL
    const repoName = window.location.pathname.split('/').pop();

    // Create the clone button
    const cloneButton = document.createElement('button');
    cloneButton.textContent = `Clone to Documents/${repoName}`;
    cloneButton.className = 'btn btn-sm';
    cloneButton.style.marginLeft = '8px';

    // Add click handler
    cloneButton.addEventListener('click', () => {
        const clonePath = `C:\\Users\\zzm88\\Documents\\${repoName}`;
        const repoUrl = window.location.href + '.git';
        
        // Create command to execute
        const command = `git clone ${repoUrl} "${clonePath}"`;
        
        // Copy command to clipboard
        navigator.clipboard.writeText(command);
        
        // Notify user
        alert(`Command copied to clipboard:\n${command}\n\nPlease paste and run in your terminal.`);
    });

    // Insert button next to the existing clone button
    const targetContainer = document.querySelector('[data-target="get-repo.modal"]')?.parentElement;
    if (targetContainer) {
        targetContainer.appendChild(cloneButton);
    }
})();