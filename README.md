# URL GUARD — URL Safety Checker

**Academic Project | Full Stack Web Development + Computer Networks + Formal Languages and Automata Theory**

A web application that validates URLs using Regular Expressions and Deterministic Finite Automata (DFA), and detects predefined suspicious patterns to help employees identify potentially malicious links before accessing them.

---

## Problem Statement

An organization wants employees to identify potentially suspicious website links before accessing them. This application uses network concepts and regular expressions / finite automata to validate URLs and identify predefined suspicious patterns.

---

## Architecture

```
url-checker/
├── backend/                    # Node.js + Express API server
│   ├── server.js               # Entry point, MongoDB connection
│   ├── .env                    # Environment variables (MongoDB URI)
│   ├── controllers/
│   │   ├── urlController.js    # URL analysis, history, stats, delete
│   │   └── authController.js  # Register, login, seed demo user
│   ├── models/
│   │   ├── URLHistory.js       # Mongoose schema for scan records
│   │   └── User.js             # Mongoose schema for users
│   ├── routes/
│   │   ├── urlRoutes.js        # /api/analyze, /api/history, /api/stats
│   │   └── authRoutes.js      # /api/auth/register, /api/auth/login
│   └── utils/
│       ├── regexValidator.js   # Regular Expression URL validation
│       └── dfaValidator.js     # 14-state DFA URL validation
│
└── frontend/                   # React + Vite SPA
    └── src/
        ├── App.jsx             # Router, layout, auth state
        ├── components/
        │   ├── Sidebar.jsx     # Left navigation sidebar
        │   └── Header.jsx      # Top header with profile dropdown
        └── pages/
            ├── Dashboard.jsx   # Stats, charts, top domains
            ├── URLScan.jsx     # URL input, scan results (3 panels)
            ├── ScanHistory.jsx # Past scans table with delete
            ├── DFAVisualization.jsx  # DFA diagram, trace, table
            ├── Profile.jsx     # User profile page
            ├── FAQ.jsx         # Expandable FAQ (12 questions)
            └── Auth.jsx        # Sign in / Register page
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, HTML, CSS (plain), JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Validation | JavaScript Regular Expressions + Manual 14-state DFA |
| Build Tool | Vite |

---

## Installation & Configuration

### Prerequisites
- Node.js (v18+)
- npm
- MongoDB Atlas account (or local MongoDB)

### 1. Clone / Open the project
```
cd c:\Users\Anandhan S\Desktop\url-checker
```

### 2. Configure environment variables
Edit `backend/.env`:
```
MONGODB_URI=mongodb+srv://hariharanelango529_db_user:9gGyciy19WozPNol@cluster0.p39lwt2.mongodb.net/urlsafetychecker?retryWrites=true&w=majority
PORT=5000
```

### 3. Install backend dependencies
```bash
cd backend
npm install
```

### 4. Install frontend dependencies
```bash
cd ../frontend
npm install
```

---

## Running the Application

### Start the backend server
```bash
cd backend
node server.js
```
Backend runs at: **http://localhost:5000**

### Start the frontend development server
```bash
cd frontend
npm run dev
```
Frontend runs at: **http://localhost:5173**

### Build frontend for production
```bash
cd frontend
npm run build
```

---

## Default Login Credentials

| Email | Password | Role |
|---|---|---|
| analyst@urlguard.io | password123 | Threat Intelligence Analyst |

You can register new accounts from the Sign In page.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/analyze | Analyze a URL (Regex + DFA + Suspicious checks) |
| GET | /api/history | Get all past scan records |
| DELETE | /api/history/:id | Delete a scan record |
| GET | /api/stats | Get dashboard statistics |
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login with email and password |

---

## Validation Logic

### Regular Expression Validation
Pattern: `/^(https?):\/\/(([\w-]+\.)+[\w-]{2,}|(\d{1,3}\.){3}\d{1,3})(:\d{1,5})?(\/[^\s]*)?(\?[^\s]*)?(#[^\s]*)?$/i`

Checks: protocol, domain/IP, optional port, optional path, optional query, optional fragment.

### DFA Validation (14 States)

| State | Description |
|---|---|
| q0 | Start state |
| q1 | Read 'h' |
| q2 | Read 'ht' |
| q3 | Read 'htt' |
| q4 | Read 'http' |
| q4s | Read 'https' |
| q5 | Read protocol colon ':' |
| q6 | Read first slash '/' |
| q7 | Protocol separator '//' complete |
| q8 | Reading domain characters |
| q9 | Read dot '.' in domain |
| q10 | Reading TLD — **Accepting State** |
| q11 | Reading path/query/fragment — **Accepting State** |
| qDEAD | Dead/trap state — URL rejected |

### Suspicious Pattern Detection

| Pattern | Example |
|---|---|
| IP address domain | http://192.168.1.1/admin |
| @ credential injection | https://google.com@evil.com |
| URL shortener | http://bit.ly/secure-login |
| Unencrypted HTTP | http://example.com |
| Excessive subdomains | https://a.b.c.d.e.example.com |
| Suspicious keywords | https://example.com/verify-password |
| External redirect param | https://example.com?redirect=http://evil.com |
| Misleading domain | https://paypa1.com |

---

## Three Separate Results

Every URL scan produces three independent results:

1. **Regex Validation** — Valid / Invalid (structural check)
2. **DFA Validation** — Accepted / Rejected (automaton check)
3. **Security Analysis** — Safe Pattern / Suspicious Pattern / Invalid URL

> ⚠️ A structurally valid URL (Regex ✔ + DFA ✔) is NOT necessarily a safe website.

---

## Sample Test Cases

### Valid URLs
```
https://google.com          → Regex: Valid | DFA: Accepted | Security: Safe
https://github.com          → Regex: Valid | DFA: Accepted | Security: Safe
https://example.com/login   → Regex: Valid | DFA: Accepted | Security: Safe
```

### Suspicious URLs (structurally valid, pattern flagged)
```
https://example.com@evil.com
  → Regex: Valid | DFA: Accepted (before @) or Rejected | Security: Suspicious (@ injection)

http://192.168.1.1/admin
  → Regex: Valid | DFA: Rejected (digits in domain) | Security: Suspicious (IP domain)

https://example.com/verify-account?redirect=http://evil.com
  → Regex: Valid | DFA: Accepted | Security: Suspicious (redirect param + keyword)

https://example.com/login?next=https://evil.com
  → Regex: Valid | DFA: Accepted | Security: Suspicious (open redirect)
```

### Invalid URLs
```
htt://example.com   → Regex: Invalid | DFA: Rejected | Security: Invalid
https://            → Regex: Invalid | DFA: Rejected | Security: Invalid
example             → Regex: Invalid | DFA: Rejected | Security: Invalid
```
