import { useState } from 'react'

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'What is URL Safety Checker?',
    answer: 'URL Safety Checker (URL GUARD) is a web application that helps employees identify potentially suspicious website links before accessing them. It evaluates the structural validity of URLs using Regular Expressions and Deterministic Finite Automata (DFA), and separately checks for predefined suspicious patterns. URLs are classified as Safe Pattern, Suspicious Pattern, or Invalid URL.'
  },
  {
    id: 2,
    question: 'What is a URL?',
    answer: 'A Uniform Resource Locator (URL) is an RFC 3986 standardized address used to identify and locate resources on the Internet. A standard URL contains: protocol (http/https), domain name or IP address, optional port number, optional path, optional query string (?key=value), and an optional fragment (#section). Example: https://www.example.com:443/path?query=value#section'
  },
  {
    id: 3,
    question: 'What is Regular Expression (Regex)?',
    answer: 'A Regular Expression is an algebraic pattern used to match, search, or validate strings. In formal language theory, regular expressions generate Type-3 regular languages in the Chomsky hierarchy. In URL GUARD, the regex pattern validates the full URL structure — checking that the protocol, domain, optional port, path, query string, and fragment all follow the correct format. Regex validation is fast (O(n)) and checks structure only.'
  },
  {
    id: 4,
    question: 'What is Finite Automata?',
    answer: 'A Finite Automaton (FA) is an abstract mathematical machine with a finite set of states, an input alphabet, and transition functions that define how the machine moves between states as it reads input symbols. Finite automata are used in compilers, network protocols, and pattern recognition. URL GUARD implements a Deterministic Finite Automaton (DFA) that processes each character of a URL one at a time.'
  },
  {
    id: 5,
    question: 'What is a DFA and how does URL GUARD use it?',
    answer: 'A Deterministic Finite Automaton (DFA) is a finite automaton where each (state, input symbol) pair maps to exactly one next state — no ambiguity or ε-transitions allowed. URL GUARD uses a 14-state DFA (q0 to q11 + qDEAD) that reads each character of the URL and transitions between states. If the DFA ends in an accepting state (q10 or q11), the URL structure is accepted. If it enters qDEAD (the dead/trap state), the URL is rejected. This is O(n) linear-time processing.'
  },
  {
    id: 6,
    question: 'What are the three separate validation results?',
    answer: '1. Regex Validation — checks whether the full URL string matches the standard URL regular expression pattern. Result: Valid or Invalid.\n\n2. DFA Validation — processes the URL character-by-character through a 14-state automaton. Result: Accepted or Rejected (shows the full state transition sequence).\n\n3. Security Analysis — independently checks for predefined suspicious patterns regardless of structural validity. Result: Safe Pattern / Suspicious Pattern / Invalid URL.'
  },
  {
    id: 7,
    question: 'What suspicious patterns does URL GUARD detect?',
    answer: 'URL GUARD checks for these predefined suspicious patterns:\n• IP address used instead of domain name (e.g. http://192.168.1.1)\n• @ symbol used to disguise the real destination (e.g. http://trusted.com@evil.com)\n• URL shortener domains (bit.ly, tinyurl.com, etc.) that hide the true link\n• Unencrypted HTTP protocol instead of HTTPS\n• Excessive subdomains (e.g. login.secure.verify.bank.example.com)\n• Suspicious keywords in path/query (verify, password, banking, update, etc.)\n• External redirect parameters (redirect=, next=, url=, return=, continue=)\n• Misleading domain patterns that mimic trusted brands'
  },
  {
    id: 8,
    question: 'What does a Suspicious Pattern URL mean?',
    answer: 'A URL classified as "Suspicious Pattern" passed the structural validation (Regex ✔ and DFA ✔) but was flagged by the security analysis because it contains known deceptive patterns. Example: https://example.com/verify-account?redirect=http://evil.com — this is structurally valid but contains an external redirect parameter pointing to an external domain, which is a classic open-redirect phishing technique.'
  },
  {
    id: 9,
    question: 'Does a valid URL guarantee website safety?',
    answer: 'No. Structural validation only verifies that the URL conforms to grammar standards (RFC 3986). It does NOT guarantee the destination is safe. A perfectly valid, well-formed URL can still point to a phishing portal, malware download, or compromised server. URL GUARD clearly separates structural validation (Regex + DFA) from security pattern analysis, and explicitly states this distinction on every result.'
  },
  {
    id: 10,
    question: 'How does the @ symbol make a URL dangerous?',
    answer: 'In URL syntax, everything before the @ symbol is treated as credentials (username:password). So http://trusted.com@evil.com tells the browser to authenticate with "trusted.com" credentials and navigate to "evil.com". Visually the URL looks like it goes to trusted.com, but it actually opens evil.com. URL GUARD detects and flags this pattern.'
  },
  {
    id: 11,
    question: 'What is an open redirect attack?',
    answer: 'An open redirect occurs when a website accepts a user-controlled URL in a query parameter and redirects the browser there without validation. Example: https://trusted.com/go?redirect=http://evil.com — the user trusts the link because it starts with trusted.com, but after clicking, they are sent to evil.com. URL GUARD detects redirect, next, url, return, continue, goto, and destination parameters that contain external URLs.'
  },
  {
    id: 12,
    question: 'What network concepts does URL validation use?',
    answer: 'URL GUARD applies several computer networking concepts: Protocol identification (HTTP/HTTPS — application layer), Domain name structure (hostname resolution — DNS layer), IP address validation (network layer addressing), Port numbers (transport layer — TCP/UDP ports 1-65535), Path and query structure (HTTP request line composition), URL encoding, and URI specification (RFC 3986).'
  }
]

function FAQ() {
  const [openId, setOpenId] = useState(1)

  function toggleAccordion(id) {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div className="page-container">
      <div className="page-title-row">
        <div>
          <h1 className="page-heading">Frequently Asked Questions</h1>
          <p className="page-subtitle">
            Learn how URL validation, Regular Expressions, Finite Automata, and suspicious pattern detection work in URL GUARD.
          </p>
        </div>
      </div>

      <div className="faq-container">
        {FAQ_ITEMS.map(item => {
          const isOpen = openId === item.id
          return (
            <div key={item.id} className={`card faq-item-card ${isOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggleAccordion(item.id)}
                aria-expanded={isOpen}
              >
                <div className="faq-q-text">
                  <span className="faq-num">{item.id}</span>
                  <span className="faq-title">{item.question}</span>
                </div>
                <span className={`faq-chevron ${isOpen ? 'rotate' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>
              {isOpen && (
                <div className="faq-answer-body">
                  {item.answer.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('•') ? 'faq-bullet' : 'faq-para'}>
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FAQ
