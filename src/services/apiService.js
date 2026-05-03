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
  const cacheKey = encodeURIComponent(query.trim().toLowerCase());
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  // Try the .env key first, then fallback to Firebase key if needed
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

export { searchBooks }
