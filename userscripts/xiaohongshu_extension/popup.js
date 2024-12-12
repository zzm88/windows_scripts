document.getElementById('uploadBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      const filePath = 'C:/Users/zzm88/Downloads/01e6d5bb486e05110103730391b2e623d6_259.mp4video.mp4';
      
      // Create a File object
      const file = new File([''], filePath, {
        type: 'video/mp4'
      });

      // Create DataTransfer
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      // Find upload input
      const uploadInput = document.querySelector('.upload-input');

      // Create and dispatch dragenter event
      const dragEnterEvent = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      uploadInput.dispatchEvent(dragEnterEvent);

      // Create and dispatch dragover event
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      uploadInput.dispatchEvent(dragOverEvent);

      // Create and dispatch drop event
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      uploadInput.dispatchEvent(dropEvent);

      // Set files and dispatch change event
      uploadInput.files = dataTransfer.files;
      const changeEvent = new Event('change', { bubbles: true });
      uploadInput.dispatchEvent(changeEvent);
    }
  });
});