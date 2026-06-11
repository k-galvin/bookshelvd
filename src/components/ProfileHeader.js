import { Link, useLocation } from 'react-router-dom'

export default function ProfileHeader({ user }) {
  const location = useLocation()
  const path = location.pathname

  const getFirstName = () => {
    if (!user) return ''
    if (user.displayName) return user.displayName.split(' ')[0]
    return user.email ? user.email.split('@')[0] : 'User'
  }

  const getUserInitials = () => {
    if (!user) return ''
    if (user.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }
    return user.email ? user.email.slice(0, 2).toUpperCase() : 'U'
  }

  const items = [
    { name: 'Profile', path: '/profile' },
    { name: 'Books', path: '/book-log' },
    { name: 'Diary', path: '/diary' },
    { name: 'TBR', path: '/tbr' },
    { name: 'Lists', path: '/my-lists' },
    { name: 'Likes', path: '/liked' }
  ]

  return (
    <div className="profile-secondary-nav">
      <div className="profile-sec-left">
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="profile-sec-avatar" />
        ) : (
          <div className="profile-sec-avatar fallback-sec-avatar">
            {getUserInitials()}
          </div>
        )}
        <span className="profile-sec-name">{getFirstName()}</span>
      </div>
      <div className="profile-sec-right">
        {items.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`profile-sec-tab-link ${path === item.path ? 'active' : ''}`}
          >
            {item.name.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  )
}
