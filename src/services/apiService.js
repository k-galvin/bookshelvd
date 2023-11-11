// Search through books in the Google Books API to get those that match the query
const searchBooks = async (query, setQueriedBooks) => {
  try {
    let url = `https://www.googleapis.com/books/v1/volumes?q=${query}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()
    setQueriedBooks(data.items)
  } catch (error) {
    console.error('Error searching books:', error)
  }
}

// Find volume whose id is stored in firebase
const findVolume = async (id, setLoggedBook) => {
  try {
    let url = `https://www.googleapis.com/books/v1/volumes/${id}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()
    setLoggedBook(data.items)
  } catch (error) {
    console.error('Error finding volume:', error)
  }
}

export { searchBooks }
export { findVolume }
