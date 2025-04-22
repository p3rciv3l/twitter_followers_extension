describe('Vision API Response Parsing', () => {
    describe('Date Parsing', () => {
        it('should parse valid date formats', () => {
            expect(parseDate('05/15/2024')).toEqual(new Date(2024, 4, 15));
            expect(parseDate('5/15/2024')).toEqual(new Date(2024, 4, 15));
            expect(parseDate('05-15-2024')).toEqual(new Date(2024, 4, 15));
        });

        it('should reject invalid dates', () => {
            expect(() => parseDate('13/15/2024')).toThrow();
            expect(() => parseDate('05/32/2024')).toThrow();
            expect(() => parseDate('not a date')).toThrow();
        });
    });

    describe('Follower Count Parsing', () => {
        it('should parse numeric responses', () => {
            expect(parseFollowerCount('123')).toBe(123);
            expect(parseFollowerCount('+45')).toBe(45);
            expect(parseFollowerCount('-12')).toBe(-12);
        });

        it('should handle invalid responses', () => {
            expect(() => parseFollowerCount('abc')).toThrow();
            expect(() => parseFollowerCount('')).toThrow();
        });
    });
}); 