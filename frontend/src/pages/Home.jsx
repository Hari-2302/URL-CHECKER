import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Home() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')

  function handleAnalyze() {
    if (url.trim()) {
      navigate('/checker', { state: { url: url.trim() } })
    } else {
      navigate('/checker')
    }
  }

  return (
    <div>
      <div className="hero">
        <h1>URL Safety Checker</h1>
        <p>Validate URL structure using <strong>Regular Expressions</strong> and <strong>Deterministic Finite Automata (DFA)</strong>. An academic project demonstrating Formal Languages and Automata Theory concepts.</p>

        <div className="card" style={{maxWidth: '650px', margin: '0 auto 2rem'}}>
          <div className="url-input-group">
            <input
              className="url-input"
              type="text"
              placeholder="Enter URL to analyze (e.g. https://www.example.com)"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            />
            <button className="btn btn-primary" onClick={handleAnalyze}>Analyze URL</button>
          </div>
        </div>

        <div className="hero-features">
          <div className="feature-card">
            <div className="icon">🔍</div>
            <h3>Regex Validation</h3>
            <p>Pattern matching using JavaScript regular expressions to validate URL structure.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🤖</div>
            <h3>DFA Processing</h3>
            <p>Deterministic Finite Automaton traces each character through defined states.</p>
          </div>
          <div className="feature-card">
            <div className="icon">⚠️</div>
            <h3>Suspicious Checks</h3>
            <p>Detects IP addresses, missing HTTPS, URL shorteners and suspicious patterns.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📋</div>
            <h3>History Log</h3>
            <p>All analyzed URLs are stored in MongoDB for review and reference.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{color: 'var(--primary)', marginBottom: '0.75rem'}}>About This Project</h2>
        <p>This project is built as part of the academic curriculum for:</p>
        <ul style={{paddingLeft: '1.5rem', marginTop: '0.5rem'}}>
          <li><strong>22ITT51</strong> – Full Stack Web Development (React.js, Node.js, Express.js, MongoDB)</li>
          <li><strong>22ITT52</strong> – Computer Networks (URL structure, HTTP/HTTPS protocols)</li>
          <li><strong>22ITT53</strong> – Formal Languages and Automata Theory (Regex, DFA)</li>
        </ul>
        <p style={{marginTop: '0.75rem', color: 'var(--gray-500)', fontSize: '0.9rem'}}>
          <strong>Note:</strong> This tool checks the structural validity of a URL using pattern matching and finite automaton. It does not guarantee website safety or perform live threat analysis.
        </p>
      </div>
    </div>
  )
}

export default Home
