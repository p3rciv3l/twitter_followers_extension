describe('Extension Setup', () => {
    describe('Manifest Validation', () => {
        const manifest = require('../../manifest.json');

        it('should have required manifest fields', () => {
            expect(manifest).toHaveProperty('manifest_version', 3);
            expect(manifest).toHaveProperty('name');
            expect(manifest).toHaveProperty('version');
            expect(manifest).toHaveProperty('description');
        });

        it('should have required permissions', () => {
            expect(manifest.permissions).toContain('activeTab');
            expect(manifest.permissions).toContain('scripting');
            expect(manifest.permissions).toContain('storage');
            expect(manifest.permissions).toContain('downloads');
        });

        it('should have correct host permissions', () => {
            expect(manifest.host_permissions).toContain('https://x.com/*');
        });

        it('should have required extension components', () => {
            expect(manifest).toHaveProperty('action.default_popup');
            expect(manifest).toHaveProperty('background.service_worker');
            expect(manifest.content_scripts).toHaveLength(1);
        });
    });

    describe('Extension Activation', () => {
        it('should activate only on analytics page', () => {
            const validUrl = 'https://x.com/i/account_analytics';
            const invalidUrl = 'https://x.com/home';
            
            expect(isAnalyticsPage(validUrl)).toBe(true);
            expect(isAnalyticsPage(invalidUrl)).toBe(false);
        });

        it('should verify required page elements', async () => {
            const mockElements = {
                graph: document.createElement('div'),
                followersCount: document.createElement('span')
            };
            
            document.body.appendChild(mockElements.graph);
            document.body.appendChild(mockElements.followersCount);
            
            expect(await checkRequiredElements()).toBe(true);
        });
    });

    describe('Resource Loading', () => {
        it('should load all required files', () => {
            expect(chrome.runtime.getManifest()).toHaveProperty('background');
            expect(document.querySelector('link[href="popup.css"]')).toBeTruthy();
            expect(document.querySelector('script[src="popup.js"]')).toBeTruthy();
        });
    });

    describe('Content Script Injection', () => {
        it('should inject scripts in correct order', async () => {
            const scripts = await chrome.scripting.getRegisteredContentScripts();
            expect(scripts[0].js).toEqual(['content.js']);
        });
    });
}); 