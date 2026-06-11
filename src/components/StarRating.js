import { useState } from 'react'

export default function StarRating({ rating = 0, interactive = false, onChange, size = 'medium' }) {
  const [hoverRating, setHoverRating] = useState(null)

  const activeRating = hoverRating !== null ? hoverRating : rating

  const handleMouseMove = (e, index) => {
    if (!interactive) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const isHalf = x < rect.width / 2
    setHoverRating(isHalf ? index - 0.5 : index)
  }

  const handleMouseLeave = () => {
    if (!interactive) return
    setHoverRating(null)
  }

  const handleClick = (e, index) => {
    if (!interactive || !onChange) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const isHalf = x < rect.width / 2
    const val = isHalf ? index - 0.5 : index
    onChange(val)
  }

  const stars = []
  for (let i = 1; i <= 5; i++) {
    let fill = 'empty'
    if (activeRating >= i) {
      fill = 'full'
    } else if (activeRating >= i - 0.5) {
      fill = 'half'
    }

    stars.push(
      <span
        key={i}
        className={`star-container ${fill === 'empty' ? 'is-empty' : ''} ${interactive ? 'interactive' : ''}`}
        onMouseMove={(e) => handleMouseMove(e, i)}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => handleClick(e, i)}
      >
        <span className="star-empty">★</span>
        {fill === 'half' && <span className="star-filled half">★</span>}
        {fill === 'full' && <span className="star-filled full">★</span>}
      </span>
    )
  }

  return (
    <div className={`star-rating-widget size-${size}`}>
      {stars}
    </div>
  )
}
