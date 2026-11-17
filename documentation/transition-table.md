# DFA State Transition Table

## URL Safety Checker — Formal Languages and Automata Theory (22ITT53)

### DFA Definition

- **States (Q):** q0, q1, q2, q3, q4, q4s, q5, q6, q7, q8, q9, q10, q11, qDEAD
- **Input Alphabet (Σ):** Character classes: LETTER, DIGIT, DOT, COLON, SLASH, HYPHEN, AT, QUESTION, HASH, OTHER
- **Start State (q0):** q0
- **Accepting States (F):** {q10, q11}
- **Dead State:** qDEAD

### Transition Table δ(q, a)

| State | LETTER | DIGIT | DOT | COLON | SLASH | HYPHEN | AT | QUESTION | HASH | OTHER |
|-------|--------|-------|-----|-------|-------|--------|----|----------|------|-------|
| **q0** *(start →)* | q1 (if 'h') else qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD |
| **q1** | q2 (if 't') else qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD |
| **q2** | q3 (if 't') else qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD |
| **q3** | q4 (if 'p') else qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD |
| **q4** | q4s (if 's') else qDEAD | qDEAD | qDEAD | q5 | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD |
| **q4s** | qDEAD | qDEAD | qDEAD | q5 | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD |
| **q5** | qDEAD | qDEAD | qDEAD | qDEAD | q6 | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD |
| **q6** | qDEAD | qDEAD | qDEAD | qDEAD | q7 | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD |
| **q7** | q8 | q8 | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD |
| **q8** | q8 | q8 | q9 | q11 | q11 | q8 | qDEAD | qDEAD | qDEAD | qDEAD |
| **q9** | q10 | q10 | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD |
| **q10** ✅ | q10 | q10 | q9 | q11 | q11 | q10 | qDEAD | q11 | q11 | qDEAD |
| **q11** ✅ | q11 | q11 | q11 | q11 | q11 | q11 | q11 | q11 | q11 | qDEAD |
| **qDEAD** ❌ | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD | qDEAD |

### State Descriptions

| State | Description | Type |
|-------|-------------|------|
| q0 | Start state — awaiting first character | Start |
| q1 | Read 'h' — beginning of protocol | Intermediate |
| q2 | Read 'ht' | Intermediate |
| q3 | Read 'htt' | Intermediate |
| q4 | Read 'http' — could be http: or https | Intermediate |
| q4s | Read 'https' — waiting for colon | Intermediate |
| q5 | Read protocol colon (http: or https:) | Intermediate |
| q6 | Read first slash | Intermediate |
| q7 | Read '//' — protocol separator complete | Intermediate |
| q8 | Reading domain name characters | Intermediate |
| q9 | Read a dot in domain — awaiting more chars or TLD | Intermediate |
| q10 | Reading TLD characters | **Accepting** |
| q11 | Reading path, query string, or fragment | **Accepting** |
| qDEAD | Dead state — invalid input encountered | Reject |
