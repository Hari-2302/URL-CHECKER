import { useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE = 'http://localhost:5000/api'

function URLScan() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [showFullTrace, setShowFullTrace] = useState(false)

  async function handleScan(targetUrl) {
    const urlToScan = targetUrl || url
    if (targetUrl) setUrl(targetUrl)

    if (!urlToScan.trim()) {
      setError('Please enter a valid URL to analyze.')
      return
    }

    setError('')
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScan.trim() })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'URL analysis failed.')
      } else {
        setResult(data)
      }
    } catch {
      setError('Could not connect to the backend server. Make sure Node.js is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate security score based on securityStatus (new) or finalState (legacy)
  function getSecurityScore(data) {
    if (!data) return 0
    const status = data.securityStatus || (data.finalState === 'valid' ? 'NO_SUSPICIOUS_PATTERN' : data.finalState === 'suspicious' ? 'SUSPICIOUS' : 'INVALID')
    if (status === 'NO_SUSPICIOUS_PATTERN') return 95
    if (status === 'SUSPICIOUS') {
      const count = data.suspiciousIndicators?.length || data.suspiciousReasons?.length || 1
      return Math.max(20, 65 - count * 15)
    }
    return 8
  }

  // Helper: get security status from result (supports both new and legacy API)
  function getSecStatus(data) {
    if (!data) return 'INVALID'
    return data.securityStatus ||
      (data.finalState === 'valid' ? 'NO_SUSPICIOUS_PATTERN' :
       data.finalState === 'suspicious' ? 'SUSPICIOUS' : 'INVALID')
  }

  const score = result ? getSecurityScore(result) : null
  const secStatus = result ? getSecStatus(result) : null
  const scoreColor = score >= 80 ? '#10b981' : score >= 35 ? '#f59e0b' : '#ef4444'

  return (
    <div className="page-container">
      {/* Scanner Header Banner */}
      <div className="scanner-hero-banner">
        <div className="scanner-hero-text">
          <div className="scanner-badge-row">
            <span className="live-radar-badge">
              <span className="radar-ping"></span> Real-Time Security Engine
            </span>
            <span className="engine-tag">DFA + Regex Dual Verification</span>
          </div>
          <h1 className="scanner-hero-title">Intelligent URL Threat &amp; Syntax Scanner</h1>
          <p className="scanner-hero-desc">
            Instantly evaluate web addresses against IETF RFC 3986 URI grammars and a 14-state Deterministic Finite Automaton.
          </p>
        </div>
      </div>

      {/* Modern URL Input Card */}
      <div className="card attractive-search-card">
        <form onSubmit={e => { e.preventDefault(); handleScan(); }} className="scanner-input-form">
          <div className="search-bar-inner">
            <span className="search-globe-icon">🌐</span>
            <input
              type="text"
              className="scanner-main-input"
              placeholder="Paste or type URL to scan (e.g. https://www.google.com)..."
              value={url}
              onChange={e => { setUrl(e.target.value); setError('') }}
            />
            {url && (
              <button type="button" className="clear-search-btn" onClick={() => setUrl('')}>&times;</button>
            )}
          </div>
          <button type="submit" className="scanner-submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-flex-center">
                <span className="scanner-spinner"></span> Analyzing...
              </span>
            ) : (
              <span className="btn-flex-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Scan URL
              </span>
            )}
          </button>
        </form>

        {error && <div className="error-alert">{error}</div>}

        {/* Quick Test Chips */}
        <div className="sample-chips-row">
          <span className="chips-label">Try quick samples:</span>
          <button type="button" className="sample-pill pill-safe-chip" onClick={() => handleScan('https://www.google.com')}>
            🟢 Google (Safe)
          </button>
          <button type="button" className="sample-pill pill-safe-chip" onClick={() => handleScan('https://github.com')}>
            🟢 GitHub (Safe)
          </button>
          <button type="button" className="sample-pill pill-safe-chip" onClick={() => handleScan('https://example.com/login')}>
            🟢 Login Path (Safe)
          </button>
          <button type="button" className="sample-pill pill-suspicious-chip" onClick={() => handleScan('http://192.168.1.1/admin')}>
            🟡 Raw IP (Suspicious)
          </button>
          <button type="button" className="sample-pill pill-suspicious-chip" onClick={() => handleScan('http://bit.ly/secure-login')}>
            🟡 Shortener (Suspicious)
          </button>
          <button type="button" className="sample-pill pill-suspicious-chip" onClick={() => handleScan('https://example.com/verify-account?redirect=http://evil.com')}>
            🟡 Redirect Param
          </button>
          <button type="button" className="sample-pill pill-suspicious-chip" onClick={() => handleScan('https://example.com/login?next=https://evil.com')}>
            🟡 Open Redirect
          </button>
          <button type="button" className="sample-pill pill-danger-chip" onClick={() => handleScan('https://example.com@evil.com')}>
            🔴 @ Phishing
          </button>
          <button type="button" className="sample-pill pill-danger-chip" onClick={() => handleScan('htt://example.com')}>
            🔴 Bad Protocol
          </button>
          <button type="button" className="sample-pill pill-danger-chip" onClick={() => handleScan('https://')}>
            🔴 No Domain
          </button>
          <button type="button" className="sample-pill pill-danger-chip" onClick={() => handleScan('example')}>
            🔴 Not a URL
          </button>
        </div>
      </div>

      {/* Attractive Scan Results Dashboard */}
      {result && (
        <div className="results-wrapper">
          {/* Main Security Score & Verdict Banner */}
          <div className="card verdict-card">
            {/* Score Ring Gauge */}
            <div className="score-gauge-column">
              <div className="circular-score-box" style={{ borderColor: scoreColor }}>
                <span className="score-number" style={{ color: scoreColor }}>{score}</span>
                <span className="score-denom">/100</span>
              </div>
              <span className="score-caption">Security Score</span>
            </div>

            {/* Target URL & Verdict Details */}
            <div className="verdict-info-column">
              <div className="target-url-label">Analyzed Target</div>
              <div className="target-url-string">{result.originalUrl}</div>
              <div className="verdict-summary-text">
                {secStatus === 'NO_SUSPICIOUS_PATTERN' && 'URL structure is valid (Regex ✔ + DFA ✔) and no suspicious patterns were detected.'}
                {secStatus === 'SUSPICIOUS' && 'URL structure is valid (Regex ✔ + DFA ✔) but suspicious patterns were detected. A structurally valid URL is NOT necessarily a safe website.'}
                {secStatus === 'INVALID' && 'URL failed structural validation (Regex ✖ or DFA ✖). The URL does not conform to standard URL syntax.'}
              </div>
            </div>

            {/* Status Pills */}
            <div className="verdict-status-column">
              <div className="verdict-badge-item">
                <span className="verdict-sub-label">Security Analysis</span>
                <span className={`verdict-pill-large ${secStatus === 'NO_SUSPICIOUS_PATTERN' ? 'vp-safe' : secStatus === 'SUSPICIOUS' ? 'vp-suspicious' : 'vp-invalid'}`}>
                  {secStatus === 'NO_SUSPICIOUS_PATTERN' ? '✔ NO SUSPICIOUS PATTERN' :
                   secStatus === 'SUSPICIOUS'             ? '⚠ SUSPICIOUS PATTERN' :
                                                           '✖ INVALID URL'}
                </span>
              </div>
              <div className="verdict-badge-item">
                <span className="verdict-sub-label">Risk Level</span>
                <span className={`risk-tag-large risk-${result.riskLevel}`}>
                  {result.riskLevel?.toUpperCase()} RISK
                </span>
              </div>
            </div>
          </div>

          {/* 4 Quick Metric Cards in Row */}
          <div className="metrics-row-grid">
            {/* 1. Regex Validation Result */}
            <div className="metric-box">
              <div className="metric-icon-bubble">📝</div>
              <div className="metric-meta">
                <div className="metric-title">① Regex Validation</div>
                <div className={`metric-status ${result.regexResult.isValid ? 'metric-good' : 'metric-bad'}`}>
                  {result.regexResult.isValid ? '✔ Valid Structure' : '✖ Invalid Structure'}
                </div>
              </div>
            </div>

            {/* 2. DFA Validation Result */}
            <div className="metric-box">
              <div className="metric-icon-bubble">🤖</div>
              <div className="metric-meta">
                <div className="metric-title">② DFA Automaton</div>
                <div className={`metric-status ${result.dfaResult.isAccepted ? 'metric-good' : 'metric-bad'}`}>
                  {result.dfaResult.isAccepted ? `✔ Accepted (${result.dfaResult.finalState})` : `✖ Rejected (${result.dfaResult.finalState})`}
                </div>
              </div>
            </div>

            {/* 3. Security Analysis Result */}
            <div className="metric-box">
              <div className="metric-icon-bubble">🔍</div>
              <div className="metric-meta">
                <div className="metric-title">③ Security Analysis</div>
                <div className={`metric-status ${secStatus === 'NO_SUSPICIOUS_PATTERN' ? 'metric-good' : secStatus === 'SUSPICIOUS' ? 'metric-warn' : 'metric-bad'}`}>
                  {secStatus === 'NO_SUSPICIOUS_PATTERN' ? '✔ No Suspicious Pattern' :
                   secStatus === 'SUSPICIOUS'             ? '⚠ Suspicious Pattern' :
                   '✖ Invalid URL'}
                </div>
              </div>
            </div>

            {/* 4. Transport Security */}
            <div className="metric-box">
              <div className="metric-icon-bubble">
                {result.originalUrl.startsWith('https://') ? '🔒' : '🔓'}
              </div>
              <div className="metric-meta">
                <div className="metric-title">Transport Security</div>
                <div className={`metric-status ${result.originalUrl.startsWith('https://') ? 'metric-good' : 'metric-warn'}`}>
                  {result.originalUrl.startsWith('https://') ? 'HTTPS Encrypted' : 'Insecure HTTP'}
                </div>
              </div>
            </div>
          </div>

          {/* Dual Verification Panels */}
          <div className="validation-dual-grid">
            {/* Regex Card */}
            <div className="card validation-card">
              <div className="card-header-flex">
                <div className="card-title-with-icon">
                  <span className="method-badge-icon">📝</span>
                  <div>
                    <h3 className="card-subheading" style={{ margin: 0 }}>Regular Expression Analysis</h3>
                    <span className="card-subtitle-small">Type-3 Regular Language Validation</span>
                  </div>
                </div>
                <span className={`method-pill-tag ${result.regexResult.isValid ? 'tag-safe' : 'tag-danger'}`}>
                  {result.regexResult.isValid ? '✔ COMPLIANT' : '✖ REJECTED'}
                </span>
              </div>

              <div className="validation-body-attractive">
                <div className="attr-info-box">
                  <div className="attr-label">Pattern Match Outcome</div>
                  <div className="attr-value-highlight">
                    {result.regexResult.matchedPattern || 'Non-matching URL structure'}
                  </div>
                </div>

                <div className="attr-info-box">
                  <div className="attr-label">Grammar Evaluation</div>
                  <div className="attr-desc-text">{result.regexResult.details}</div>
                </div>

                <div className="attr-info-box">
                  <div className="attr-label">Tested Grammar Pattern</div>
                  <code className="attractive-code-box">
                    {'/^(https?):\\/\\/((([\\w-]+\\.)+[\\w-]{2,})|(\\d{1,3}\\.){3}\\d{1,3})(:\\d{1,5})?(\\/[^\\s]*)?(\\?[^\\s]*)?(#[^\\s]*)?$/i'}
                  </code>
                </div>
              </div>
            </div>

            {/* DFA Card */}
            <div className="card validation-card">
              <div className="card-header-flex">
                <div className="card-title-with-icon">
                  <span className="method-badge-icon">🤖</span>
                  <div>
                    <h3 className="card-subheading" style={{ margin: 0 }}>Finite Automaton (DFA) Analysis</h3>
                    <span className="card-subtitle-small">14-State Deterministic State Machine</span>
                  </div>
                </div>
                <span className={`method-pill-tag ${result.dfaResult.isAccepted ? 'tag-safe' : 'tag-danger'}`}>
                  {result.dfaResult.isAccepted ? '✔ ACCEPTED' : '✖ REJECTED'}
                </span>
              </div>

              <div className="validation-body-attractive">
                <div className="attr-info-box">
                  <div className="attr-label">Terminal Automaton State</div>
                  <div className="attr-state-pill">
                    <strong>{result.dfaResult.finalState}</strong> &mdash; {result.dfaResult.isAccepted ? 'Accepting Final State' : 'Dead / Trap State'}
                  </div>
                </div>

                <div className="attr-info-box">
                  <div className="attr-label">Transition Summary</div>
                  <div className="attr-desc-text">{result.dfaResult.details}</div>
                </div>

                {/* State Transition Sequence Flow */}
                <div className="attr-info-box">
                  <div className="flex-between-label">
                    <span className="attr-label">State Transition Sequence ({result.dfaResult.transitionHistory.length} Steps)</span>
                    <button
                      type="button"
                      className="toggle-trace-btn"
                      onClick={() => setShowFullTrace(!showFullTrace)}
                    >
                      {showFullTrace ? 'Collapse Trace' : 'View Full Step Trace'}
                    </button>
                  </div>

                  {showFullTrace ? (
                    <div className="transition-steps-expanded">
                      {result.dfaResult.transitionHistory.map((step, idx) => (
                        <div key={idx} className="trace-step-row">
                          <span className="trace-idx">{idx + 1}.</span> {step}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="compact-state-chips-flow">
                      <span className="flow-chip chip-start">q0 (Start)</span>
                      <span className="flow-arrow">➔</span>
                      {result.dfaResult.transitionHistory.length > 4 && (
                        <>
                          <span className="flow-chip">... ({result.dfaResult.transitionHistory.length - 2} transitions)</span>
                          <span className="flow-arrow">➔</span>
                        </>
                      )}
                      <span className={`flow-chip ${result.dfaResult.isAccepted ? 'chip-accept' : 'chip-dead'}`}>
                        {result.dfaResult.finalState} ({result.dfaResult.isAccepted ? 'Accept' : 'Dead'})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Suspicious Warning Card — uses suspiciousReasons (new) or suspiciousIndicators (legacy) */}
          {secStatus === 'SUSPICIOUS' && (
            <div className="card attractive-warnings-card">
              <div className="warning-card-header">
                <div className="warning-icon-large">⚠️</div>
                <div>
                  <h3 className="warning-main-title">
                    Suspicious Patterns Detected ({(result.suspiciousReasons || result.suspiciousIndicators || []).length})
                  </h3>
                  <p className="warning-sub-desc">
                    The URL passed structural validation (Regex + DFA) but exhibits patterns commonly used in phishing and social engineering.
                    <strong> A valid URL is NOT a guarantee of website safety.</strong>
                  </p>
                </div>
              </div>

              <div className="attractive-indicators-grid">
                {/* New API: suspiciousReasons is a string array */}
                {result.suspiciousReasons && result.suspiciousReasons.length > 0
                  ? result.suspiciousReasons.map((reason, i) => (
                    <div key={i} className="attractive-indicator-box">
                      <div className="ind-header">
                        <span className="ind-badge-icon">⚡</span>
                        <strong className="ind-name">Indicator {i + 1}</strong>
                      </div>
                      <p className="ind-desc">{reason}</p>
                    </div>
                  ))
                  /* Legacy API fallback: suspiciousIndicators is {type, reason}[] */
                  : (result.suspiciousIndicators || []).map((ind, i) => (
                    <div key={i} className="attractive-indicator-box">
                      <div className="ind-header">
                        <span className="ind-badge-icon">⚡</span>
                        <strong className="ind-name">{ind.type}</strong>
                      </div>
                      <p className="ind-desc">{ind.reason}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default URLScan
