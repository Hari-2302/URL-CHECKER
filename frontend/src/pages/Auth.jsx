import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_BASE = 'http://localhost:5000/api/auth'

function Auth({ setUser }) {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)

  // Form Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Errors & Status
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    // Client-side validations
    const cleanEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.')
      return
    }
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.')
      return
    }
    if (!password) {
      setErrorMsg('Please enter your password.')
      return
    }

    if (isRegister) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.')
        return
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.')
        return
      }
    }

    setLoading(true)

    const endpoint = isRegister ? `${API_BASE}/register` : `${API_BASE}/login`
    const payload = isRegister
      ? { name: name.trim(), email: cleanEmail, password, role: 'Security Analyst' }
      : { email: cleanEmail, password }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Authentication failed. Please verify credentials.')
      } else {
        setSuccessMsg(isRegister ? 'Account created! Redirecting...' : 'Signed in! Redirecting...')
        setUser(data.user)
        localStorage.setItem('urlguard_user', JSON.stringify(data.user))

        setTimeout(() => {
          navigate('/')
        }, 500)
      }
    } catch (err) {
      // Network / server unreachable – do NOT let the user bypass login
      setErrorMsg('Unable to reach the server. Please make sure the backend is running and try again.')
    } finally {
      setLoading(false)
    }
  }

  // 1-Click Fast Demo Login
  function handleDemoLogin() {
    setEmail('analyst@urlguard.io')
    setPassword('password123')
    setErrorMsg('')
    setIsRegister(false)

    setLoading(true)
    fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'analyst@urlguard.io', password: 'password123' })
    })
      .then(res => res.json())
      .then(data => {
        const u = data.user || {
          name: 'Security Analyst',
          email: 'analyst@urlguard.io',
          role: 'Threat Intelligence Analyst',
          avatar: 'SA'
        }
        setUser(u)
        localStorage.setItem('urlguard_user', JSON.stringify(u))
        setSuccessMsg('Signed in as Security Analyst!')
        setTimeout(() => navigate('/'), 400)
      })
      .catch(() => {
        setErrorMsg('Unable to reach the server. Please make sure the backend is running and try again.')
        setLoading(false)
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="auth-clean-wrapper">
      <div className="auth-card-simple">
        {/* Top Logo and Header */}
        <div className="auth-header-simple">
          <div className="auth-shield-bubble">
            <span>🛡️</span>
          </div>
          <h1 className="auth-brand-simple">URL GUARD</h1>
          <p className="auth-sub-simple">
            {isRegister ? 'Create an analyst account' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {/* Minimalist Switcher */}
        <div className="auth-pill-switch">
          <button
            type="button"
            className={`pill-switch-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`pill-switch-btn ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="auth-alert-simple alert-error-simple">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="auth-alert-simple alert-success-simple">
            <span>✔</span> {successMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form-simple">
          {isRegister && (
            <div className="simple-input-group">
              <label className="simple-label">Full Name</label>
              <input
                type="text"
                className="simple-input"
                placeholder="Security Analyst"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div className="simple-input-group">
            <label className="simple-label">Email Address</label>
            <input
              type="email"
              className="simple-input"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="simple-input-group">
            <label className="simple-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="simple-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-pw-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="simple-input-group">
              <label className="simple-label">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="simple-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="simple-submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-flex-center">
                <span className="simple-spinner"></span> Please wait...
              </span>
            ) : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          {/* Quick Demo Login Option */}
          {!isRegister && (
            <div className="demo-option-container">
              <div className="divider-line">
                <span>OR</span>
              </div>
              <button
                type="button"
                className="demo-analyst-btn"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                ⚡ 1-Click Demo Analyst Login
              </button>
            </div>
          )}
        </form>

        {/* Footer Navigation */}
        <div className="auth-footer-simple">
          {!isRegister ? (
            <p className="switch-text">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-link-btn"
                onClick={() => { setIsRegister(true); setErrorMsg(''); }}
              >
                Create Account
              </button>
            </p>
          ) : (
            <p className="switch-text">
              Already have an account?{' '}
              <button
                type="button"
                className="text-link-btn"
                onClick={() => { setIsRegister(false); setErrorMsg(''); }}
              >
                Sign In
              </button>
            </p>
          )}

          <Link to="/" className="guest-link">
            ← Continue to Dashboard as Guest
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Auth
