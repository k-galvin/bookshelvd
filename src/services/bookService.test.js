import { getSortedBooks } from './bookService';

describe('getSortedBooks', () => {
  const mockBooks = [
    { 
      id: '1', 
      title: 'The White Album', 
      originalYear: 1979, 
      publishedDate: '2024-01-01',
      userRating: 5,
      dateRead: { toMillis: () => 1700000000000 } // Recent
    },
    { 
      id: '2', 
      title: 'Play It As It Lays', 
      originalYear: 1970, 
      publishedDate: '2005-05-05',
      userRating: 4,
      dateRead: { toMillis: () => 1600000000000 } // Older
    },
    { 
      id: '3', 
      title: 'Foster', 
      originalYear: 2010, 
      publishedDate: '2022-01-01',
      userRating: 5,
      dateRead: { toMillis: () => 1650000000000 } // Middle
    },
    { 
      id: '4', 
      title: 'New Edition Book', 
      originalYear: null, 
      publishedDate: '2023',
      userRating: 3,
      dateRead: { toMillis: () => 1680000000000 }
    }
  ];

  test('sorts oldest to newest release correctly using originalYear', () => {
    const sorted = getSortedBooks(mockBooks, 'oldestToNewestRelease');
    expect(sorted[0].title).toBe('Play It As It Lays'); // 1970
    expect(sorted[1].title).toBe('The White Album');    // 1979
    expect(sorted[2].title).toBe('Foster');             // 2010
    expect(sorted[3].title).toBe('New Edition Book');   // 2023
  });

  test('sorts newest to oldest release correctly using originalYear', () => {
    const sorted = getSortedBooks(mockBooks, 'newestToOldestRelease');
    expect(sorted[0].title).toBe('New Edition Book');   // 2023
    expect(sorted[1].title).toBe('Foster');             // 2010
    expect(sorted[2].title).toBe('The White Album');    // 1979
    expect(sorted[3].title).toBe('Play It As It Lays'); // 1970
  });

  test('sorts by user rating correctly', () => {
    const sorted = getSortedBooks(mockBooks, 'highestToLowestRating');
    expect(sorted[0].userRating).toBe(5);
    expect(sorted[sorted.length - 1].userRating).toBe(3);
  });

  test('sorts by date read correctly', () => {
    const sorted = getSortedBooks(mockBooks, 'newestToOldestLogged');
    expect(sorted[0].title).toBe('The White Album'); // 1700...
    expect(sorted[sorted.length - 1].title).toBe('Play It As It Lays'); // 1600...
  });

  test('handles missing dates gracefully', () => {
    const missingDateBooks = [
      { id: '1', title: 'A', publishedDate: '' },
      { id: '2', title: 'B', originalYear: 2000 }
    ];
    const sorted = getSortedBooks(missingDateBooks, 'oldestToNewestRelease');
    expect(sorted[0].title).toBe('A'); // Year 0 comes first
    expect(sorted[1].title).toBe('B');
  });
});
