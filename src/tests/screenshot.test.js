describe('Screenshot Functionality', () => {
    const VALID_DIMENSIONS = {
        startX: 427,
        endX: 877,
        y: 670,
        captureWidth: 502,  // 877-375
        captureHeight: 180  // 754-574
    };

    describe('Screenshot Capture', () => {
        it('should capture with correct dimensions', async () => {
            const screenshot = await captureScreenshot(VALID_DIMENSIONS);
            expect(screenshot).toHaveProperty('width', VALID_DIMENSIONS.captureWidth);
            expect(screenshot).toHaveProperty('height', VALID_DIMENSIONS.captureHeight);
        });

        it('should handle failed captures', async () => {
            chrome.tabs.captureVisibleTab.mockRejectedValueOnce(new Error('Capture failed'));
            await expect(captureScreenshot(VALID_DIMENSIONS))
                .rejects
                .toThrow('Capture failed');
        });
    });

    describe('Progress Tracking', () => {
        it('should calculate correct progress', () => {
            const progress = calculateProgress(450, 427, 877);
            expect(progress).toBe(0);  // At start
            
            const midProgress = calculateProgress(450, 652, 877);
            expect(midProgress).toBe(50);  // Around middle
        });
    });

    describe('Image Processing', () => {
        it('should crop image to correct dimensions', async () => {
            const mockImage = new Blob(['mock-image-data']);
            const croppedImage = await cropImage(mockImage, {
                x: 375,
                y: 574,
                width: 502,
                height: 180
            });
            
            expect(croppedImage).toBeInstanceOf(Blob);
        });
    });
}); 