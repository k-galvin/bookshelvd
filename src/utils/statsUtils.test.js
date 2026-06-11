import { getTopAuthors, getMonthlyReadingData } from './statsUtils';

describe('getTopAuthors', () => {
  const mockLoggedBooks = [
    { authors: ['Joan Didion', 'Deborah Levy'] },
    { authors: ['Joan Didion'] },
    { authors: ['Deborah Levy'] },
    { authors: ['Joan Didion'] },
    { authors: ['Rachel Cusk'] }
  ];

  test('correctly calculates top authors and sorts them by count descending', () => {
    const result = getTopAuthors(mockLoggedBooks, 5);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ author: 'Joan Didion', count: 3 });
    expect(result[1]).toEqual({ author: 'Deborah Levy', count: 2 });
    expect(result[2]).toEqual({ author: 'Rachel Cusk', count: 1 });
  });

  test('respects limit parameter', () => {
    const result = getTopAuthors(mockLoggedBooks, 2);
    expect(result).toHaveLength(2);
    expect(result[0].author).toBe('Joan Didion');
    expect(result[1].author).toBe('Deborah Levy');
  });

  test('handles empty or missing authors arrays gracefully', () => {
    const badBooks = [
      { authors: [] },
      { authors: null },
      {}
    ];
    const result = getTopAuthors(badBooks);
    expect(result).toHaveLength(0);
  });
});

describe('getMonthlyReadingData', () => {
  const referenceDate = new Date(2026, 5, 10); // June 10, 2026

  test('returns exactly 12 months in chronological order', () => {
    const result = getMonthlyReadingData([], referenceDate);
    expect(result).toHaveLength(12);
    // starts at July 2025 (since June 2026 is month 12)
    expect(result[0].monthLabel).toBe('Jul');
    expect(result[0].yearLabel).toBe('2025');
    expect(result[11].monthLabel).toBe('Jun');
    expect(result[11].yearLabel).toBe('2026');
  });

  test('counts reads in the appropriate months correctly', () => {
    const mockBooks = [
      { dateRead: new Date(2026, 5, 5) }, // June 2026
      { dateRead: new Date(2026, 5, 1) }, // June 2026
      { dateRead: new Date(2026, 4, 15) }, // May 2026
      { dateRead: new Date(2025, 6, 15) }, // July 2025
      { dateRead: new Date(2025, 5, 15) }, // June 2025 (outside 12 month range)
      { 
        // fallback to createdAt
        createdAt: new Date(2026, 3, 10) // April 2026
      }
    ];

    const result = getMonthlyReadingData(mockBooks, referenceDate);
    
    const july2025 = result.find(m => m.dateKey === '2025-07');
    const april2026 = result.find(m => m.dateKey === '2026-04');
    const may2026 = result.find(m => m.dateKey === '2026-05');
    const june2026 = result.find(m => m.dateKey === '2026-06');

    expect(july2025.count).toBe(1);
    expect(april2026.count).toBe(1);
    expect(may2026.count).toBe(1);
    expect(june2026.count).toBe(2);
  });
});
