describe('CSV Handling', () => {
    const mockData = [
        { date: '05/15/2024', newFollows: 10, unfollows: 2 },
        { date: '05/16/2024', newFollows: 15, unfollows: 5 }
    ];

    describe('CSV Creation', () => {
        it('should create valid CSV structure', async () => {
            const csv = await createCsv(mockData);
            const lines = csv.split('\n');
            
            expect(lines[0]).toBe('Date,New Follows,Unfollows');
            expect(lines[1]).toContain('05/15/2024');
            expect(lines).toHaveLength(3); // header + 2 data rows
        });

        it('should sort entries by date', async () => {
            const unsortedData = [
                { date: '05/16/2024', newFollows: 15, unfollows: 5 },
                { date: '05/15/2024', newFollows: 10, unfollows: 2 }
            ];
            
            const csv = await createCsv(unsortedData);
            const lines = csv.split('\n');
            expect(lines[1]).toContain('05/15/2024');
        });
    });

    describe('Duplicate Handling', () => {
        it('should skip duplicate dates', async () => {
            const dataWithDuplicates = [
                ...mockData,
                { date: '05/15/2024', newFollows: 20, unfollows: 8 }
            ];
            
            const csv = await createCsv(dataWithDuplicates);
            const lines = csv.split('\n');
            expect(lines).toHaveLength(3); // Should not include duplicate
        });
    });
}); 