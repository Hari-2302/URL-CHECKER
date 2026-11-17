# Sample Test Cases

## URL Safety Checker — Formal Languages and Automata Theory (22ITT53)

---

## Overview

The following 8 test cases cover the full range of URL validity scenarios tested by both the **Regex Validator** and the **DFA Validator** in the URL Safety Checker project. Each case is designed to exercise a specific rule or edge condition.

---

## Test Case Table

| # | Input URL | Regex Valid | DFA Accepted | Final State | Risk Level | Notes |
|---|-----------|-------------|--------------|-------------|------------|-------|
| 1 | `https://www.google.com` | ✅ Yes | ✅ Yes (q10) | valid | safe | Standard HTTPS URL with subdomain and TLD |
| 2 | `http://example.com/path?q=1#frag` | ✅ Yes | ✅ Yes (q11) | valid | safe | Full URL with path, query string, and fragment |
| 3 | `ftp://files.server.org` | ❌ No | ❌ No (qDEAD) | invalid | high | Unsupported protocol — must be `http` or `https` |
| 4 | `https://` | ❌ No | ❌ No (qDEAD) | invalid | high | Protocol present but no host — incomplete URL |
| 5 | `http://192.168.1.1/admin` | ✅ Yes | ✅ Yes (q11) | suspicious | medium | IP-based URL is structurally valid but flagged as potentially suspicious |
| 6 | `not-a-url` | ❌ No | ❌ No (qDEAD) | invalid | high | No protocol, no domain, entirely malformed |
| 7 | `https://sub.domain.example.co.uk/page` | ✅ Yes | ✅ Yes (q11) | valid | safe | Multi-level subdomain with country-code TLD |
| 8 | `http://malicious site.com` | ❌ No | ❌ No (qDEAD) | invalid | high | Contains a space — not a valid URL character in hostname |

---

## Detailed Case Descriptions

### Case 1 — Standard HTTPS URL

| Field | Value |
|-------|-------|
| **Input** | `https://www.google.com` |
| **Regex** | ✅ Matches — protocol `https`, domain `www.google.com`, TLD `com` |
| **DFA path** | q0 → q1(h) → q2(t) → q3(t) → q4(p) → q4s(s) → q5(:) → q6(/) → q7(/) → q8(w,w,w) → q9(.) → q8(g,o,o,g,l,e) → q9(.) → q10(c,o,m) |
| **DFA final state** | q10 (Accepting) |
| **Risk level** | Safe |
| **Result** | ✅ Valid |

---

### Case 2 — Full URL with Path, Query, and Fragment

| Field | Value |
|-------|-------|
| **Input** | `http://example.com/path?q=1#frag` |
| **Regex** | ✅ Matches — protocol `http`, domain `example.com`, path `/path`, query `?q=1`, fragment `#frag` |
| **DFA path** | q0…q10(com) → q11(/) → q11(path, ?, q, =, 1, #, frag) |
| **DFA final state** | q11 (Accepting) |
| **Risk level** | Safe |
| **Result** | ✅ Valid |

---

### Case 3 — Unsupported Protocol (FTP)

| Field | Value |
|-------|-------|
| **Input** | `ftp://files.server.org` |
| **Regex** | ❌ No match — pattern requires `http` or `https` |
| **DFA path** | q0 → qDEAD (first character `f` ≠ `h`) |
| **DFA final state** | qDEAD (Reject) |
| **Risk level** | High |
| **Result** | ❌ Invalid — unsupported protocol |

---

### Case 4 — Protocol Without Host

| Field | Value |
|-------|-------|
| **Input** | `https://` |
| **Regex** | ❌ No match — host/domain group is required after `://` |
| **DFA path** | q0 → q1 → q2 → q3 → q4 → q4s → q5 → q6 → q7 → input exhausted in q7 (non-accepting) |
| **DFA final state** | q7 (Non-accepting) |
| **Risk level** | High |
| **Result** | ❌ Invalid — no domain present |

---

### Case 5 — IP-Based URL (Suspicious)

| Field | Value |
|-------|-------|
| **Input** | `http://192.168.1.1/admin` |
| **Regex** | ✅ Matches — IP address alternative branch matches `192.168.1.1` |
| **DFA path** | q0…q7 → q8(1,9,2) → q9(.) → q10(1,6,8) — transitions via digit/dot path → q11(/) |
| **DFA final state** | q11 (Accepting) |
| **Risk level** | Medium (suspicious indicator: IP-based URL) |
| **Result** | ⚠️ Structurally valid but flagged as suspicious — IP addresses without domain names are a common phishing indicator |

---

### Case 6 — Completely Malformed Input

| Field | Value |
|-------|-------|
| **Input** | `not-a-url` |
| **Regex** | ❌ No match — no protocol present |
| **DFA path** | q0 → qDEAD (first character `n` ≠ `h`) |
| **DFA final state** | qDEAD (Reject) |
| **Risk level** | High |
| **Result** | ❌ Invalid — not a URL |

---

### Case 7 — Multi-level Subdomain with ccTLD

| Field | Value |
|-------|-------|
| **Input** | `https://sub.domain.example.co.uk/page` |
| **Regex** | ✅ Matches — `([\w-]+\.)+` handles multiple subdomain levels; `co.uk` is a valid two-part TLD |
| **DFA path** | q0…q7 → q8(sub) → q9(.) → q10(domain) → q9(.) → q10(example) → q9(.) → q10(co) → q9(.) → q10(uk) → q11(/) |
| **DFA final state** | q11 (Accepting) |
| **Risk level** | Safe |
| **Result** | ✅ Valid |

---

### Case 8 — URL with Space in Hostname

| Field | Value |
|-------|-------|
| **Input** | `http://malicious site.com` |
| **Regex** | ❌ No match — `[^\s]*` stops at whitespace; space makes the domain portion fail |
| **DFA path** | q0…q7 → q8(malicious) → qDEAD (space character is in OTHER category) |
| **DFA final state** | qDEAD (Reject) |
| **Risk level** | High |
| **Result** | ❌ Invalid — whitespace is not allowed in URLs |

---

## Edge Cases Summary

| Scenario | Expected Behavior |
|----------|-------------------|
| `http://` only | Invalid — no host |
| IP address URL | Valid structurally, flagged suspicious |
| Uppercase protocol `HTTP://` | Valid (regex is case-insensitive `/i`) |
| Path with query and fragment | Valid — q11 accepts all |
| Unknown protocol (`ftp://`, `ws://`) | Invalid — DFA rejects at q0 |
| Spaces anywhere in URL | Invalid — DFA to qDEAD, regex fails |
| Multi-level subdomain | Valid — regex and DFA both handle loops |
| URL ending at TLD (`https://google.com`) | Valid — q10 is an accepting state |
