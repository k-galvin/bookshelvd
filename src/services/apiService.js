// Caching layer to prevent unnecessary API calls and save quota
const getCachedData = (key) => {
  const cached = sessionStorage.getItem(`bookshelvd_cache_${key}`);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // Cache expires after 1 hour
    if (Date.now() - timestamp < 3600000) {
      return data;
    }
  }
  return null;
};

const setCachedData = (key, data) => {
  sessionStorage.setItem(`bookshelvd_cache_${key}`, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};

// Search through books in the Google Books API to get those that match the query
const searchBooks = async query => {
  if (!query || query.trim() === '') {
    return []
  }

  // Check cache first
  const cacheKey = `search_${encodeURIComponent(query.trim().toLowerCase())}`;
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;

  try {
    const params = new URLSearchParams({ q: query });
    if (apiKey && apiKey !== 'undefined') {
      params.append('key', apiKey);
    }

    let url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`
    
    // Log the attempt (obscuring the key)
    const logUrl = url.replace(/key=[^&]+/, 'key=AIzaSy...REDACTED');
    console.log(`Fetching from Google Books: ${logUrl}`);

    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      
      if (response.status === 429) {
        throw new Error("Google Books API quota exceeded. Please check your API Key and Project Quotas in Google Cloud Console.")
      }

      const errorMessage = errorData.error?.message || response.statusText;
      throw new Error(`Google Books API Error: ${response.status} - ${errorMessage}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      setCachedData(cacheKey, []);
      return []
    }

    const uniqueBooks = removeDuplicateBooks(data.items)
    setCachedData(cacheKey, uniqueBooks);
    return uniqueBooks
  } catch (error) {
    console.error('searchBooks error:', error);
    throw error
  }
}

// Fetch a specific book by its Google Books ID
const fetchBookById = async bookId => {
  if (!bookId) return null;

  const cacheKey = `book_${bookId}`;
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;

  try {
    const params = new URLSearchParams({});
    if (apiKey && apiKey !== 'undefined') {
      params.append('key', apiKey);
    }

    let url = `https://www.googleapis.com/books/v1/volumes/${bookId}?${params.toString()}`
    
    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(`Google Books API Error: ${response.status}`)
    }

    const data = await response.json()
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('fetchBookById error:', error);
    throw error
  }
}

const removeDuplicateBooks = books => {
  if (!Array.isArray(books) || books.length === 0) {
    return []
  }
  const seen = new Set()
  return books.filter(book => {
    const bookId = book.id
    if (!seen.has(bookId)) {
      seen.add(bookId)
      return true
    }
    return false
  })
}

// Fetch the original publication year from Open Library
const fetchOriginalPublicationYear = async (title, author) => {
  if (!title) return null;

  // Clean the title - remove subtitles and anything in parentheses
  const cleanTitle = title.split(':')[0].split('(')[0].trim();
  const authorQuery = author || '';

  // Use v2 cache key to clear out any old 1900 placeholder results
  const cacheKey = `ol_year_v2_${encodeURIComponent(cleanTitle)}_${encodeURIComponent(authorQuery)}`;
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult !== null) return cachedResult;

  try {
    // Strategy 1: Search with specific title and author fields
    const query = new URLSearchParams({
      title: cleanTitle,
      author: authorQuery,
      limit: 10
    });

    let url = `https://openlibrary.org/search.json?${query.toString()}`;
    let response = await fetch(url);
    let data = await response.json();

    // Strategy 2: If no results, try a broader 'q' search
    if (!data.docs || data.docs.length === 0) {
      const broadQuery = new URLSearchParams({
        q: `${cleanTitle} ${authorQuery}`,
        limit: 10
      });
      url = `https://openlibrary.org/search.json?${broadQuery.toString()}`;
      response = await fetch(url);
      data = await response.json();
    }

    if (!data.docs || data.docs.length === 0) {
      setCachedData(cacheKey, null);
      return null;
    }

    // Find the minimum year among the results that match our author
    let minYear = Infinity;
    const targetAuthor = authorQuery.toLowerCase();

    data.docs.forEach(doc => {
      // Robust author check
      const hasAuthorMatch = doc.author_name?.some(name => {
        const n = name.toLowerCase();
        return n.includes(targetAuthor) || targetAuthor.includes(n);
      });

      if (hasAuthorMatch) {
        // Collect all potential years from this document
        const potentialYears = [
          doc.first_publish_year,
          ...(doc.publish_year || [])
        ].filter(y => y && typeof y === 'number' && y > 1901);

        if (potentialYears.length > 0) {
          const docMin = Math.min(...potentialYears);
          if (docMin < minYear) {
            minYear = docMin;
          }
        }
      }
    });

    const resultYear = minYear === Infinity ? null : minYear;
    setCachedData(cacheKey, resultYear);
    return resultYear;
  } catch (error) {
    console.error('Error fetching original publication year:', error);
    return null;
  }
};

export { searchBooks, fetchBookById, fetchOriginalPublicationYear }
