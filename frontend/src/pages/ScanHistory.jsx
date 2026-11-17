import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:5000/api'

function ScanHistory() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/history`)
      if (!res.ok) throw new Error('Failed to fetch history')
      const data = await res.json()
      setHistory(data)
    } catch {
      setError('Could not connect to backend server. Ensure Express is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  async function handleDelete(id, url) {
    if (!window.confirm(`Delete scan record for:\n${url}?`)) return
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setHistory(prev => prev.filter(item => item._id !== id))
      } else {
        alert('Failed to delete history item.')
      }
    } catch {
      alert('Error communicating with the database.')
    }
  }

  const filteredHistory = history.filter(item =>
    item.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Compact Date/Time formatting to preserve horizontal screen width
  function formatCompactDateTime(dateStr) {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`
  }

  return (
    <div className="page-container">
      {/* Top Header Row with Search & Action */}
      <div className="page-title-row history-header-row">
        <div>
          <h1 className="page-heading">Scan History</h1>
          <p className="page-subtitle">Real-time repository of verified URL records stored in MongoDB Atlas.</p>
        </div>
        <div className="header-action-group">
          <div className="search-input-wrapper">
            <span className="search-mini-icon">🔍</span>
            <input
              type="text"
              className="filter-input-compact"
              placeholder="Filter by URL or domain..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-mini-btn" onClick={() => setSearchQuery('')}>&times;</button>
            )}
          </div>
          <Link to="/scan" className="btn-primary-small">
            + New Scan
          </Link>
        </div>
      </div>

      {loading && (
        <div className="card loading-card">
          <div className="spinner"></div>
          <p>Retrieving scan records from database...</p>
        </div>
      )}

      {error && <div className="error-alert">{error}</div>}

      {!loading && !error && history.length === 0 && (
        <div className="card empty-state-card">
          <div className="empty-icon">📁</div>
          <h3 className="empty-title">No Scan Records Found</h3>
          <p className="empty-text">There are currently no analysis records in the database. Analyze a URL to begin logging.</p>
          <Link to="/scan" className="btn-primary-small" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Go to URL Scan
          </Link>
        </div>
      )}

      {/* Full-Width Compact History Table (No horizontal scroll needed on desktop) */}
      {!loading && history.length > 0 && (
        <div className="card table-card history-table-card">
          <div className="table-responsive-compact">
            <table className="custom-table history-compact-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>Target URL</th>
                  <th style={{ width: '135px' }}>Date &amp; Time</th>
                  <th style={{ width: '75px', textAlign: 'center' }}>Regex</th>
                  <th style={{ width: '75px', textAlign: 'center' }}>DFA</th>
                  <th style={{ width: '95px', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>Risk</th>
                  <th style={{ width: '50px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, idx) => (
                  <tr key={item._id}>
                    <td className="row-num" style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td className="url-cell-compact" title={item.originalUrl}>
                      <span className="url-globe-icon">🌐</span>
                      <span className="url-string-display">{item.originalUrl}</span>
                    </td>
                    <td className="date-cell-compact">{formatCompactDateTime(item.createdAt)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`mini-badge-compact ${item.regexResult?.isValid !== false ? 'badge-pass' : 'badge-fail'}`}>
                        {item.regexResult?.isValid !== false ? '✔ Valid' : '✖ Fail'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`mini-badge-compact ${item.dfaResult?.isAccepted ? 'badge-pass' : 'badge-fail'}`}>
                        {item.dfaResult?.isAccepted ? `✔ ${item.dfaResult.finalState || 'Pass'}` : `✖ ${item.dfaResult?.finalState || 'Trap'}`}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {/* Use securityStatus (new) or fall back to finalState (legacy) */}
                      {(() => {
                        const st = item.securityStatus ||
                          (item.finalState === 'valid' ? 'NO_SUSPICIOUS_PATTERN' :
                           item.finalState === 'suspicious' ? 'SUSPICIOUS' : 'INVALID')
                        return (
                          <span className={`status-pill-compact ${st === 'NO_SUSPICIOUS_PATTERN' ? 'pill-safe' : st === 'SUSPICIOUS' ? 'pill-suspicious' : 'pill-invalid'}`}>
                            {st === 'NO_SUSPICIOUS_PATTERN' ? 'No Susp.' : st === 'SUSPICIOUS' ? 'Suspicious' : 'Invalid'}
                          </span>
                        )
                      })()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`risk-tag-compact risk-${item.riskLevel}`}>
                        {item.riskLevel?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="delete-action-btn-compact"
                        onClick={() => handleDelete(item._id, item.originalUrl)}
                        title="Delete Record"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer-info-compact">
            Showing {filteredHistory.length} of {history.length} records retrieved from MongoDB Atlas.
          </div>
        </div>
      )}
    </div>
  )
}

export default ScanHistory
