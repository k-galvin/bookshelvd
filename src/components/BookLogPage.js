import { useState } from 'react'
import Book from './Book'

export default function BookLogPage({ user, deleteBook, addBook, loggedBooks }) {
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
      case 'shortestToLongestLength':
        return a.pageCount - b.pageCount
      case 'longestToShortestLength':
        return b.pageCount - a.pageCount
      default:
        return 0
    }
  }

  // Sort the loggedBooks array based on the selected sorting option
  const sortedBooks = loggedBooks ? [...loggedBooks].sort(compareFunction) : null
  const unratedBooks = loggedBooks ? loggedBooks.filter(book => book.averageRating === '') : []
  const ratedBooks = sortedBooks ? sortedBooks.filter(book => !unratedBooks.includes(book)) : []
  const noPageCountBooks = loggedBooks ? loggedBooks.filter(book => book.pageCount === '') : []
  const pageCountBooks = sortedBooks ? sortedBooks.filter(book => !noPageCountBooks.includes(book)) : []

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
        <optgroup label="Book Length">
          <option value="shortestToLongestLength">Shortest First</option>
          <option value="longestToShortestLength">Longest First</option>
        </optgroup>
      </select>

      {/* Display sorted logged books */}
      {sortedBooks ? (
        <ul>
          {/* If sorting by rating, only display those with ratings here */}
          {sortOption.includes('Rating')
            ? ratedBooks.map(book => (
                <li key={book.id}>
                  <Book
                    book={book}
                    cover={book.thumbnail}
                    loggedBooks={loggedBooks}
                    addBook={addBook}
                    deleteBook={deleteBook}
                    user={user}
                    title={book.title}
                  />
                </li>
              ))
            : sortOption.includes('Length')
            ? pageCountBooks.map(book => (
                <li key={book.id}>
                  <Book
                    book={book}
                    cover={book.thumbnail}
                    loggedBooks={loggedBooks}
                    addBook={addBook}
                    deleteBook={deleteBook}
                    user={user}
                    title={book.title}
                  />
                </li>
              ))
            : sortedBooks.map(book => (
                <li key={book.id}>
                  <Book
                    book={book}
                    cover={book.thumbnail}
                    loggedBooks={loggedBooks}
                    addBook={addBook}
                    deleteBook={deleteBook}
                    user={user}
                    title={book.title}
                  />
                </li>
              ))}
        </ul>
      ) : (
        'No Logged Books'
      )}

      {/* Unrated books displayed here if sorting by rating */}
      {unratedBooks.length > 0 && sortOption.includes('Rating') && (
        <div>
          <h2>Unrated Books</h2>
          <ul>
            {unratedBooks.map(book => (
              <li key={book.id}>
                <Book
                  book={book}
                  cover={book.thumbnail}
                  loggedBooks={loggedBooks}
                  addBook={addBook}
                  deleteBook={deleteBook}
                  user={user}
                  title={book.title}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {noPageCountBooks.length > 0 && sortOption.includes('Length') && (
        <div>
          <h2>No Page Count Available</h2>
          <ul>
            {noPageCountBooks.map(book => (
              <li key={book.id}>
                <Book
                  book={book}
                  cover={book.thumbnail}
                  loggedBooks={loggedBooks}
                  addBook={addBook}
                  deleteBook={deleteBook}
                  user={user}
                  title={book.title}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
