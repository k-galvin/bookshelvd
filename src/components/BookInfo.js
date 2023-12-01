export default function BookInfo({ title, setDisplayInfo, authors, description, averageRating }) {
  // Function to close popup
  const closePopup = () => {
    setDisplayInfo(false)
  }

  return (
    // Book info popup sharing title, author, rating, and description
    <div className="popup" onClick={closePopup}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="book-title">{title}</div>
        {authors && <div className="subtitle">By {authors}</div>}
        {averageRating && <div className="subtitle">Rating: {averageRating}</div>}
        <div className="description">{description}</div>
      </div>
    </div>
  )
}
