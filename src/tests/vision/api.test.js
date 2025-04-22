describe('Vision API Integration', () => {
    const mockScreenshot = new Blob(['test-image-data'], { type: 'image/png' });
    let apiCost = 0;

    beforeEach(() => {
        apiCost = 0;
    });

    describe('API Calls', () => {
        it('should send correct prompts to Vision API', async () => {
            const response = await sendVisionRequest(mockScreenshot, {
                prompt: "What is the date? Reply with the date in mm/dd/yyyy format AND NOTHING ELSE."
            });
            expect(response).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
        });

        it('should track API costs', async () => {
            await sendVisionRequest(mockScreenshot, { prompt: "test" });
            expect(getApiCost()).toBeGreaterThan(0);
            expect(getApiCost()).toBeLessThan(0.50);
        });

        it('should stop when cost limit exceeded', async () => {
            apiCost = 0.49;
            await expect(sendVisionRequest(mockScreenshot, { prompt: "test" }))
                .rejects
                .toThrow('API cost limit exceeded');
        });

        it('should implement retry logic', async () => {
            const mockApi = jest.fn()
                .mockRejectedValueOnce(new Error('API Error'))
                .mockRejectedValueOnce(new Error('API Error'))
                .mockResolvedValueOnce({ text: 'success' });

            const result = await withRetry(() => mockApi());
            expect(mockApi).toHaveBeenCalledTimes(3);
            expect(result).toEqual({ text: 'success' });
        });
    });

    describe('Rate Limiting', () => {
        it('should respect concurrent request limit', async () => {
            const requests = Array(15).fill().map(() => 
                sendVisionRequest(mockScreenshot, { prompt: "test" })
            );
            
            const startTime = Date.now();
            await Promise.all(requests);
            const duration = Date.now() - startTime;
            
            // Should take at least 500ms due to rate limiting
            expect(duration).toBeGreaterThan(500);
        });
    });
}); 