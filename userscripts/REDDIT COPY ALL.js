// ==UserScript==
// @name         Reddit One-Click Copy All Content
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds a button to copy all content (post and replies) in a Reddit thread
// @author       You
// @match        https://www.reddit.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Function to collect all the content
    function collectRedditPostContent() {
        let postContent = '';

        // Get the main post content
        const postTitle = document.querySelector('h1')?.innerText;
        const postText = document.querySelector('shreddit-post')?.innerText || 
                        document.querySelector('div[data-click-id="text"]')?.innerText;

        if (postTitle) postContent += `Title: ${postTitle}\n\n`;
        if (postText) postContent += `Post Content:\n${postText}\n\n`;

        // Get all the comment replies
        const comments = document.querySelectorAll('shreddit-comment');
        comments.forEach(comment => {
            // Get ALL paragraphs in the comment, not just the first one
            const commentParagraphs = comment.querySelectorAll('p');
            const commentText = Array.from(commentParagraphs)
                .map(p => p.innerText)
                .join('\n');
            
            const commentAuthor = 
                comment.querySelector('.text-neutral-content-strong')?.innerText || 
                comment.querySelector('a[href^="/user/"]')?.innerText ||
                comment.querySelector('faceplate-hovercard a')?.innerText;

            // Add debug logging for username
            console.log('Found author:', commentAuthor);
            
            if (commentText) {
                postContent += `\nComment by ${commentAuthor || 'Unknown'}:\n${commentText}\n`;
            }
        });

        // Add console logs for debugging
        console.log('Title:', postTitle);
        console.log('Post Text:', postText);
        console.log('Number of comments found:', comments.length);

        return postContent;
    }

    // Function to copy content to clipboard
    function copyToClipboard(content) {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        // Create popup div
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.padding = '20px';
        popup.style.backgroundColor = '#fff';
        popup.style.border = '2px solid #ff4500';
        popup.style.borderRadius = '5px';
        popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        popup.style.zIndex = '10000';
        popup.innerText = 'Content copied to clipboard!';

        document.body.appendChild(popup);

        // Remove popup after 2 seconds
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 2000);
    }

    // Create the Copy button
    const button = document.createElement('button');
    button.innerText = 'Copy Post and Replies';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.padding = '10px';
    button.style.backgroundColor = '#ff4500';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '9999';

    // Add the button to the page
    document.body.appendChild(button);

    // Add the click event to the button
    button.addEventListener('click', () => {
        console.log('Button clicked');
        const content = collectRedditPostContent();
        console.log('Collected content:', content);
        copyToClipboard(content);
    });
})();
