// Search through books in the Google Books API to get those that match the query
const searchBooks = async query => {
  try {
    let url = `https://www.googleapis.com/books/v1/volumes?q=${query}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()
    return data.items
  } catch (error) {
    console.error('Error searching books:', error)
  }
}

export { searchBooks }
