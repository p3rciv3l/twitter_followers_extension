// State management
export let isExtracting = false;
export let currentX = 427; // Starting X coordinate
export const CURSOR_Y = 670; // Fixed Y coordinate
export const TOTAL_WIDTH = 877 - 427; // Total distance to move

// Screenshot configuration
const CAPTURE_CONFIG = {
    x: 375,
    y: 574,
    width: 877 - 375,  // 502px
    height: 754 - 574  // 180px
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start_extraction') {
        startExtraction();
    } else if (message.action === 'stop_extraction') {
        stopExtraction();
    }
});

export async function startExtraction() {
    if (isExtracting) return;
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Initialize cursor
        await chrome.tabs.sendMessage(tab.id, { action: 'init_cursor' });
        
        // Start capture sequence
        isExtracting = true;
        currentX = 427;
        await captureSequence(tab.id);
    } catch (error) {
        console.error('Extraction error:', error);
        chrome.runtime.sendMessage({ 
            type: 'error', 
            error: 'Failed to start extraction: ' + error.message 
        });
    }
}

export async function captureSequence(tabId) {
    while (isExtracting && currentX <= 877) {
        try {
            // Move cursor first
            await chrome.tabs.sendMessage(tabId, {
                action: 'move_cursor',
                position: { x: currentX, y: 670 }
            });

            // Take screenshot
            const screenshot = await takeScreenshot();
            await processScreenshot(screenshot);

            // Update progress
            chrome.runtime.sendMessage({
                type: 'progress_update',
                progress: currentX - 427
            });

            currentX++;
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            handleError(error);
            return;
        }
    }

    if (currentX > 877) {
        await completeExtraction(tabId);
    }
}

async function cropScreenshot(dataUrl) {
    // Create an image from the screenshot
    const img = new Image();
    const loadImage = new Promise((resolve) => {
        img.onload = () => resolve();
        img.src = dataUrl;
    });
    await loadImage;

    // Create a canvas for cropping
    const canvas = new OffscreenCanvas(CAPTURE_CONFIG.width, CAPTURE_CONFIG.height);
    const ctx = canvas.getContext('2d');

    // Crop the image
    ctx.drawImage(img,
        CAPTURE_CONFIG.x, CAPTURE_CONFIG.y,
        CAPTURE_CONFIG.width, CAPTURE_CONFIG.height,
        0, 0,
        CAPTURE_CONFIG.width, CAPTURE_CONFIG.height
    );

    // Convert to blob
    return await canvas.convertToBlob({ type: 'image/png', quality: 0.9 });
}

async function processScreenshot(blob) {
    // Placeholder for future implementation
    // This is where we'll send to Vision API
    console.log('Processing screenshot, size:', blob.size);
}

function stopExtraction() {
    isExtracting = false;
    currentX = 427;
}

export {
    startExtraction,
    stopExtraction,
    captureSequence,
    cropScreenshot,
    processScreenshot
}; 