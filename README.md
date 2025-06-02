## How It Works

This application follows the standard Electron architecture:

1.  **Main Process (`main.js`):**
    *   Acts as the entry point of the application.
    *   Manages the application lifecycle (startup, quit).
    *   Creates and manages `BrowserWindow` instances (the UI windows).
    *   Handles system-level interactions like native file dialogs using `ipcMain` to listen for requests from the renderer process.

2.  **Renderer Process (`index.html`, `renderer.js`, `styles.css`):**
    *   This is the web page displayed to the user within an Electron `BrowserWindow`.
    *   `index.html` defines the UI layout (forms, buttons, display areas).
    *   `renderer.js` contains the JavaScript logic for the UI:
        *   Handles user interactions (button clicks, form submissions).
        *   Makes HTTP requests to the backend FastAPI service using the browser's `fetch` API to submit crawl jobs and retrieve status.
        *   Updates the HTML content dynamically to display responses and status information.

3.  **Preload Script (`preload.js`):**
    *   Runs in a special context before the renderer's web page is loaded but has access to Node.js APIs.
    *   Uses `contextBridge.exposeInMainWorld` to securely expose specific functionalities or data from the Node.js environment to the renderer process (e.g., `window.electronAPI`).
    *   In this project, it's primarily used to expose functions that can invoke `ipcRenderer` for tasks like opening file dialogs or potentially for making backend calls if more complex Node.js features were needed for those requests (though `fetch` in the renderer is often sufficient for HTTP).

**Communication Flow (Example: Batch Crawl):**

1.  User selects a CSV file and fills in parameters in `index.html`.
2.  User clicks the "Start Batch Crawl" button.
3.  `renderer.js` captures the form data and the selected file.
4.  `renderer.js` constructs a `FormData` object.
5.  `renderer.js` uses `fetch` to send a POST request with the `FormData` to the backend's `/crawl_targeted_sites_batch/` endpoint.
6.  The FastAPI backend receives the request, parses the CSV, and queues the crawl tasks (e.g., into Redis lists).
7.  The backend responds to the `fetch` request with a status (e.g., batch ID, number of sites queued).
8.  `renderer.js` receives the response and updates the UI (`batchCrawlStatusDiv`) to inform the user.
9.  Dedicated worker tasks in the backend pick up tasks from the Redis queues and start crawling.
10. User can later use the "Refresh Worker Status" or "Get Batch Status" buttons, which trigger `fetch` requests (via `preload.js` exposed functions) to other backend endpoints to get updated information, which is then displayed in the UI.

## Setup and Installation

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd electron-crawler-ui
    ```
    Or, if you have the files directly, navigate to the `electron-crawler-ui` directory.

2.  **Install dependencies:**
    Open a terminal in the `electron-crawler-ui` directory and run:
    ```bash
    npm install
    ```
    This will download Electron and any other dependencies listed in `package.json`.

## Running the Application

1.  **Ensure the Backend Service is Running:**
    *   Start your Python FastAPI web crawler backend.
    *   Make sure it's accessible at `http://localhost:8000` (or update `BACKEND_URL` in `renderer.js` if it's different).
    *   Ensure the Redis server used by the backend is also running.

2.  **Start the Electron UI:**
    In the terminal, from the `electron-crawler-ui` directory, run:
    ```bash
    npm start
    ```
    This will launch the Electron application window.

## Development

*   **Electron DevTools:** The main process (`main.js`) is configured to open Chrome DevTools by default (`mainWindow.webContents.openDevTools();`). You can use this to inspect the renderer process, debug JavaScript in `renderer.js`, and view network requests.
*   **Backend Logs:** Monitor the logs from your FastAPI backend service to see details of crawl operations, task queuing, and any errors.
*   **Modifying Code:** Changes to `main.js` typically require restarting the Electron app. Changes to renderer process files (`index.html`, `renderer.js`, `styles.css`) might be visible after a simple refresh (Ctrl+R or Cmd+R) in the Electron window if hot-reloading isn't explicitly set up (which it isn't in this basic setup).

## Key Files to Understand

*   **`package.json`:** Defines the project, its scripts (like `npm start`), and its dependencies.
*   **`main.js`:** The heart of the Electron application. Manages the application's lifecycle and browser windows.
*   **`preload.js`:** The secure bridge between the Node.js world and the renderer's web environment.
*   **`index.html`:** The visual structure of your application.
*   **`renderer.js`:** The client-side JavaScript that makes the UI interactive and communicates with the backend.

## Future Enhancements

*   More comprehensive UI for all backend endpoints.
*   Real-time status updates using polling or WebSockets.
*   Improved error handling and user feedback.
*   Configuration settings UI (e.g., for backend URL, default output directories).
*   Ability to view/manage individual items in the Redis queues.
*   Packaging the Electron app into a distributable installer.
