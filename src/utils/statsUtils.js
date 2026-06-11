/**
 * Calculates the top authors from the user's logged books.
 * @param {Array} loggedBooks 
 * @param {number} limit 
 * @returns {Array} Array of { author: string, count: number }
 */
export function getTopAuthors(loggedBooks = [], limit = 5) {
  const authorCounts = {};
  loggedBooks.forEach(book => {
    const authors = book.authors || [];
    authors.forEach(author => {
      if (author && author.trim()) {
        const trimmed = author.trim();
        authorCounts[trimmed] = (authorCounts[trimmed] || 0) + 1;
      }
    });
  });

  return Object.entries(authorCounts)
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count || a.author.localeCompare(b.author))
    .slice(0, limit);
}

/**
 * Calculates the monthly reading distribution for the trailing 12 months.
 * @param {Array} loggedBooks 
 * @param {Date} currentDate 
 * @returns {Array} Array of 12 items: { monthLabel: string, yearLabel: string, count: number, dateKey: string }
 */
export function getMonthlyReadingData(loggedBooks = [], currentDate = new Date()) {
  const months = [];
  const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 11, 1);

  // Generate trailing 12 months chronologically
  for (let i = 0; i < 12; i++) {
    const d = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
    const monthLabel = d.toLocaleString('default', { month: 'short' }); // e.g. "Jan"
    const yearLabel = d.getFullYear().toString(); // e.g. "2026"
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // "2026-01"
    months.push({
      monthLabel,
      yearLabel,
      count: 0,
      dateKey
    });
  }

  // Count reads
  loggedBooks.forEach(book => {
    let date;
    if (book.dateRead) {
      if (typeof book.dateRead.toDate === 'function') {
        date = book.dateRead.toDate();
      } else {
        date = new Date(book.dateRead);
      }
    } else if (book.createdAt) {
      if (typeof book.createdAt.toDate === 'function') {
        date = book.createdAt.toDate();
      } else {
        date = new Date(book.createdAt);
      }
    }

    if (date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const found = months.find(m => m.dateKey === key);
      if (found) {
        found.count++;
      }
    }
  });

  return months;
}
