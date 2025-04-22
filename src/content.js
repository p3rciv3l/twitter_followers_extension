// Constants match test expectations
const CURSOR_CONFIG = {
    START_X: 427,
    END_X: 877,
    FIXED_Y: 670
};

let cursorElement = null;

// Export for testing
export async function moveCursor(x, y) {
    if (!cursorElement) await initCursor();
    cursorElement.style.left = `${x}px`;
    cursorElement.style.top = `${y}px`;
    return cursorElement; // Return for test verification
}

export async function initCursor() {
    if (!cursorElement) {
        cursorElement = document.createElement('div');
        cursorElement.id = 'analytics-cursor';
        cursorElement.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: red;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            transition: all 0.1s ease;
        `;
        document.body.appendChild(cursorElement);
    }
    return cursorElement;
}

export async function getNextCursorPosition(currentX, fixedY) {
    const nextX = Math.min(currentX + 1, CURSOR_CONFIG.END_X);
    return { x: nextX, y: fixedY };
}

// Message handling
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    try {
        switch (message.action) {
            case 'move_cursor':
                const cursor = await moveCursor(message.position.x, message.position.y);
                sendResponse({ success: true, position: message.position });
                break;
            case 'init_cursor':
                await initCursor();
                sendResponse({ success: true });
                break;
            case 'cleanup_cursor':
                cleanupCursor();
                sendResponse({ success: true });
                break;
        }
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
    return true; // Keep message channel open for async response
});

// Helper functions
export function cleanupCursor() {
    if (cursorElement) {
        cursorElement.remove();
        cursorElement = null;
    }
}

export async function checkPageReady() {
    const graphElement = document.querySelector('.analytics-graph');
    if (!graphElement) throw new Error('Analytics graph not found');
    return true;
}

export function preventScroll(prevent) {
    document.body.style.overflow = prevent ? 'hidden' : '';
    return document.body.style.overflow === 'hidden';
}

export async function verifyGraphRendered() {
    const graph = document.querySelector('.analytics-graph');
    if (!graph) throw new Error('Graph not found');
    
    // Check if graph data is loaded
    const dataPoints = graph.querySelectorAll('.data-point');
    if (!dataPoints.length) throw new Error('Graph data not loaded');
    
    return true;
}

export function lockPageScroll() {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    return true;
}

export function unlockPageScroll() {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
    return true;
} 