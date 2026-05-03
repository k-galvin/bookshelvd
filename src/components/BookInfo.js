export default function BookInfo({ title, setDisplayInfo, authors, description, averageRating }) {
  // Function to close popup
  const closePopup = () => {
    setDisplayInfo(false)
  }

  return (
    // Book info popup sharing title, author, rating, and description
    <div className="popup" onClick={closePopup}>
      <div className="popup-content book-info-popup" onClick={e => e.stopPropagation()}>
        <h2 className="log-book-title" style={{ border: 'none' }}>{title}</h2>
        {authors && <div className="log-book-authors">By {authors.join(', ')}</div>}
        
        <div className="book-stats">
          {averageRating && (
            <div className="stat-item">
              <span className="stat-label">GOOGLE RATING:</span>
              <span className="stat-value">{averageRating}/5</span>
            </div>
          )}
        </div>

        <div className="description" style={{ textAlign: 'left', marginTop: '1.5em', color: '#ffffff', lineHeight: '1.6' }}>
          {description || "No description available."}
        </div>
        
        <button className="user-button" style={{ marginTop: '2em' }} onClick={closePopup}>CLOSE</button>
      </div>
    </div>
  )
}
