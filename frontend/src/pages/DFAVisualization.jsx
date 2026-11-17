import { useState } from 'react'

const STATES = {
  q0: 'Start State',
  q1: 'Read "h"',
  q2: 'Read "ht"',
  q3: 'Read "htt"',
  q4: 'Read "http"',
  q4s: 'Read "https"',
  q5: 'Protocol Colon ":"',
  q6: 'First Slash "/"',
  q7: 'Protocol Terminated "//"',
  q8: 'Domain Characters',
  q9: 'Domain Dot "."',
  q10: 'TLD Extension (Accepting)',
  q11: 'Path / Query / Fragment (Accepting)',
  qDEAD: 'Dead State (Trap / Reject)'
}

const ACCEPTING = new Set(['q10', 'q11'])
const START = 'q0'

function classifyChar(ch) {
  if (/[a-zA-Z]/.test(ch)) return 'LETTER'
  if (/[0-9]/.test(ch)) return 'DIGIT'
  const map = {
    '.': 'DOT', ':': 'COLON', '/': 'SLASH', '-': 'HYPHEN',
    '_': 'UNDERSCORE', '?': 'QUESTION', '#': 'HASH', '@': 'AT',
    '=': 'EQUAL', '&': 'AMP', '%': 'PERCENT', '+': 'PLUS'
  }
  return map[ch] || 'OTHER'
}

function dfaTransition(state, ch) {
  const t = classifyChar(ch)
  switch (state) {
    case 'q0': return (ch === 'h' || ch === 'H') ? 'q1' : 'qDEAD'
    case 'q1': return (ch === 't' || ch === 'T') ? 'q2' : 'qDEAD'
    case 'q2': return (ch === 't' || ch === 'T') ? 'q3' : 'qDEAD'
    case 'q3': return (ch === 'p' || ch === 'P') ? 'q4' : 'qDEAD'
    case 'q4':
      if (ch === ':') return 'q5'
      if (ch === 's' || ch === 'S') return 'q4s'
      return 'qDEAD'
    case 'q4s': return ch === ':' ? 'q5' : 'qDEAD'
    case 'q5': return ch === '/' ? 'q6' : 'qDEAD'
    case 'q6': return ch === '/' ? 'q7' : 'qDEAD'
    case 'q7': return (t === 'LETTER' || t === 'DIGIT') ? 'q8' : 'qDEAD'
    case 'q8':
      if (t === 'LETTER' || t === 'DIGIT' || t === 'HYPHEN' || t === 'UNDERSCORE') return 'q8'
      if (t === 'DOT') return 'q9'
      if (t === 'AT') return 'q8'
      return 'qDEAD'
    case 'q9': return (t === 'LETTER' || t === 'DIGIT') ? 'q10' : 'qDEAD'
    case 'q10':
      if (t === 'LETTER' || t === 'DIGIT' || t === 'HYPHEN') return 'q10'
      if (t === 'DOT') return 'q9'
      if (t === 'SLASH' || t === 'COLON' || t === 'QUESTION' || t === 'HASH') return 'q11'
      if (t === 'AT') return 'q8'
      return 'qDEAD'
    case 'q11':
      if (t === 'OTHER') return 'qDEAD'
      return 'q11'
    case 'qDEAD': return 'qDEAD'
    default: return 'qDEAD'
  }
}

function runDFA(url) {
  let state = START
  const trace = [{ state, ch: null, charType: null, stepName: 'Start state', isDead: false }]
  let deadChar = null
  let deadPos = -1

  for (let i = 0; i < url.length; i++) {
    const ch = url[i]
    const next = dfaTransition(state, ch)
    state = next
    const isDead = state === 'qDEAD'
    trace.push({
      state,
      ch,
      charType: classifyChar(ch),
      stepName: `Read '${ch}' [${classifyChar(ch)}]`,
      isDead
    })
    if (isDead) {
      deadChar = ch
      deadPos = i
      trace.push({
        state: 'qDEAD',
        ch: null,
        charType: null,
        stepName: `↳ Dead state reached at position ${i}. Remaining input ignored.`,
        isDead: true,
        isInfo: true
      })
      break
    }
  }

  // Detect suspicious trigger characters
  const suspiciousTrigger =
    deadChar === '@' ? '@ symbol detected — classic phishing pattern (credentials injection)' :
    /^\d+\.\d+\.\d+\.\d+$/.test(url.replace(/^https?:\/\//, '').split('/')[0]) ? 'Raw IP address used instead of domain name' :
    null

  return {
    trace,
    finalState: state,
    accepted: ACCEPTING.has(state),
    deadChar,
    deadPos,
    suspiciousTrigger
  }
}

const TABLE_SYMBOLS = ['LETTER', 'DIGIT', 'DOT', 'COLON', 'SLASH', 'HYPHEN', 'AT', 'QUESTION', 'HASH', 'OTHER']
const TABLE_STATES = ['q0', 'q1', 'q2', 'q3', 'q4', 'q4s', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'qDEAD']
const CHAR_SAMPLES = { LETTER: 'a', DIGIT: '1', DOT: '.', COLON: ':', SLASH: '/', HYPHEN: '-', AT: '@', QUESTION: '?', HASH: '#', OTHER: ' ' }

function DFAVisualization() {
  const [testUrl, setTestUrl] = useState('')
  const [traceResult, setTraceResult] = useState(null)
  const [traceError, setTraceError] = useState('')

  function handleTrace(e) {
    if (e) e.preventDefault()
    if (!testUrl.trim()) {
      setTraceError('Please enter a URL to trace.')
      return
    }
    setTraceError('')
    setTraceResult(runDFA(testUrl.trim()))
  }

  function getStateClass(s) {
    if (traceResult && traceResult.finalState === s) return 'state-node state-active'
    if (s === 'qDEAD') return 'state-node state-dead'
    if (ACCEPTING.has(s)) return 'state-node state-accept'
    if (s === START) return 'state-node state-start'
    return 'state-node state-normal'
  }

  return (
    <div className="page-container">
      <div className="page-title-row">
        <div>
          <h1 className="page-heading">DFA Visualization</h1>
          <p className="page-subtitle">Mathematical specification and interactive execution trace of the 14-state Deterministic Finite Automaton.</p>
        </div>
      </div>

      {/* State Legend and State Catalog */}
      <div className="card">
        <h3 className="card-subheading">1. State Classification Set Q</h3>
        <div className="state-legend-row">
          <span className="state-node state-start">q0 Start State</span>
          <span className="state-node state-normal">Intermediate State</span>
          <span className="state-node state-accept">q10, q11 Accepting States</span>
          <span className="state-node state-dead">qDEAD Trap / Dead State</span>
          <span className="state-node state-active">Active Terminal State</span>
        </div>

        <div className="states-badge-catalog">
          {TABLE_STATES.map(s => (
            <div key={s} className={getStateClass(s)} title={STATES[s]}>
              <div className="s-id">{s}</div>
              <div className="s-name">{STATES[s]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive URL Trace Tester */}
      <div className="card">
        <h3 className="card-subheading">2. Interactive URL State Trace</h3>
        <p className="profile-text" style={{ marginBottom: '1rem' }}>
          Input any URL string below to observe how the DFA transitions across character classes in O(n) linear execution time.
        </p>

        <form onSubmit={handleTrace} className="scan-form" style={{ marginBottom: '1rem' }}>
          <div className="input-with-icon">
            <span className="search-icon">🤖</span>
            <input
              type="text"
              className="clean-input"
              placeholder="e.g. https://www.google.com/search or http://example.com"
              value={testUrl}
              onChange={e => { setTestUrl(e.target.value); setTraceError('') }}
            />
          </div>
          <button type="submit" className="btn-primary-scan">
            Trace DFA
          </button>
        </form>
        {traceError && <div className="error-alert">{traceError}</div>}

        {traceResult && (
          <div className="trace-outcome-container">
            {/* Main result banner */}
            <div className="trace-result-banner">
              <strong>Automaton Decision: </strong>
              {traceResult.accepted ? (
                <span className="valid-text">✔ Accepted — Terminated in Accepting State {traceResult.finalState} ({STATES[traceResult.finalState]})</span>
              ) : (
                <span className="invalid-text">✖ Rejected — Terminated in Non-Accepting State {traceResult.finalState} ({STATES[traceResult.finalState]})</span>
              )}
            </div>

            {/* Suspicious pattern alert when @ or IP triggered dead state */}
            {traceResult.suspiciousTrigger && (
              <div style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.4)',
                borderRadius: '8px',
                padding: '0.65rem 1rem',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.85rem',
                color: '#b45309',
                fontWeight: 600
              }}>
                ⚠️ Suspicious Pattern Detected: {traceResult.suspiciousTrigger}
              </div>
            )}

            {/* Step-by-step log */}
            <div className="trace-steps-wrapper">
              <div className="info-key" style={{ marginBottom: '0.5rem' }}>
                Step-by-Step Transition Log ({traceResult.trace.length} steps):
              </div>
              <div className="transition-scroll-box">
                {traceResult.trace.map((step, idx) => (
                  <div
                    key={idx}
                    className={`transition-step-item ${
                      step.isInfo ? 'step-info' :
                      ACCEPTING.has(step.state) ? 'step-accept' :
                      step.state === 'qDEAD' ? 'step-dead' : ''
                    }`}
                  >
                    <span className="step-num">{idx}.</span>
                    {idx === 0
                      ? `Start State: ${step.state} (${STATES[step.state]})`
                      : step.isInfo
                        ? step.stepName
                        : `${step.stepName} → ${step.state} (${STATES[step.state]})`
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* State Transition Diagram (SVG) */}
      <div className="card">
        <h3 className="card-subheading">3. State Transition Diagram (Vector SVG)</h3>
        <p className="profile-text" style={{ marginBottom: '1rem' }}>
          Graph representation of states and directed transition arcs matching the backend validator logic.
        </p>
        <div className="svg-diagram-card">
          <img
            src="/state-transition-diagram.svg"
            alt="DFA State Transition Diagram"
            className="diagram-svg-img"
          />
        </div>
      </div>

      {/* State Transition Table */}
      <div className="card">
        <h3 className="card-subheading">4. State Transition Table &delta;(q, a)</h3>
        <p className="profile-text" style={{ marginBottom: '1rem' }}>
          Deterministic mapping matrix where rows represent current states and columns represent input character classes.
        </p>
        <div className="table-responsive">
          <table className="transition-table">
            <thead>
              <tr>
                <th>Current State</th>
                {TABLE_SYMBOLS.map(sym => (
                  <th key={sym}>{sym}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_STATES.map(state => (
                <tr key={state}>
                  <td className={`state-col-cell ${ACCEPTING.has(state) ? 'cell-accept' : state === 'qDEAD' ? 'cell-dead' : state === START ? 'cell-start' : ''}`}>
                    <strong>{state}</strong> {ACCEPTING.has(state) ? '(Accept)' : state === 'qDEAD' ? '(Dead)' : state === START ? '(Start)' : ''}
                  </td>
                  {TABLE_SYMBOLS.map(sym => {
                    const next = dfaTransition(state, CHAR_SAMPLES[sym])
                    return (
                      <td
                        key={sym}
                        className={next === 'qDEAD' ? 'cell-dead-val' : ACCEPTING.has(next) ? 'cell-accept-val' : ''}
                      >
                        {next}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DFAVisualization
