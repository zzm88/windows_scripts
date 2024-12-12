// Core functionality for XHS Auto Post
class XHSAutoPost {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
    }

    async startPosting(config) {
        if (this.isRunning) {
            console.log('Already running');
            return;
        }

        this.isRunning = true;
        const intervalMinutes = parseInt(config.intervalMinutes) || 5;
        
        // Initial post
        await this.makePost(config);

        // Set up interval for subsequent posts
        this.intervalId = setInterval(async () => {
            await this.makePost(config);
        }, intervalMinutes * 60 * 1000);
    }

    stopPosting() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }

    async makePost(config) {
        try {
            // 1. Get AI-generated content if needed
            let postText = config.text;
            if (config.apiUrl && config.prompt) {
                postText = await this.getAIContent(config.apiUrl, config.prompt);
            }

            // 2. Navigate to post creation page if not already there
            await this.ensurePostPage();

            // 3. Upload video
            await this.uploadVideo(config.videoPath);

            // 4. Fill in the text
            await this.fillPostText(postText);

            // 5. Submit the post
            await this.submitPost();

            console.log('Post created successfully');
        } catch (error) {
            console.error('Error creating post:', error);
        }
    }

    async getAIContent(apiUrl, prompt) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                throw new Error('AI API request failed');
            }

            const data = await response.json();
            return data.content || '';
        } catch (error) {
            console.error('Error getting AI content:', error);
            return '';
        }
    }

    async ensurePostPage() {
        // Implementation depends on XHS website structure
        // This is a placeholder for navigation logic
        if (!window.location.href.includes('creator.xiaohongshu.com/publish')) {
            window.location.href = 'https://creator.xiaohongshu.com/publish';
            // Wait for navigation
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    async uploadVideo(videoPath) {
        try {
            // Find the upload input element
            const uploadInput = document.querySelector('input[type="file"]');
            if (!uploadInput) {
                throw new Error('Upload input not found');
            }

            // Create a File object from the local path
            const response = await fetch(`file://${videoPath}`);
            const blob = await response.blob();
            const file = new File([blob], videoPath.split(/[\\/]/).pop(), {
                type: 'video/mp4'  // Adjust type based on the actual video format
            });

            // Create a DataTransfer object
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            
            // Set the file input's files
            uploadInput.files = dataTransfer.files;

            // Trigger change event
            uploadInput.dispatchEvent(new Event('change', { bubbles: true }));

            // Alternative: If direct file input doesn't work, try drag and drop simulation
            const dropZone = document.querySelector('.upload-wrapper') || 
                            document.querySelector('[class*="upload"]');
            
            if (dropZone) {
                const dragEvent = new DragEvent('drop', {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: dataTransfer
                });
                dropZone.dispatchEvent(dragEvent);
            }

            // Wait for upload to complete
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('Video upload completed');
        } catch (error) {
            console.error('Error uploading video:', error);
            throw new Error(`Failed to upload video: ${error.message}`);
        }
    }

    async fillPostText(text) {
        // Implementation depends on XHS website structure
        // This is a placeholder for text input logic
        try {
            // Find the text input field
            const textInput = document.querySelector('[data-test-id="text-input"]');
            if (!textInput) {
                throw new Error('Text input not found');
            }

            // Set the text value
            textInput.value = text;
            textInput.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (error) {
            console.error('Error filling post text:', error);
            throw error;
        }
    }

    async submitPost() {
        // Implementation depends on XHS website structure
        // This is a placeholder for submit logic
        try {
            // Find the submit button
            const submitButton = document.querySelector('[data-test-id="submit-button"]');
            if (!submitButton) {
                throw new Error('Submit button not found');
            }

            // Click the submit button
            submitButton.click();
            
            // Wait for submission to complete
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error('Error submitting post:', error);
            throw error;
        }
    }
}

// Export the class
window.XHSAutoPost = XHSAutoPost;