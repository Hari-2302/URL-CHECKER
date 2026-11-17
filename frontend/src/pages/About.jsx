function About() {
  return (
    <div>
      <div className="page-header">
        <h1>About This Project</h1>
        <p>Comprehensive academic documentation of URL validation using Formal Languages and Automata Theory.</p>
      </div>

      <div className="card about-section">
        <h2>1. Project Objective</h2>
        <p>
          The primary goal of this project is to implement a structural URL safety and validity checker using
          <strong> JavaScript Regular Expressions (Regex)</strong> and a <strong>Deterministic Finite Automaton (DFA)</strong>.
          It demonstrates how core theoretical concepts from automata theory are applied to real-world Internet protocols.
        </p>
        <p>
          URLs entered by the user are evaluated and classified into:
        </p>
        <ul>
          <li><strong>Valid URL:</strong> Conforms strictly to standard URL syntax without suspicious properties.</li>
          <li><strong>Invalid URL:</strong> Violates standard URL structural grammar (e.g. malformed protocol, missing host).</li>
          <li><strong>Potentially Suspicious URL:</strong> Structurally valid or semi-valid, but displays anomalous patterns often seen in phishing or obfuscation.</li>
        </ul>
        <div className="alert alert-info">
          <strong>Academic Disclaimer:</strong> Structural validation verifies syntax compliance according to RFC 3986. It does not provide real-time threat intelligence or guarantee that the target website is safe from malware or malicious activities.
        </div>
      </div>

      <div className="card about-section">
        <h2>2. Regular Expression Implementation</h2>
        <p>
          Regular expressions define Type-3 regular grammars in the Chomsky hierarchy. In this project, the regex tests the complete URI grammar:
        </p>
        <div style={{background: 'var(--gray-100)', padding: '0.75rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.82rem', marginBottom: '1rem', wordBreak: 'break-all'}}>
          /^(https?):\/\/((([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]{'{2,}'})|(\d{'{1,3}'}\.){'{3}'}\d{'{1,3}'})(:\d{'{1,5}'})?(\/[^\s]*)?(\?[^\s]*)?(#[^\s]*)?$/i
        </div>
        <ul>
          <li><strong>Scheme / Protocol:</strong> <code>^(https?):\/\/</code> ensures either HTTP or HTTPS is used.</li>
          <li><strong>Domain Label &amp; TLD:</strong> <code>([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]{'{2,}'}</code> validates labels separated by periods and ending with a top-level domain of at least 2 characters.</li>
          <li><strong>IP Address Alternative:</strong> <code>(\d{'{1,3}'}\.){'{3}'}\d{'{1,3}'}</code> permits IPv4 dotted notation.</li>
          <li><strong>Optional Port:</strong> <code>(:\d{'{1,5}'})?</code> allows ports between 1 and 65535.</li>
          <li><strong>Path, Query &amp; Fragment:</strong> <code>(\/[^\s]*)?(\?[^\s]*)?(#[^\s]*)?</code> validates the URI hierarchy, parameters, and anchor tags.</li>
        </ul>
        <p style={{marginTop: '0.5rem', color: 'var(--gray-500)', fontSize: '0.88rem'}}>
          Course Mapping: <strong>22ITT53 – Formal Languages and Automata Theory</strong>
        </p>
      </div>

      <div className="card about-section">
        <h2>3. Finite Automata (DFA) Specification</h2>
        <p>
          A Deterministic Finite Automaton is formally modeled as a 5-tuple: <code>M = (Q, Σ, δ, q0, F)</code>:
        </p>
        <ul>
          <li><strong>Q (States):</strong> {'{q0, q1, q2, q3, q4, q4s, q5, q6, q7, q8, q9, q10, q11, qDEAD}'}</li>
          <li><strong>Σ (Alphabet):</strong> Character classes representing Letters, Digits, '.', ':', '/', '-', '_', '?', '#', '@', etc.</li>
          <li><strong>δ (Transition Function):</strong> Deterministic state mapping table <code>δ: Q × Σ → Q</code></li>
          <li><strong>q0:</strong> Start state where processing commences.</li>
          <li><strong>F (Accepting States):</strong> {'{q10, q11}'} — where q10 represents a valid domain/TLD and q11 represents valid path/query parameters.</li>
        </ul>
        <p style={{marginTop: '0.5rem'}}>
          Any unexpected character, invalid sequence (e.g. single slash after colon, adjacent periods, '@' in host) triggers an immediate transition to the non-accepting <strong>qDEAD</strong> trap state.
        </p>
        <p style={{marginTop: '0.5rem', color: 'var(--gray-500)', fontSize: '0.88rem'}}>
          Course Mapping: <strong>22ITT53 – Formal Languages and Automata Theory</strong>
        </p>
      </div>

      <div className="card about-section">
        <h2>4. Relationship with Computer Networks</h2>
        <p>
          URLs are standard URI identifiers defined in IETF RFC 3986 that form the backbone of the World Wide Web:
        </p>
        <ul>
          <li><strong>Application Layer Protocols:</strong> HTTP (TCP 80) and HTTPS (TCP 443 with TLS encryption).</li>
          <li><strong>DNS &amp; Host Identity:</strong> Legitimate web services utilize domain names resolved by the Domain Name System. Raw IP addresses in URLs frequently bypass host-based reputation filters.</li>
          <li><strong>Authority &amp; Credential Abuse:</strong> The '@' character separates user credentials from host addresses; misuse can obscure malicious destinations (e.g., <code>http://google.com@phishing.net</code>).</li>
          <li><strong>Transport Security:</strong> HTTP transmits headers and payloads in plaintext, leaving users susceptible to eavesdropping and man-in-the-middle attacks.</li>
        </ul>
        <p style={{marginTop: '0.5rem', color: 'var(--gray-500)', fontSize: '0.88rem'}}>
          Course Mapping: <strong>22ITT52 – Computer Networks</strong>
        </p>
      </div>

      <div className="card about-section">
        <h2>5. Technology Stack</h2>
        <div className="tech-grid">
          <span className="tech-badge">React.js (Frontend)</span>
          <span className="tech-badge">Node.js (Backend Runtime)</span>
          <span className="tech-badge">Express.js (REST API Server)</span>
          <span className="tech-badge">MongoDB (NoSQL Database)</span>
          <span className="tech-badge">Mongoose (ODM Framework)</span>
          <span className="tech-badge">JavaScript (ES6+)</span>
          <span className="tech-badge">HTML5 &amp; CSS3</span>
          <span className="tech-badge">Regular Expressions (Grammar Validation)</span>
          <span className="tech-badge">Deterministic Finite Automata (DFA)</span>
          <span className="tech-badge">React Router v6</span>
        </div>
      </div>

      <div className="card about-section">
        <h2>6. Academic Syllabus Mapping</h2>
        <ul>
          <li><strong>22ITT51 – Full Stack Web Development:</strong> RESTful API design in Express, asynchronous database operations with Mongoose, responsive component-based UI in React, SPA client-side routing.</li>
          <li><strong>22ITT52 – Computer Networks:</strong> URL and URI specification, HTTP/HTTPS transport security, DNS nomenclature, and port addressing.</li>
          <li><strong>22ITT53 – Formal Languages and Automata Theory:</strong> Regular languages, deterministic finite automata, transition functions, state transition diagrams, and accepting criteria.</li>
        </ul>
      </div>
    </div>
  )
}

export default About
