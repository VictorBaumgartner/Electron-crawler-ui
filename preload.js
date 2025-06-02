const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // --- Backend API Calls ---
  // Replace 'http://localhost:8000' with your actual FastAPI backend URL
  // Ensure your FastAPI backend has CORS configured if Electron UI is served from a different origin (less likely for file://)
  // but good practice if you ever consider serving the UI via HTTP.
  // For `file://` origins, CORS is typically not an issue for requests to `localhost`.

  crawlTargetedSitesBatch: async (filePath, outputDir, maxConcurrency, maxDepth) => {
    const formData = new FormData();
    // To get the file object correctly for FormData, the renderer needs to handle the file input
    // This example assumes filePath is just the path string.
    // A more robust way is to pass the File object itself from the renderer if possible,
    // or read the file content in preload/main if security requires it.
    // For simplicity here, we assume the renderer will provide a File object
    // or we'll need another IPC call to read the file.
    // Let's assume 'filePath' here IS the File object from an <input type="file">
    // If it's just a path, you'd need:
    // const fileContent = fs.readFileSync(filePath);
    // formData.append('csv_file', new Blob([fileContent]), 'sites.csv');
    // BUT preload doesn't have direct fs access by default unless nodeIntegrationInWorker: true
    // It's better to handle File object from renderer.
    // For now, we'll pass a placeholder. This needs to be properly handled with file input.
    
    // THIS IS A SIMPLIFIED EXAMPLE. File handling for FormData in Electron needs care.
    // The renderer.js will get the actual File object.
    // We will make the API call directly from renderer.js using fetch or axios
    // for simplicity in this example, as preload cannot easily construct FormData with local files
    // without more complex IPC.

    // Exposing a function to trigger file dialog
    return ipcRenderer.invoke('dialog:openFile'), // Example of exposing IPC

    // Actual backend calls will be made from renderer.js using fetch/axios.
    // Preload can be used to expose utility functions or Node.js modules if strictly needed.
  },

  // Expose a simple ping or status check to the backend
  getWorkerStatus: async () => {
    try {
      const response = await fetch('http://localhost:8000/worker_status'); // Ensure your backend URL is correct
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`HTTP error ${response.status}: ${errorData.detail || 'Failed to fetch worker status'}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching worker status:', error);
      throw error; // Re-throw to be caught by renderer
    }
  },

  getBatchStatus: async (batchId) => {
    try {
      const response = await fetch(`http://localhost:8000/batch_status/${batchId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`HTTP error ${response.status}: ${errorData.detail || 'Failed to fetch batch status'}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching status for batch ${batchId}:`, error);
      throw error;
    }
  }

  // Add more functions to expose to the renderer as needed
});