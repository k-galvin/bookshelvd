import { useState } from 'react'

export default function BookLogPage({ user, deleteBook, loggedBooks }) {
  const [sortOption, setSortOption] = useState('newestToOldest')

  // Function to compare two books based on the selected sorting option
  const compareFunction = (a, b) => {
    switch (sortOption) {
      case 'oldestToNewestRelease':
        return new Date(a.publishedDate) - new Date(b.publishedDate)
      case 'newestToOldestRelease':
        return new Date(b.publishedDate) - new Date(a.publishedDate)
      case 'highestToLowestRating':
        return b.averageRating - a.averageRating
      case 'lowestToHighestRating':
        return a.averageRating - b.averageRating
      case 'oldestToNewestLogged':
        return a.dateLogged - b.dateLogged
      case 'newestToOldestLogged':
        return b.dateLogged - a.dateLogged
      default:
        return 0
    }
  }

  // Sort the loggedBooks array based on the selected sorting option
  const sortedBooks = loggedBooks ? [...loggedBooks].sort(compareFunction) : null

  return (
    <div>
      <h2>Logged Books</h2>

      {/* Dropdown for sorting options */}
      <label htmlFor="sortOptions">Sort by: </label>
      <select id="sortOptions" value={sortOption} onChange={e => setSortOption(e.target.value)}>
        <optgroup label="Release Date">
          <option value="newestToOldestRelease">Newest First</option>
          <option value="oldestToNewestRelease">Earliest First</option>
        </optgroup>
        <optgroup label="Average Rating">
          <option value="highestToLowestRating">Highest First</option>
          <option value="lowestToHighestRating">Lowest First</option>
        </optgroup>
        <optgroup label="Date Logged">
          <option value="newestToOldestLogged">Newest First</option>
          <option value="oldestToNewestLogged">Earliest First</option>
        </optgroup>
      </select>

      {/* Display sorted logged books */}
      {sortedBooks ? (
        <ul>
          {sortedBooks.map(book => (
            <li key={book.id}>
              <div className="book-container">
                {book.thumbnail ? (
                  <img src={book.thumbnail} className="cover-img" alt={`${book.title} Cover`} />
                ) : (
                  <div className="alt-cover">{book.title}</div>
                )}

                {/* Button to remove a book from log */}
                <button onClick={() => deleteBook(user, book)} className="remove-button">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        'No Logged Books'
      )}
    </div>
  )
}
