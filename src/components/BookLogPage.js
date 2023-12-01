import { useState } from 'react'
import { getSortedBooks } from '../services/bookService'
import LoggedBookGrid from './LoggedBookGrid'
import LoginPage from './LoginPage'

export default function BookLogPage({ user, deleteBook, addBook, loggedBooks, loading }) {
  const [sortOption, setSortOption] = useState('newestToOldestLogged')

  if (!user) {
    return <LoginPage />
  }

  // Sort the loggedBooks array based on the selected sorting option
  const sortedBooks = getSortedBooks(loggedBooks, sortOption)
  const unratedBooks = loggedBooks ? loggedBooks.filter(book => book.averageRating === '') : []
  const ratedBooks = sortedBooks ? sortedBooks.filter(book => !unratedBooks.includes(book)) : []
  const noPageCountBooks = loggedBooks ? loggedBooks.filter(book => book.pageCount === '') : []
  const pageCountBooks = sortedBooks ? sortedBooks.filter(book => !noPageCountBooks.includes(book)) : []

  return (
    <div className="book-log-page">
      <div className="book-log-header">
        <h2 className="book-log-title">Logged Books</h2>

        {/* Dropdown for sorting options */}
        <div className="sort-container">
          <label className="sort-label" htmlFor="sortOptions">
            Sort by
          </label>
          <select
            className="sort-select"
            id="sortOptions"
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
          >
            <optgroup label="Date Logged">
              <option value="newestToOldestLogged">Newest First</option>
              <option value="oldestToNewestLogged">Earliest First</option>
            </optgroup>
            <optgroup label="Release Date">
              <option value="newestToOldestRelease">Newest First</option>
              <option value="oldestToNewestRelease">Earliest First</option>
            </optgroup>
            <optgroup label="Average Rating">
              <option value="highestToLowestRating">Highest First</option>
              <option value="lowestToHighestRating">Lowest First</option>
            </optgroup>
            <optgroup label="Book Length">
              <option value="shortestToLongestLength">Shortest First</option>
              <option value="longestToShortestLength">Longest First</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Display sorted logged books */}
      {sortedBooks.length !== 0 ? (
        <div className="books-grid-container">
          {sortOption.includes('Rating') && (
            <LoggedBookGrid
              books={ratedBooks}
              addBook={addBook}
              deleteBook={deleteBook}
              user={user}
              loggedBooks={loggedBooks}
              loading={loading}
            />
          )}

          {sortOption.includes('Length') && (
            <LoggedBookGrid
              books={pageCountBooks}
              addBook={addBook}
              deleteBook={deleteBook}
              user={user}
              loggedBooks={loggedBooks}
              loading={loading}
            />
          )}

          {!sortOption.includes('Rating') && !sortOption.includes('Length') && (
            <LoggedBookGrid
              books={sortedBooks}
              addBook={addBook}
              deleteBook={deleteBook}
              user={user}
              loggedBooks={loggedBooks}
              loading={loading}
            />
          )}
        </div>
      ) : (
        <div className="books-grid-container">No Logged Books</div>
      )}

      {/* Unrated books displayed here if sorting by rating */}
      {unratedBooks.length > 0 && sortOption.includes('Rating') && (
        <div className="missing-info-books-grid-container">
          <h2>Unrated Books</h2>
          <LoggedBookGrid
            books={unratedBooks}
            addBook={addBook}
            deleteBook={deleteBook}
            user={user}
            loggedBooks={loggedBooks}
            loading={loading}
          />
        </div>
      )}

      {/* No page count books displayed here if sorting by length */}
      {noPageCountBooks.length > 0 && sortOption.includes('Length') && (
        <div className="missing-info-books-grid-container">
          <h2>No Page Count Available</h2>
          <LoggedBookGrid
            books={noPageCountBooks}
            addBook={addBook}
            deleteBook={deleteBook}
            user={user}
            loggedBooks={loggedBooks}
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}
