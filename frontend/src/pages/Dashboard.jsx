import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:5000/api'

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalScans: 0,
    safeCount: 0,
    suspiciousCount: 0,
    invalidCount: 0,
    phishingOrSuspicious: 0,
    lastScan: null,
    topDomains: [],
    trends: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${API_BASE}/stats`)
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        } else {
          // Fallback to /history if stats endpoint unavailable
          const histRes = await fetch(`${API_BASE}/history`)
          if (histRes.ok) {
            const histData = await histRes.json()
            const total = histData.length
            const safe = histData.filter(h => h.finalState === 'valid').length
            const susp = histData.filter(h => h.finalState === 'suspicious').length
            const inv = histData.filter(h => h.finalState === 'invalid').length
            setStats({
              totalScans: total,
              safeCount: safe,
              suspiciousCount: susp,
              invalidCount: inv,
              phishingOrSuspicious: susp + inv,
              lastScan: histData[0]?.createdAt || null,
              topDomains: extractDomains(histData),
              trends: extractTrends(histData)
            })
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  function extractDomains(records) {
    const map = {}
    records.forEach(r => {
      let d = r.originalUrl
      try {
        if (d.startsWith('http://') || d.startsWith('https://')) {
          d = new URL(r.originalUrl).hostname
        } else {
          d = d.split('/')[0].split('?')[0]
        }
      } catch {}
      if (!map[d]) {
        map[d] = { domain: d, count: 0, status: r.finalState, riskLevel: r.riskLevel, lastScanned: r.createdAt }
      }
      map[d].count += 1
    })
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5)
  }

  function extractTrends(records) {
    const map = {}
    records.forEach(r => {
      const d = new Date(r.createdAt).toLocaleDateString()
      if (!map[d]) map[d] = { date: d, legitimate: 0, suspicious: 0, total: 0 }
      map[d].total += 1
      if (r.finalState === 'valid') map[d].legitimate += 1
      else map[d].suspicious += 1
    })
    return Object.values(map)
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return 'No scans recorded'
    const d = new Date(dateStr)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
  }

  const total = stats.totalScans || 0
  const safePercent = total > 0 ? (stats.safeCount / total) * 100 : 50
  const suspPercent = total > 0 ? (stats.phishingOrSuspicious / total) * 100 : 50

  const r = 60
  const circumference = 2 * Math.PI * r
  const safeStroke = (safePercent / 100) * circumference
  const suspStroke = (suspPercent / 100) * circumference

  return (
    <div className="dashboard-page">
      <div className="page-title-row">
        <h1 className="page-heading">Dashboard</h1>
      </div>

      {/* 4 Top Colored Statistic Cards */}
      <div className="stats-grid">
        {/* Card 1: Total Scans */}
        <div className="stat-card stat-blue">
          <div className="stat-content">
            <div className="stat-label">Total Scans</div>
            <div className="stat-value">{loading ? '...' : stats.totalScans}</div>
          </div>
          <div className="stat-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
            </svg>
          </div>
        </div>

        {/* Card 2: Suspicious URLs / Phishing */}
        <div className="stat-card stat-red">
          <div className="stat-content">
            <div className="stat-label">Suspicious URLs</div>
            <div className="stat-value">{loading ? '...' : stats.phishingOrSuspicious}</div>
          </div>
          <div className="stat-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
        </div>

        {/* Card 3: Valid URLs (No Suspicious Pattern) */}
        <div className="stat-card stat-green">
          <div className="stat-content">
            <div className="stat-label">Valid URLs</div>
            <div className="stat-value">{loading ? '...' : stats.safeCount}</div>
          </div>
          <div className="stat-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>

        {/* Card 4: Last Scan */}
        <div className="stat-card stat-orange">
          <div className="stat-content">
            <div className="stat-label">Last Scan</div>
            <div className="stat-timestamp">{loading ? '...' : formatDateTime(stats.lastScan)}</div>
          </div>
          <div className="stat-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Links Section (Cleaned, FAQ replaced with Profile) */}
      <div className="dashboard-section">
        <h2 className="section-title">Quick Links</h2>
        <div className="quick-links-grid">
          <div className="quick-link-card" onClick={() => navigate('/scan')}>
            <div className="ql-icon-box ql-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <div className="ql-text">
              <div className="ql-title">Scan URL</div>
              <div className="ql-desc">Analyze a new URL for threats.</div>
            </div>
          </div>

          <div className="quick-link-card" onClick={() => navigate('/history')}>
            <div className="ql-icon-box ql-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="ql-text">
              <div className="ql-title">Scan History</div>
              <div className="ql-desc">Review your past scan results.</div>
            </div>
          </div>

          <div className="quick-link-card" onClick={() => navigate('/dfa')}>
            <div className="ql-icon-box ql-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="6" cy="6" r="3"></circle>
                <circle cx="18" cy="18" r="3"></circle>
                <path d="M8.5 8.5l7 7"></path>
              </svg>
            </div>
            <div className="ql-text">
              <div className="ql-title">DFA Visualization</div>
              <div className="ql-desc">View automaton state transitions.</div>
            </div>
          </div>

          <div className="quick-link-card" onClick={() => navigate('/profile')}>
            <div className="ql-icon-box ql-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="ql-text">
              <div className="ql-title">User Profile</div>
              <div className="ql-desc">Account settings and credentials.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Charts Row */}
      <div className="charts-grid">
        {/* Left: Scan Trends Chart */}
        <div className="chart-panel">
          <h3 className="chart-title">Scan Trends</h3>
          <div className="chart-container">
            <svg className="native-chart" viewBox="0 0 450 180" width="100%" height="180">
              <line x1="40" y1="20" x2="420" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="60" x2="420" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="100" x2="420" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="140" x2="420" y2="140" stroke="#e2e8f0" strokeWidth="1.5" />

              <text x="25" y="25" fontSize="10" fill="#94a3b8" textAnchor="end">8</text>
              <text x="25" y="65" fontSize="10" fill="#94a3b8" textAnchor="end">6</text>
              <text x="25" y="105" fontSize="10" fill="#94a3b8" textAnchor="end">4</text>
              <text x="25" y="145" fontSize="10" fill="#94a3b8" textAnchor="end">0</text>

              {stats.trends && stats.trends.length > 0 ? (
                <>
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    points={stats.trends.map((t, idx) => {
                      const x = 70 + idx * 80
                      const y = Math.max(25, 140 - (t.legitimate || 1) * 15)
                      return `${x},${y}`
                    }).join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    points={stats.trends.map((t, idx) => {
                      const x = 70 + idx * 80
                      const y = Math.max(25, 140 - (t.suspicious || 0) * 15)
                      return `${x},${y}`
                    }).join(' ')}
                  />
                  {stats.trends.map((t, idx) => {
                    const x = 70 + idx * 80
                    const y1 = Math.max(25, 140 - (t.legitimate || 1) * 15)
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y1} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                        <text x={x} y="160" fontSize="10" fill="#64748b" textAnchor="middle">{t.date}</text>
                      </g>
                    )
                  })}
                </>
              ) : (
                <>
                  <line x1="40" y1="140" x2="420" y2="140" stroke="#cbd5e1" strokeWidth="2" />
                  <circle cx="230" cy="50" r="4.5" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
                  <text x="230" y="160" fontSize="10" fill="#64748b" textAnchor="middle">
                    {new Date().toLocaleDateString()}
                  </text>
                </>
              )}
            </svg>
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot dot-green"></span> Legitimate</span>
            <span className="legend-item"><span className="legend-dot dot-red"></span> Phishing / Suspicious</span>
          </div>
        </div>

        {/* Right: Scan Results Ratio Donut */}
        <div className="chart-panel">
          <h3 className="chart-title">Scan Results Ratio</h3>
          <div className="donut-wrapper">
            <svg viewBox="0 0 200 200" width="160" height="160" className="donut-chart">
              {total === 0 ? (
                <>
                  <circle
                    cx="100" cy="100" r={r}
                    fill="none" stroke="#10b981" strokeWidth="24"
                    strokeDasharray={`${circumference / 2} ${circumference / 2}`}
                    strokeDashoffset={circumference / 4}
                  />
                  <circle
                    cx="100" cy="100" r={r}
                    fill="none" stroke="#ef4444" strokeWidth="24"
                    strokeDasharray={`${circumference / 2} ${circumference / 2}`}
                    strokeDashoffset={-circumference / 4}
                  />
                </>
              ) : (
                <>
                  <circle
                    cx="100" cy="100" r={r}
                    fill="none" stroke="#10b981" strokeWidth="24"
                    strokeDasharray={`${safeStroke} ${circumference}`}
                    strokeDashoffset={0}
                    transform="rotate(-90 100 100)"
                  />
                  <circle
                    cx="100" cy="100" r={r}
                    fill="none" stroke="#ef4444" strokeWidth="24"
                    strokeDasharray={`${suspStroke} ${circumference}`}
                    strokeDashoffset={-safeStroke}
                    transform="rotate(-90 100 100)"
                  />
                </>
              )}
              <circle cx="100" cy="100" r="44" fill="var(--card-bg)" />
            </svg>
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-square sq-green"></span> Legitimate ({stats.safeCount})</span>
            <span className="legend-item"><span className="legend-square sq-red"></span> Phishing ({stats.invalidCount})</span>
            <span className="legend-item"><span className="legend-square sq-orange"></span> Suspicious ({stats.suspiciousCount})</span>
          </div>
        </div>
      </div>

      {/* Top Scanned Domains Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Top Scanned Domains</h2>
        <div className="card table-card">
          {stats.topDomains && stats.topDomains.length > 0 ? (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Domain Name</th>
                  <th>Total Scans</th>
                  <th>Latest Classification</th>
                  <th>Risk Level</th>
                  <th>Last Scanned</th>
                </tr>
              </thead>
              <tbody>
                {stats.topDomains.map((d, i) => (
                  <tr key={i}>
                    <td className="domain-cell">
                      <span className="domain-globe">🌐</span> {d.domain}
                    </td>
                    <td><span className="count-pill">{d.count}</span></td>
                    <td>
                      <span className={`status-pill ${d.status === 'valid' ? 'pill-safe' : d.status === 'suspicious' ? 'pill-suspicious' : 'pill-invalid'}`}>
                        {d.status === 'valid' ? 'Safe' : d.status === 'suspicious' ? 'Suspicious' : 'Invalid'}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-tag risk-${d.riskLevel}`}>{d.riskLevel?.toUpperCase()}</span>
                    </td>
                    <td className="date-cell">{d.lastScanned ? new Date(d.lastScanned).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-table-msg">
              No domains scanned yet. Click <strong>Scan URL</strong> to analyze your first link.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
