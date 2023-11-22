import { useState } from 'react'
import { getSortedBooks } from '../services/bookService'
import BookGrid from './BookGrid'

export default function BookLogPage({ user, deleteBook, addBook, loggedBooks }) {
  const [sortOption, setSortOption] = useState('newestToOldest')

  // Sort the loggedBooks array based on the selected sorting option
  const sortedBooks = getSortedBooks(loggedBooks, sortOption)
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
        <div>
          {sortOption.includes('Rating') && (
            <BookGrid
              books={ratedBooks}
              addBook={addBook}
              deleteBook={deleteBook}
              user={user}
              loggedBooks={loggedBooks}
            />
          )}

          {sortOption.includes('Length') && (
            <BookGrid
              books={pageCountBooks}
              addBook={addBook}
              deleteBook={deleteBook}
              user={user}
              loggedBooks={loggedBooks}
            />
          )}

          {!sortOption.includes('Rating') && !sortOption.includes('Length') && (
            <BookGrid
              books={sortedBooks}
              addBook={addBook}
              deleteBook={deleteBook}
              user={user}
              loggedBooks={loggedBooks}
            />
          )}
        </div>
      ) : (
        'No Logged Books'
      )}

      {/* Unrated books displayed here if sorting by rating */}
      {unratedBooks.length > 0 && sortOption.includes('Rating') && (
        <div>
          <h2>Unrated Books</h2>
          <BookGrid
            books={unratedBooks}
            addBook={addBook}
            deleteBook={deleteBook}
            user={user}
            loggedBooks={loggedBooks}
          />
        </div>
      )}

      {/* No page count books displayed here if sorting by length */}
      {noPageCountBooks.length > 0 && sortOption.includes('Length') && (
        <div>
          <h2>No Page Count Available</h2>
          <BookGrid
            books={noPageCountBooks}
            addBook={addBook}
            deleteBook={deleteBook}
            user={user}
            loggedBooks={loggedBooks}
          />
        </div>
      )}
    </div>
  )
}
