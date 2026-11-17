import { useState, useEffect, useCallback } from 'react'

const API_BASE = 'http://localhost:5000/api'

function History() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(API_BASE + '/history')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load analysis history.')
      } else {
        setRecords(data)
      }
    } catch {
      setError('Could not connect to backend server. Make sure Node.js/Express is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this analysis record?')) return
    try {
      const res = await fetch(API_BASE + '/history/' + id, { method: 'DELETE' })
      if (res.ok) {
        setRecords(r => r.filter(rec => rec._id !== id))
      } else {
        alert('Failed to delete history record.')
      }
    } catch {
      alert('Network error while deleting record.')
    }
  }

  function badgeClass(state) {
    if (state === 'valid') return 'badge badge-valid'
    if (state === 'suspicious') return 'badge badge-suspicious'
    return 'badge badge-invalid'
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString()
  }

  function getRiskColor(level) {
    if (level === 'safe') return 'var(--valid)'
    if (level === 'high') return 'var(--invalid)'
    return 'var(--suspicious)'
  }

  return (
    <div>
      <div className="page-header">
        <h1>Analysis History</h1>
        <p>Previously analyzed URLs stored and retrieved from the MongoDB database collection (last 50 records).</p>
      </div>

      {loading && <div className="loading">Retrieving history from MongoDB...</div>}
      {error && <div className="alert alert-warning">{error}</div>}

      {!loading && !error && records.length === 0 && (
        <div className="card empty-state">
          <div className="icon">📋</div>
          <p>No history records found in MongoDB. Go to the URL Checker or Home page to analyze your first URL.</p>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="card" style={{padding: 0, overflowX: 'auto'}}>
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>URL</th>
                <th>Result</th>
                <th>Risk</th>
                <th>Analyzed Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => (
                <tr key={rec._id}>
                  <td>{i + 1}</td>
                  <td className="url-cell">{rec.originalUrl}</td>
                  <td><span className={badgeClass(rec.finalState)}>{rec.finalState.toUpperCase()}</span></td>
                  <td style={{fontWeight: 700, color: getRiskColor(rec.riskLevel)}}>{rec.riskLevel.toUpperCase()}</td>
                  <td style={{fontSize: '0.82rem', whiteSpace: 'nowrap'}}>{formatDate(rec.createdAt)}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(rec._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default History
