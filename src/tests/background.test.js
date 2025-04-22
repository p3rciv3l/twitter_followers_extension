import { 
    isExtracting,
    currentX,
    startExtraction,
    stopExtraction,
    captureSequence,
    cropScreenshot
} from '../background.js';

describe('Background Script', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Reset extraction state
    global.isExtracting = false;
    global.currentX = 427;
  });

  describe('startExtraction', () => {
    it('should initialize extraction state correctly', async () => {
      // Mock successful tab query
      chrome.tabs.query.mockResolvedValueOnce([{ id: 1 }]);
      
      // Mock successful screenshot capture
      chrome.tabs.captureVisibleTab.mockResolvedValueOnce('data:image/png;base64,mockdata');

      await startExtraction();

      expect(isExtracting).toBe(true);
      expect(currentX).toBe(427);
    });

    it('should handle errors during extraction start', async () => {
      // Mock failed tab query
      chrome.tabs.query.mockRejectedValueOnce(new Error('Tab query failed'));

      await startExtraction();

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'error',
        error: expect.stringContaining('Failed to start extraction')
      });
    });
  });

  describe('captureSequence', () => {
    it('should capture screenshots and update progress', async () => {
      // Mock successful screenshot capture
      chrome.tabs.captureVisibleTab.mockResolvedValue('data:image/png;base64,mockdata');
      
      isExtracting = true;
      await captureSequence(1);

      // Should send progress updates
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'progress_update',
        progress: expect.any(Number)
      });
    });

    it('should stop on screenshot capture error', async () => {
      // Mock failed screenshot capture
      chrome.tabs.captureVisibleTab.mockRejectedValueOnce(new Error('Screenshot failed'));
      
      isExtracting = true;
      await captureSequence(1);

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'error',
        error: expect.stringContaining('Screenshot capture failed')
      });
      expect(isExtracting).toBe(false);
    });

    it('should complete extraction after reaching end coordinate', async () => {
      // Mock successful screenshot capture
      chrome.tabs.captureVisibleTab.mockResolvedValue('data:image/png;base64,mockdata');
      
      isExtracting = true;
      currentX = 876; // One before completion
      await captureSequence(1);

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'extraction_complete'
      });
    });
  });

  describe('cropScreenshot', () => {
    it('should crop screenshot to specified dimensions', async () => {
      const result = await cropScreenshot('data:image/png;base64,mockdata');
      
      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('Message Handler', () => {
    it('should handle start_extraction message', () => {
      const messageHandler = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      
      messageHandler({ action: 'start_extraction' });
      expect(isExtracting).toBe(true);
    });

    it('should handle stop_extraction message', () => {
      const messageHandler = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      
      isExtracting = true;
      messageHandler({ action: 'stop_extraction' });
      expect(isExtracting).toBe(false);
    });
  });
}); 