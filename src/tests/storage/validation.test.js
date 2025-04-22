describe('Data Validation', () => {
    describe('Date Validation', () => {
        it('should validate date format', () => {
            expect(isValidDate('05/15/2024')).toBe(true);
            expect(isValidDate('13/15/2024')).toBe(false);
            expect(isValidDate('not a date')).toBe(false);
        });

        it('should handle edge cases', () => {
            expect(isValidDate('02/29/2024')).toBe(true); // Leap year
            expect(isValidDate('02/29/2023')).toBe(false); // Not leap year
        });
    });

    describe('Numeric Validation', () => {
        it('should validate follower counts', () => {
            expect(isValidFollowerCount(123)).toBe(true);
            expect(isValidFollowerCount(-45)).toBe(true);
            expect(isValidFollowerCount('abc')).toBe(false);
        });

        it('should handle edge cases', () => {
            expect(isValidFollowerCount(0)).toBe(true);
            expect(isValidFollowerCount(Infinity)).toBe(false);
            expect(isValidFollowerCount(NaN)).toBe(false);
        });
    });

    describe('Missing Data', () => {
        it('should handle null values', () => {
            expect(validateEntry({ date: null, newFollows: 10 })).toBe(false);
            expect(validateEntry({ date: '05/15/2024', newFollows: null })).toBe(false);
        });

        it('should handle undefined values', () => {
            expect(validateEntry({ date: '05/15/2024' })).toBe(false);
            expect(validateEntry({})).toBe(false);
        });
    });
}); 