// Initialize variables to track state
let isExtracting = false;
let currentProgress = 0;
const TOTAL_SCREENSHOTS = 450;
let startTime = null;

// Get DOM elements we'll interact with
const startButton = document.getElementById('start-button');
const statusText = document.getElementById('status');
const progressBar = document.getElementById('progress-bar');
const progressElement = document.getElementById('progress');
const estimatedTimeElement = document.getElementById('estimated-time');
const timeValueElement = document.getElementById('time-value');

// Add click handler to start button
startButton.addEventListener('click', async () => {
    if (isExtracting) {
        // Stop functionality
        isExtracting = false;
        startButton.textContent = 'Start Extraction';
        statusText.textContent = 'Extraction stopped';
        progressBar.classList.add('hidden');
        estimatedTimeElement.classList.add('hidden');
        await chrome.runtime.sendMessage({ action: 'stop_extraction' });
        return;
    }

    try {
        // Check if we're on the right page
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.url.includes('x.com/i/account_analytics')) {
            statusText.textContent = 'Please navigate to Twitter Analytics page';
            return;
        }

        // Start extraction
        isExtracting = true;
        startTime = Date.now();
        startButton.textContent = 'Stop Extraction';
        statusText.textContent = 'Starting extraction...';
        progressBar.classList.remove('hidden');
        estimatedTimeElement.classList.remove('hidden');
        currentProgress = 0;
        updateProgress(0);

        await chrome.runtime.sendMessage({ action: 'start_extraction' });
    } catch (error) {
        statusText.textContent = 'Error: ' + error.message;
    }
});

// Listen for progress updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'progress_update') {
        updateProgress(message.progress);
    } else if (message.type === 'extraction_complete') {
        extractionComplete();
    } else if (message.type === 'error') {
        handleError(message.error);
    }
});

function updateProgress(progress) {
    currentProgress = progress;
    const percentage = (progress / TOTAL_SCREENSHOTS) * 100;
    progressElement.style.width = `${percentage}%`;
    
    // Calculate estimated time remaining
    if (progress > 0) {
        const elapsedTime = Date.now() - startTime;
        const timePerItem = elapsedTime / progress;
        const remainingItems = TOTAL_SCREENSHOTS - progress;
        const estimatedTimeRemaining = Math.round((timePerItem * remainingItems) / 1000);
        timeValueElement.textContent = `${estimatedTimeRemaining} seconds`;
    }

    statusText.textContent = `Processing... ${progress}/${TOTAL_SCREENSHOTS}`;
}

function extractionComplete() {
    isExtracting = false;
    startButton.textContent = 'Start Extraction';
    statusText.textContent = 'Extraction complete!';
    progressBar.classList.add('hidden');
    estimatedTimeElement.classList.add('hidden');
}

function handleError(error) {
    isExtracting = false;
    startButton.textContent = 'Start Extraction';
    statusText.textContent = 'Error: ' + error;
    progressBar.classList.add('hidden');
    estimatedTimeElement.classList.add('hidden');
} 