// Search through books in the Google Books API to get those that match the query
const searchBooks = async query => {
  // Return empty array if the query is empty
  if (query.trim() === '') {
    return []
  }

  try {
    // Fetch the api response
    let url = `https://www.googleapis.com/books/v1/volumes?q=${query}`
    const response = await fetch(url)

    // Throw an error if there is a problem fetching the response
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()

    // Handle case where the API returns duplicate volumes
    const uniqueBooks = removeDuplicateBooks(data.items)

    // If there are no results to the query, throw an error
    if (uniqueBooks.length === 0) {
      throw new Error('No Search Results')
    }

    // Return the result books
    return uniqueBooks
  } catch (error) {
    throw error
  }
}

// Helper method that removes duplicate results
const removeDuplicateBooks = books => {
  // Return empty array if no books
  if (!Array.isArray(books) || books.length === 0) {
    return []
  }

  // Filter out duplicate books
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
