import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const API_BASE = 'http://localhost:5000/api'

function ResultBadge({ state }) {
  const cls = state === 'valid' ? 'badge-valid' : state === 'suspicious' ? 'badge-suspicious' : 'badge-invalid'
  const label = state === 'valid' ? 'Valid URL' : state === 'suspicious' ? 'Potentially Suspicious URL' : 'Invalid URL'
  return <span className={'badge ' + cls}>{label}</span>
}

function Checker() {
  const location = useLocation()
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (location.state && location.state.url) {
      setUrl(location.state.url)
    }
  }, [location.state])

  async function handleAnalyze() {
    if (!url.trim()) {
      setError('Please enter a URL to analyze.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(API_BASE + '/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Analysis failed.')
      } else {
        setResult(data)
      }
    } catch {
      setError('Could not connect to the backend API. Make sure the server is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  function getRiskColor(level) {
    if (level === 'safe') return 'var(--valid)'
    if (level === 'high') return 'var(--invalid)'
    return 'var(--suspicious)'
  }

  return (
    <div>
      <div className="page-header">
        <h1>URL Checker</h1>
        <p>Enter a URL to validate its structure using Regular Expressions and Deterministic Finite Automata.</p>
      </div>

      <div className="card">
        <div className="url-input-group">
          <input
            className={'url-input' + (error ? ' error-border' : '')}
            type="text"
            placeholder="https://www.example.com"
            value={url}
            onChange={e => { setUrl(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
          />
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze URL'}
          </button>
        </div>
        {error && <p className="error-msg">{error}</p>}
      </div>

      {result && (
        <div>
          <div className="card">
            <div className="result-label">Entered URL</div>
            <div style={{fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '1rem', fontSize: '0.95rem'}}>{result.originalUrl}</div>
            <div className="result-label">Final Result</div>
            <div style={{marginBottom: '1rem'}}><ResultBadge state={result.finalState} /></div>
            <div className="result-label">Risk Level</div>
            <div><span style={{fontWeight: 700, color: getRiskColor(result.riskLevel)}}>{result.riskLevel.toUpperCase()}</span></div>
          </div>

          <div className="card">
            <h3 style={{marginBottom: '1rem', color: 'var(--primary)'}}>Regular Expression Validation Result</h3>
            <div className={'result-section ' + (result.regexResult.isValid ? 'valid' : 'invalid')}>
              <div className="result-label">Regex Decision</div>
              <div className="result-value">{result.regexResult.isValid ? 'Pattern Matched' : 'Pattern Not Matched'}</div>
            </div>
            {result.regexResult.matchedPattern && (
              <div className="result-section">
                <div className="result-label">Matched Classification</div>
                <div className="result-value">{result.regexResult.matchedPattern}</div>
              </div>
            )}
            <div className="result-section">
              <div className="result-label">Details</div>
              <div className="result-value">{result.regexResult.details}</div>
            </div>
            <div className="result-section">
              <div className="result-label">Regular Expression Pattern</div>
              <div style={{fontFamily: 'monospace', fontSize: '0.78rem', background: 'var(--gray-100)', padding: '0.5rem', borderRadius: '4px', wordBreak: 'break-all'}}>
                {result.regexResult.testedPattern || '/^(https?):\\/\\/((([\\w-]+\\.)+[\\w-]{2,})|(\\d{1,3}\\.){3}\\d{1,3})(:\\d{1,5})?(\\/[^\\s]*)?(\\?[^\\s]*)?(#[^\\s]*)?$/i'}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{marginBottom: '1rem', color: 'var(--primary)'}}>DFA Validation Result</h3>
            <div className={'result-section ' + (result.dfaResult.isAccepted ? 'valid' : 'invalid')}>
              <div className="result-label">DFA Decision</div>
              <div className="result-value">{result.dfaResult.isAccepted ? 'Accepted by DFA' : 'Rejected by DFA'}</div>
            </div>
            <div className="result-section">
              <div className="result-label">Final DFA State</div>
              <div className="result-value" style={{fontFamily: 'monospace', fontWeight: 600}}>{result.dfaResult.finalState}</div>
            </div>
            <div className="result-section">
              <div className="result-label">DFA Explanation</div>
              <div className="result-value">{result.dfaResult.details}</div>
            </div>
            <div className="result-section">
              <div className="result-label">State Transition Sequence ({result.dfaResult.transitionHistory.length} steps)</div>
              <ul className="transition-list">
                {result.dfaResult.transitionHistory.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          </div>

          {result.suspiciousIndicators && result.suspiciousIndicators.length > 0 && (
            <div className="card">
              <h3 style={{marginBottom: '1rem', color: 'var(--suspicious)'}}>Suspicious Pattern Warnings</h3>
              <ul className="indicator-list">
                {result.suspiciousIndicators.map((ind, i) => (
                  <li key={i}>
                    <span className="indicator-icon">⚠️</span>
                    <span className="indicator-text">
                      <strong>{ind.type}</strong>
                      <span>{ind.reason}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Checker
