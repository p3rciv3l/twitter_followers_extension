// Mock Chrome Extension API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
  },
  tabs: {
    query: jest.fn(),
    captureVisibleTab: jest.fn(),
  },
};

// Mock OffscreenCanvas
global.OffscreenCanvas = class OffscreenCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  getContext() {
    return {
      drawImage: jest.fn(),
    };
  }

  convertToBlob() {
    return Promise.resolve(new Blob(['mock-image-data']));
  }
};

// Add to existing mocks
global.window.scrollTo = jest.fn();
global.window.scrollY = 0;

// Mock chrome.scripting
chrome.scripting = {
    getRegisteredContentScripts: jest.fn().mockResolvedValue([{
        js: ['content.js']
    }])
}; 