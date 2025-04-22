describe('Extension Activation', () => {
    describe('Icon State', () => {
        it('should enable icon on analytics page', () => {
            const tab = { url: 'https://x.com/i/account_analytics' };
            expect(shouldEnableIcon(tab)).toBe(true);
        });

        it('should disable icon on non-analytics pages', () => {
            const tab = { url: 'https://x.com/home' };
            expect(shouldEnableIcon(tab)).toBe(false);
        });
    });

    describe('Pre-run Checks', () => {
        it('should verify viewport dimensions', () => {
            window.innerWidth = 1440;
            window.innerHeight = 900;
            expect(checkViewportDimensions()).toBe(true);
        });

        it('should detect incorrect viewport', () => {
            window.innerWidth = 1024;
            window.innerHeight = 768;
            expect(checkViewportDimensions()).toBe(false);
        });

        it('should verify user is logged in', () => {
            document.cookie = 'auth_token=123';
            expect(isUserLoggedIn()).toBe(true);
        });
    });
}); 