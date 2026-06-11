import Book from './Book'

export default function LoggedBookGrid({ books, ...props }) {
  return (
    <div>
      <div>
        {books ? (
          <div className="books-container">
            {books.map(book => (
              <div key={book.id}>
                <Book
                  book={book}
                  cover={book.thumbnail}
                  title={book.title}
                  authors={book.authors}
                  description={book.description}
                  averageRating={book.averageRating}
                  {...props}
                />
              </div>
            ))}
          </div>
        ) : (
          'No logged books'
        )}
      </div>
    </div>
  )
}
