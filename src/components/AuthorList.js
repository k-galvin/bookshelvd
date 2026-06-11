import Book from './Book'

export default function AuthorList({ authorBooks, ...props }) {
  return authorBooks && authorBooks.length > 0 ? (
    <div className="books-container home">
      {authorBooks.slice(0, 5).map(book => (
        <div key={book.id}>
          <Book
            book={book}
            cover={
              book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.smallThumbnail
                ? book.volumeInfo.imageLinks.smallThumbnail
                : null
            }
            title={book.volumeInfo.title}
            size="large"
            authors={book.volumeInfo.authors}
            description={book.volumeInfo.description}
            averageRating={book.volumeInfo.averageRating}
            {...props}
          />
        </div>
      ))}
    </div>
  ) : (
    'No results'
  )
}
