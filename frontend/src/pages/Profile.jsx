import { useState } from 'react'

function Profile({ user, setUser }) {
  const [name, setName] = useState(user?.name || 'Security Analyst')
  const [email, setEmail] = useState(user?.email || 'analyst@urlguard.io')
  const [role, setRole] = useState(user?.role || 'Threat Intelligence Analyst')
  const [savedMsg, setSavedMsg] = useState('')

  function handleSave(e) {
    e.preventDefault()
    const updated = {
      ...user,
      name,
      email,
      role
    }
    setUser(updated)
    localStorage.setItem('urlguard_user', JSON.stringify(updated))
    setSavedMsg('Profile updated successfully!')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SA'

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-title-row">
        <div>
          <h1 className="page-heading">My Profile</h1>
          <p className="page-subtitle">Manage your account credentials and system preferences.</p>
        </div>
      </div>

      {savedMsg && (
        <div className="success-banner">
          ✔ {savedMsg}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="card simple-profile-card">
        {/* Profile Avatar Header */}
        <div className="simple-profile-header">
          <div className="large-avatar-circle">
            <span>{initials}</span>
          </div>
          <div className="simple-profile-info">
            <h2 className="simple-profile-name">{name}</h2>
            <div className="simple-profile-role">{role}</div>
            <div className="simple-status-badge">
              <span className="dot-active">●</span> Active Session
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="simple-profile-form">
          <div className="form-two-cols">
            <div className="form-field-item">
              <label className="field-label">Full Name</label>
              <input
                type="text"
                className="clean-input form-box-input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-field-item">
              <label className="field-label">Email Address</label>
              <input
                type="email"
                className="clean-input form-box-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field-item" style={{ marginTop: '1rem' }}>
            <label className="field-label">Assigned Role / Title</label>
            <input
              type="text"
              className="clean-input form-box-input"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            />
          </div>

          <div className="profile-btn-row">
            <button type="submit" className="btn-primary-scan">
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Account Info & Preferences Card */}
      <div className="card account-info-card">
        <h3 className="card-subheading">Account Summary</h3>
        <div className="simple-info-grid">
          <div className="s-info-row">
            <span className="s-info-label">Account Privilege:</span>
            <span className="s-info-value">Administrator</span>
          </div>
          <div className="s-info-row">
            <span className="s-info-label">Security Clearance:</span>
            <span className="s-info-value">Full Access</span>
          </div>
          <div className="s-info-row">
            <span className="s-info-label">Verification Suite:</span>
            <span className="s-info-value">URL Guard Active</span>
          </div>
          <div className="s-info-row">
            <span className="s-info-label">Last Activity:</span>
            <span className="s-info-value">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
