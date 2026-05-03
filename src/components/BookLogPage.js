import { useState } from 'react'
import { getSortedBooks } from '../services/bookService'
import LoggedBookGrid from './LoggedBookGrid'
import LoginPage from './LoginPage'

export default function BookLogPage({ user, deleteBook, addBook, updateBook, loggedBooks, tbr, loading, addToTBR }) {
  // Initialize sorting to newest logged first
  const [sortOption, setSortOption] = useState('newestToOldestLogged')

  // If not logged in, display login page
  if (!user) {
    return <LoginPage />
  }

  // Sort the loggedBooks array based on the selected sorting option
  const sortedBooks = getSortedBooks(loggedBooks, sortOption)
  
  // Separation logic based on User Rating when sorting by rating, otherwise fallback to Google rating for the "Unrated" section
  const isRatingSort = sortOption.includes('Rating');
  
  const unratedBooks = loggedBooks ? loggedBooks.filter(book => {
    if (isRatingSort) return !book.userRating || book.userRating === 0;
    return book.averageRating === '' || book.averageRating === undefined;
  }) : []
  
  const ratedBooks = sortedBooks ? sortedBooks.filter(book => !unratedBooks.some(ub => ub.id === book.id)) : []
  
  const noPageCountBooks = loggedBooks ? loggedBooks.filter(book => !book.pageCount) : []
  const pageCountBooks = sortedBooks ? sortedBooks.filter(book => !noPageCountBooks.some(np => np.id === book.id)) : []

  return (
    <div className="book-log-page">
      {/* Header containing page title and sorting select */}
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
            <optgroup label="Your Rating">
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
      <div>
        {/* Display loading spinner while books are rendering */}
        {loading && (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        )}

        {sortedBooks && sortedBooks.length !== 0 ? (
          <div className="books-grid-container">
            {sortOption.includes('Rating') && (
              <LoggedBookGrid
                books={ratedBooks}
                addBook={addBook}
                deleteBook={deleteBook}
                updateBook={updateBook}
                user={user}
                loggedBooks={loggedBooks}
                tbr={tbr}
                loading={loading}
                addToTBR={addToTBR}
              />
            )}

            {sortOption.includes('Length') && (
              <LoggedBookGrid
                books={pageCountBooks}
                addBook={addBook}
                deleteBook={deleteBook}
                updateBook={updateBook}
                user={user}
                loggedBooks={loggedBooks}
                tbr={tbr}
                loading={loading}
                addToTBR={addToTBR}
              />
            )}

            {!sortOption.includes('Rating') && !sortOption.includes('Length') && (
              <LoggedBookGrid
                books={sortedBooks}
                addBook={addBook}
                deleteBook={deleteBook}
                updateBook={updateBook}
                user={user}
                loggedBooks={loggedBooks}
                tbr={tbr}
                loading={loading}
                addToTBR={addToTBR}
              />
            )}
          </div>
        ) : (
          <div className="books-grid-container">No Logged Books</div>
        )}

        {/* Books you haven't rated displayed here if sorting by rating */}
        {unratedBooks.length > 0 && sortOption.includes('Rating') && (
          <div className="missing-info-books-grid-container">
            <h2>Unrated by You</h2>
            <LoggedBookGrid
              books={unratedBooks}
              addBook={addBook}
              deleteBook={deleteBook}
              updateBook={updateBook}
              user={user}
              loggedBooks={loggedBooks}
              tbr={tbr}
              loading={loading}
              addToTBR={addToTBR}
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
              updateBook={updateBook}
              user={user}
              loggedBooks={loggedBooks}
              tbr={tbr}
              loading={loading}
              addToTBR={addToTBR}
            />
          </div>
        )}
      </div>
    </div>
  )
}
