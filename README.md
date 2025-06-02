🔧 How It Works

This application follows the standard Electron architecture:

    🧠 Main Process (main.js):

        🚪 Acts as the entry point of the application.

        🌀 Manages the application lifecycle (startup, quit).

        🖼️ Creates and manages BrowserWindow instances (the UI windows).

        🔌 Handles system-level interactions like native file dialogs using ipcMain to listen for requests from the renderer process.

    🖥️ Renderer Process (index.html, renderer.js, styles.css):

        🌐 This is the web page displayed to the user within an Electron BrowserWindow.

        📄 index.html defines the UI layout (forms, buttons, display areas).

        🧩 renderer.js contains the JavaScript logic for the UI:

            👆 Handles user interactions (button clicks, form submissions).

            🌍 Makes HTTP requests to the backend FastAPI service using the browser's fetch API to submit crawl jobs and retrieve status.

            🔄 Updates the HTML content dynamically to display responses and status information.

    🔐 Preload Script (preload.js):

        🚦 Runs in a special context before the renderer's web page is loaded but has access to Node.js APIs.

        🪟 Uses contextBridge.exposeInMainWorld to securely expose specific functionalities or data from the Node.js environment to the renderer process (e.g., window.electronAPI).

        🛠️ In this project, it's primarily used to expose functions that can invoke ipcRenderer for tasks like opening file dialogs or potentially for making backend calls if more complex Node.js features were needed for those requests (though fetch in the renderer is often sufficient for HTTP).

🔄 Communication Flow (Example: Batch Crawl)

    📂 User selects a CSV file and fills in parameters in index.html.

    ▶️ User clicks the "Start Batch Crawl" button.

    🎯 renderer.js captures the form data and the selected file.

    🧱 renderer.js constructs a FormData object.

    📡 renderer.js uses fetch to send a POST request with the FormData to the backend's /crawl_targeted_sites_batch/ endpoint.

    🛠️ The FastAPI backend receives the request, parses the CSV, and queues the crawl tasks (e.g., into Redis lists).

    📬 The backend responds to the fetch request with a status (e.g., batch ID, number of sites queued).

    🪄 renderer.js receives the response and updates the UI (batchCrawlStatusDiv) to inform the user.

    🤖 Dedicated worker tasks in the backend pick up tasks from the Redis queues and start crawling.

    🔁 User can later use the "Refresh Worker Status" or "Get Batch Status" buttons, which trigger fetch requests (via preload.js exposed functions) to other backend endpoints to get updated information, which is then displayed in the UI.
