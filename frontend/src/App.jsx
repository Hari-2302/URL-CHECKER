import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import URLScan from './pages/URLScan'
import ScanHistory from './pages/ScanHistory'
import Profile from './pages/Profile'
import DFAVisualization from './pages/DFAVisualization'
import FAQ from './pages/FAQ'
import Auth from './pages/Auth'

function App() {
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('urlguard_theme') === 'dark'
  })

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('urlguard_user')
    if (saved) {
      try { return JSON.parse(saved) } catch {}
    }
    return {
      name: 'Security Analyst',
      email: 'analyst@urlguard.io',
      role: 'Threat Intelligence Analyst',
      avatar: 'SA'
    }
  })

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('urlguard_theme', 'dark')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('urlguard_theme', 'light')
    }
  }, [darkMode])

  function handleLogout() {
    setUser(null)
    localStorage.removeItem('urlguard_user')
  }

  // Check if current route is a standalone auth page
  const isAuthPage = ['/login', '/signin', '/register'].includes(location.pathname.toLowerCase())

  if (isAuthPage) {
    return (
      <div className={`auth-fullscreen-layout ${darkMode ? 'dark-theme' : 'light-theme'}`}>
        <Routes>
          <Route path="/login" element={<Auth setUser={setUser} />} />
          <Route path="/signin" element={<Auth setUser={setUser} />} />
          <Route path="/register" element={<Auth setUser={setUser} />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className={`app-layout ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Left Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Viewport containing Top Header + Page Content */}
      <div className="main-viewport-wrapper">
        <Header
          user={user}
          setUser={setUser}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="main-viewport">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/scan" element={<URLScan />} />
            <Route path="/checker" element={<Navigate to="/scan" replace />} />
            <Route path="/history" element={<ScanHistory />} />
            <Route path="/dfa" element={<DFAVisualization />} />
            <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
