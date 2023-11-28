export default function BookInfo({ title, setDisplayInfo, authors, description, averageRating }) {
  const closePopup = () => {
    setDisplayInfo(false)
  }

  return (
    <div className="popup" onClick={closePopup}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="book-title">{title}</div>
        <div className="subtitle">By {authors}</div>
        {averageRating && <div className="subtitle">Rating: {averageRating}</div>}
        <div className="description">{description}</div>
      </div>
    </div>
  )
}
