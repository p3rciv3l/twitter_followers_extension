import {
    verifyGraphRendered,
    lockPageScroll,
    unlockPageScroll,
    initCursor,
    moveCursor,
    getNextCursorPosition,
    cleanupCursor,
    CURSOR_CONFIG
} from '../../content.js';

describe('Content Script', () => {
    let mockDocument;

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        window.scrollY = 0;
        
        // Mock graph element
        mockDocument = document.createElement('div');
        mockDocument.className = 'analytics-graph';
        document.body.appendChild(mockDocument);
    });

    describe('Graph Verification', () => {
        it('should verify graph is present', async () => {
            await expect(verifyGraphRendered()).rejects.toThrow('Graph data not loaded');
            
            // Add data points
            const dataPoint = document.createElement('div');
            dataPoint.className = 'data-point';
            mockDocument.appendChild(dataPoint);
            
            await expect(verifyGraphRendered()).resolves.toBe(true);
        });

        it('should handle missing graph', async () => {
            document.body.innerHTML = '';
            await expect(verifyGraphRendered()).rejects.toThrow('Graph not found');
        });
    });

    describe('Scroll Management', () => {
        it('should lock page scroll', () => {
            window.scrollY = 100;
            expect(lockPageScroll()).toBe(true);
            expect(document.body.style.position).toBe('fixed');
            expect(document.body.style.top).toBe('-100px');
        });

        it('should unlock page scroll', () => {
            // Setup locked state
            document.body.style.position = 'fixed';
            document.body.style.top = '-100px';
            
            expect(unlockPageScroll()).toBe(true);
            expect(document.body.style.position).toBe('');
            expect(document.body.style.top).toBe('');
        });

        it('should restore scroll position after unlock', () => {
            window.scrollY = 100;
            lockPageScroll();
            unlockPageScroll();
            expect(window.scrollY).toBe(100);
        });
    });

    describe('Cursor Movement', () => {
        it('should initialize cursor with correct styles', async () => {
            const cursor = await initCursor();
            expect(cursor.id).toBe('analytics-cursor');
            expect(cursor.style.position).toBe('absolute');
            expect(cursor.style.pointerEvents).toBe('none');
        });

        it('should move cursor to correct position', async () => {
            const cursor = await moveCursor(CURSOR_CONFIG.START_X, CURSOR_CONFIG.FIXED_Y);
            expect(cursor.style.left).toBe('427px');
            expect(cursor.style.top).toBe('670px');
        });

        it('should calculate next position within bounds', async () => {
            const pos = await getNextCursorPosition(500, CURSOR_CONFIG.FIXED_Y);
            expect(pos.x).toBe(501);
            expect(pos.y).toBe(670);

            const endPos = await getNextCursorPosition(877, CURSOR_CONFIG.FIXED_Y);
            expect(endPos.x).toBe(877); // Should not exceed END_X
        });

        it('should cleanup cursor properly', () => {
            initCursor();
            cleanupCursor();
            expect(document.getElementById('analytics-cursor')).toBeNull();
        });
    });

    describe('Message Handling', () => {
        it('should handle move_cursor message', async () => {
            const mockSendResponse = jest.fn();
            const message = {
                action: 'move_cursor',
                position: { x: 500, y: 670 }
            };

            await chrome.runtime.onMessage.addListener.mock.calls[0][0](
                message,
                {},
                mockSendResponse
            );

            expect(mockSendResponse).toHaveBeenCalledWith({
                success: true,
                position: message.position
            });
        });

        it('should handle errors in message handling', async () => {
            const mockSendResponse = jest.fn();
            const message = {
                action: 'invalid_action'
            };

            await chrome.runtime.onMessage.addListener.mock.calls[0][0](
                message,
                {},
                mockSendResponse
            );

            expect(mockSendResponse).toHaveBeenCalledWith({
                success: false,
                error: expect.any(String)
            });
        });
    });
}); 