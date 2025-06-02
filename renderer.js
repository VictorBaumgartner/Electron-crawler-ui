// --- Globals for Backend URL ---
const BACKEND_URL = 'http://localhost:8000'; // CHANGE THIS IF YOUR BACKEND IS ELSEWHERE

// --- Batch Crawl Elements ---
const csvFileInput = document.getElementById('csvFile');
const outputDirBatchInput = document.getElementById('outputDirBatch');
const maxConcurrencyBatchInput = document.getElementById('maxConcurrencyBatch');
const maxDepthBatchInput = document.getElementById('maxDepthBatch');
const startBatchCrawlButton = document.getElementById('startBatchCrawl');
const batchCrawlStatusDiv = document.getElementById('batchCrawlStatus');

// --- Status Elements ---
const refreshWorkerStatusButton = document.getElementById('refreshWorkerStatus');
const workerStatusDisplay = document.getElementById('workerStatusDisplay');
const batchIdInput = document.getElementById('batchIdInput');
const getBatchStatusBtn = document.getElementById('getBatchStatusBtn');
const specificBatchStatusDisplay = document.getElementById('specificBatchStatusDisplay');


// --- Event Listeners ---

startBatchCrawlButton.addEventListener('click', async () => {
    const file = csvFileInput.files[0];
    const outputDir = outputDirBatchInput.value;
    const maxConcurrency = maxConcurrencyBatchInput.value;
    const maxDepth = maxDepthBatchInput.value;

    if (!file) {
        updateStatus(batchCrawlStatusDiv, 'Please select a CSV file.', 'error');
        return;
    }
    if (!outputDir) {
        updateStatus(batchCrawlStatusDiv, 'Please specify an output directory.', 'error');
        return;
    }

    updateStatus(batchCrawlStatusDiv, 'Starting batch crawl...', 'info');

    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('output_dir', outputDir);
    formData.append('max_concurrency_pages_per_site', maxConcurrency);
    formData.append('max_depth_per_site', maxDepth);

    try {
        // Using fetch directly from renderer. Ensure backend CORS is set up if needed,
        // though for localhost to localhost it's often fine.
        const response = await fetch(`${BACKEND_URL}/crawl_targeted_sites_batch/`, {
            method: 'POST',
            body: formData,
            // Headers are not strictly needed for FormData by fetch, it sets Content-Type automatically.
            // headers: { 'accept': 'application/json' } // FastAPI will infer based on endpoint
        });

        const result = await response.json();

        if (response.ok) {
            updateStatus(batchCrawlStatusDiv, `Batch submitted successfully! Batch ID: ${result.upload_batch_id}. Status: ${result.status}`, 'success');
            csvFileInput.value = ''; // Clear file input
        } else {
            updateStatus(batchCrawlStatusDiv, `Error: ${result.detail || 'Unknown error'} (HTTP ${response.status})`, 'error');
        }
    } catch (error) {
        console.error('Error starting batch crawl:', error);
        updateStatus(batchCrawlStatusDiv, `Network or application error: ${error.message}`, 'error');
    }
});


refreshWorkerStatusButton.addEventListener('click', async () => {
    workerStatusDisplay.textContent = 'Loading worker status...';
    try {
        const statusData = await window.electronAPI.getWorkerStatus(); // Using preload exposed function
        workerStatusDisplay.textContent = JSON.stringify(statusData, null, 2);
    } catch (error) {
        workerStatusDisplay.textContent = `Error fetching worker status: ${error.message}`;
    }
});

getBatchStatusBtn.addEventListener('click', async () => {
    const batchId = batchIdInput.value;
    if (!batchId) {
        specificBatchStatusDisplay.textContent = 'Please enter a Batch ID.';
        return;
    }
    specificBatchStatusDisplay.textContent = `Loading status for batch ${batchId}...`;
    try {
        const statusData = await window.electronAPI.getBatchStatus(batchId); // Using preload
        specificBatchStatusDisplay.textContent = JSON.stringify(statusData, null, 2);
    } catch (error) {
        specificBatchStatusDisplay.textContent = `Error fetching status for batch ${batchId}: ${error.message}`;
    }
});


// --- Utility function for status messages ---
function updateStatus(element, message, type = 'info') {
    element.textContent = message;
    element.className = 'status-message'; // Reset classes
    if (type === 'success') {
        element.classList.add('success');
    } else if (type === 'error') {
        element.classList.add('error');
    } else {
         element.classList.add('info'); // Default or for neutral messages
    }
}

// Initial load of worker status
refreshWorkerStatusButton.click();