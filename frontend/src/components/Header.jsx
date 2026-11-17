import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Header({ user, setUser, darkMode, setDarkMode }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    setUser(null)
    localStorage.removeItem('urlguard_user')
    setDropdownOpen(false)
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SA'

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="system-status-indicator">
          <span className="pulse-dot"></span>
          <span className="status-text">URL Guard Engine Active</span>
        </div>
      </div>

      {/* Top Right Profile / Login Controls */}
      <div className="header-right">
        {/* Dark Mode Quick Toggle */}
        <button
          className="header-icon-btn"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        {/* User Profile in Top Right Corner */}
        {user ? (
          <div className="profile-menu-container" ref={dropdownRef}>
            <button
              className="profile-trigger-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <div className="header-avatar">
                <span>{initials}</span>
              </div>
              <div className="header-user-meta">
                <span className="meta-name">{user.name}</span>
                <span className="meta-role">{user.role}</span>
              </div>
              <span className={`chevron-arrow ${dropdownOpen ? 'rotate' : ''}`}>▾</span>
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-user-header">
                  <div className="dd-name">{user.name}</div>
                  <div className="dd-email">{user.email}</div>
                </div>
                <div className="dropdown-divider"></div>
                <Link
                  to="/profile"
                  className="dropdown-link"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="dd-icon">👤</span> My Profile
                </Link>
                <Link
                  to="/scan"
                  className="dropdown-link"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="dd-icon">🔍</span> Quick Scan
                </Link>
                <Link
                  to="/history"
                  className="dropdown-link"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="dd-icon">📜</span> Scan History
                </Link>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-link logout-link"
                  onClick={handleLogout}
                >
                  <span className="dd-icon">🚪</span> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons-group">
            <Link to="/login" className="btn-signin-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
