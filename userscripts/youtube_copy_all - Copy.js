// ==UserScript==
// @name         YouTube Transcript Copier
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add a button to copy YouTube transcripts
// @author       You
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create and add the button
    function addCopyButton() {
        // Check if transcript container exists
        const transcriptContainer = document.querySelector('#lln-vertical-view-subs');
        if (!transcriptContainer) return;

        // Check if button already exists
        if (document.querySelector('#copy-transcript-btn')) return;

        // Create button
        const copyButton = document.createElement('button');
        copyButton.id = 'copy-transcript-btn';
        copyButton.textContent = 'Copy Transcript';
        copyButton.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; padding: 10px;';

        // Add click handler
        copyButton.addEventListener('click', function() {
            const transcriptText = Array.from(document.querySelectorAll('.lln-sub-text'))
                .map(el => el.textContent.trim())
                .filter(text => text) // Remove empty lines
                .join('\n');

            navigator.clipboard.writeText(transcriptText).then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy Transcript';
                }, 2000);
            });
        });

        document.body.appendChild(copyButton);
    }

    // Check periodically for transcript
    const checkInterval = setInterval(() => {
        if (document.querySelector('#lln-vertical-view-subs')) {
            addCopyButton();
            clearInterval(checkInterval);
        }
    }, 1000);
})();