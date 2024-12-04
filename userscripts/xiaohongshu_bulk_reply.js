// ==UserScript==
// @name         XHS Post Navigator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Navigate through posts with a button
// @match        https://*.xiaohongshu.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let currentIndex = -1;
    const SELECTED_CLASS = 'post-selected';

    // Add custom styles
    const styles = `
        .nav-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #ff2442;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            z-index: 9999;
        }
        
        .click-button {
            position: fixed;
            bottom: 20px;
            right: 120px;  /* Position to the left of nav button */
            padding: 10px 20px;
            background: #2442ff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            z-index: 9999;
        }
        
        .post-selected {
            border: 3px solid #ff2442 !important;
            box-shadow: 0 0 10px rgba(255, 36, 66, 0.5);
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create and add both buttons
    const navButton = document.createElement('button');
    navButton.textContent = 'Next Post';
    navButton.className = 'nav-button';
    document.body.appendChild(navButton);

    const clickButton = document.createElement('button');
    clickButton.textContent = 'Click Post';
    clickButton.className = 'click-button';
    document.body.appendChild(clickButton);

    // Focus next post function
    function focusNextPost() {
        const posts = document.querySelectorAll('.note-item');
        
        // Remove previous selection
        if (currentIndex >= 0) {
            const prevPost = posts[currentIndex].querySelector('.cover');
            if (prevPost) {
                prevPost.classList.remove(SELECTED_CLASS);
            }
        }

        // Move to next post
        currentIndex = (currentIndex + 1) % posts.length;
        
        // Add selection to new post
        const currentPost = posts[currentIndex].querySelector('.cover');
        if (currentPost) {
            currentPost.classList.add(SELECTED_CLASS);
            currentPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Function to click the currently selected post
    function clickCurrentPost() {
        if (currentIndex >= 0) {
            const posts = document.querySelectorAll('.note-item');
            const currentPost = posts[currentIndex].querySelector('.cover');
            if (currentPost) {
                currentPost.click();
            }
        }
    }

    // Add click event listeners to buttons
    navButton.addEventListener('click', focusNextPost);
    clickButton.addEventListener('click', clickCurrentPost);

    // Optional: Add keyboard shortcuts (press 'n' for next, 'c' for click)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'n') {
            focusNextPost();
        } else if (e.key === 'c') {
            clickCurrentPost();
        }
    });
})();