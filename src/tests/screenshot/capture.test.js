describe('Screenshot Capture', () => {
    const VALID_COORDS = {
        x: 375,
        y: 574,
        width: 502,
        height: 180
    };

    describe('Screenshot Taking', () => {
        it('should capture with correct dimensions', async () => {
            const screenshot = await takeScreenshot(VALID_COORDS);
            expect(screenshot).toBeInstanceOf(Blob);
            expect(screenshot.type).toBe('image/png');
        });

        it('should retry failed captures', async () => {
            // Mock first two attempts failing, third succeeding
            chrome.tabs.captureVisibleTab
                .mockRejectedValueOnce(new Error('Failed'))
                .mockRejectedValueOnce(new Error('Failed'))
                .mockResolvedValueOnce('data:image/png;base64,test');

            const screenshot = await takeScreenshot(VALID_COORDS);
            expect(screenshot).toBeInstanceOf(Blob);
            expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledTimes(3);
        });

        it('should handle permanent failures', async () => {
            chrome.tabs.captureVisibleTab
                .mockRejectedValue(new Error('Permanent failure'));

            await expect(takeScreenshot(VALID_COORDS))
                .rejects
                .toThrow('Max retry attempts reached');
        });
    });

    describe('Rate Limiting', () => {
        it('should respect capture intervals', async () => {
            const startTime = Date.now();
            await takeScreenshot(VALID_COORDS);
            await takeScreenshot(VALID_COORDS);
            const elapsed = Date.now() - startTime;
            expect(elapsed).toBeGreaterThanOrEqual(100); // 100ms minimum interval
        });
    });

    describe('Performance', () => {
        it('should handle memory efficiently', async () => {
            const initialMemory = window.performance.memory.usedJSHeapSize;
            await takeMultipleScreenshots(100);
            const finalMemory = window.performance.memory.usedJSHeapSize;
            expect(finalMemory - initialMemory).toBeLessThan(50 * 1024 * 1024); // 50MB limit
        });
    });
}); 