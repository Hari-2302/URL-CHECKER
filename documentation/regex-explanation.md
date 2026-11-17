# URL Regex Pattern — Detailed Explanation

## URL Safety Checker — Formal Languages and Automata Theory (22ITT53)

---

## Overview

Regular expressions (regex) are a powerful tool rooted in formal language theory. A regex defines a **regular language** — the same class of languages recognized by a **Deterministic Finite Automaton (DFA)**. In this project, the regex validator and the DFA validator are two complementary methods for recognizing valid URLs.

---

## The Full Regex Pattern

```
/^(https?):\/\/(([\w-]+\.)+[\w-]{2,}|(\d{1,3}\.){3}\d{1,3})(:\d{1,5})?(\/[^\s]*)?(\?[^\s]*)?(#[^\s]*)?$/i
```

This single pattern validates an entire URL in one pass, checking:
1. Protocol (`http` or `https`)
2. Domain name or IP address
3. Optional port number
4. Optional path
5. Optional query string
6. Optional fragment

---

## Component-by-Component Breakdown

### 1. `^` — Start Anchor

```
^
```

- **Meaning:** Asserts the match must begin at the **start of the string**.
- **Purpose:** Prevents a URL like `garbage https://example.com` from partially matching.
- **Example match:** `https://...` ✅
- **Example fail:** `  https://...` (leading space) ❌

---

### 2. `(https?)` — Protocol Group

```
(https?)
```

- **Meaning:** Matches either `http` or `https`. The `s?` makes the `s` optional (zero or one occurrence).
- **Capture Group 1:** Captures the protocol name for reference.
- **Examples:**
  - `http://example.com` → captures `http` ✅
  - `https://example.com` → captures `https` ✅
  - `ftp://example.com` → no match ❌

---

### 3. `:\/\/` — Protocol Separator

```
:\/\/
```

- **Meaning:** Matches the literal string `://`. The forward slashes are escaped with `\` because `/` is the regex delimiter in JavaScript.
- **Purpose:** This is the mandatory separator between the protocol and the host.
- **Examples:**
  - `https://` ✅
  - `https:/` (single slash) ❌
  - `https//` (missing colon) ❌

---

### 4. `(([\w-]+\.)+[\w-]{2,}|(\d{1,3}\.){3}\d{1,3})` — Host (Domain or IP)

This is the main alternation group, matching **either** a domain name **or** an IPv4 address.

#### 4a. `([\w-]+\.)+[\w-]{2,}` — Domain Name

```
([\w-]+\.)+[\w-]{2,}
```

| Sub-pattern | Meaning |
|-------------|---------|
| `[\w-]+` | One or more word characters (`a-z`, `A-Z`, `0-9`, `_`) or hyphens |
| `\.` | A literal dot |
| `([\w-]+\.)+` | One or more domain label+dot groups (handles subdomains) |
| `[\w-]{2,}` | The TLD — at least 2 characters (e.g., `com`, `org`, `co`) |

- **Examples:**
  - `example.com` ✅
  - `www.example.com` ✅
  - `api.v2.example.co.uk` ✅
  - `example.c` (TLD too short) ❌

#### 4b. `(\d{1,3}\.){3}\d{1,3}` — IPv4 Address

```
(\d{1,3}\.){3}\d{1,3}
```

| Sub-pattern | Meaning |
|-------------|---------|
| `\d{1,3}` | 1–3 digits (one octet) |
| `\.` | A literal dot |
| `(\d{1,3}\.){3}` | Three octet+dot groups |
| `\d{1,3}` | The final octet |

- **Examples:**
  - `http://192.168.1.1` ✅
  - `http://8.8.8.8` ✅
  - `http://999.999.999.999` — structurally matches (regex doesn't validate octet range) ⚠️

> **Note:** The regex matches the structure of an IP address. Range validation (0–255) requires additional logic in the application layer.

---

### 5. `(:\d{1,5})?` — Optional Port

```
(:\d{1,5})?
```

| Sub-pattern | Meaning |
|-------------|---------|
| `:` | Literal colon |
| `\d{1,5}` | 1 to 5 digits (port range 0–99999) |
| `(...)?` | The entire group is optional |

- **Examples:**
  - `https://example.com:8080/api` → port `8080` captured ✅
  - `https://example.com:3000` ✅
  - `https://example.com` (no port) ✅
  - `https://example.com:99999` — structurally matches (application should validate port ≤ 65535) ⚠️

---

### 6. `(\/[^\s]*)?` — Optional Path

```
(\/[^\s]*)?
```

| Sub-pattern | Meaning |
|-------------|---------|
| `\/` | A literal `/` (the path separator) |
| `[^\s]*` | Zero or more non-whitespace characters |
| `(...)?` | Entire group is optional |

- **Examples:**
  - `https://example.com/about` → path `/about` ✅
  - `https://example.com/api/v1/users` ✅
  - `https://example.com/path with spaces` ❌ (spaces not allowed)
  - `https://example.com` (no path) ✅

---

### 7. `(\?[^\s]*)?` — Optional Query String

```
(\?[^\s]*)?
```

| Sub-pattern | Meaning |
|-------------|---------|
| `\?` | Literal `?` (query string start) |
| `[^\s]*` | Zero or more non-whitespace characters |
| `(...)?` | Entire group is optional |

- **Examples:**
  - `https://example.com/search?q=hello` ✅
  - `https://example.com?page=1&limit=10` ✅
  - `https://example.com` (no query) ✅

---

### 8. `(#[^\s]*)?` — Optional Fragment

```
(#[^\s]*)?
```

| Sub-pattern | Meaning |
|-------------|---------|
| `#` | Literal `#` (fragment/anchor identifier) |
| `[^\s]*` | Zero or more non-whitespace characters |
| `(...)?` | Entire group is optional |

- **Examples:**
  - `https://example.com/page#section-2` → fragment `#section-2` ✅
  - `https://example.com#top` ✅
  - `https://example.com` (no fragment) ✅

---

### 9. `$` — End Anchor

```
$
```

- **Meaning:** Asserts the match must end at the **end of the string**.
- **Purpose:** Prevents a partial match where the URL is embedded in a longer invalid string.
- **Example:** `https://example.com garbage text` ❌

---

### 10. `/i` — Case-Insensitive Flag

```
/i
```

- **Meaning:** Makes the entire pattern case-insensitive.
- **Purpose:** `HTTP://EXAMPLE.COM` and `https://Example.Com` are treated as valid.
- **Examples:**
  - `HTTP://EXAMPLE.COM` ✅
  - `Https://Example.Com/Path` ✅

---

## Summary Table

| Component | Pattern | Required? | Purpose |
|-----------|---------|-----------|---------|
| Start anchor | `^` | Yes | Match from beginning |
| Protocol | `(https?)` | Yes | `http` or `https` only |
| Separator | `:\/\/` | Yes | `://` between protocol and host |
| Domain name | `([\w-]+\.)+[\w-]{2,}` | Yes* | Hostname with TLD |
| IP address | `(\d{1,3}\.){3}\d{1,3}` | Yes* | IPv4 address alternative |
| Port | `(:\d{1,5})?` | No | Optional port number |
| Path | `(\/[^\s]*)?` | No | Optional URL path |
| Query string | `(\?[^\s]*)?` | No | Optional query parameters |
| Fragment | `(#[^\s]*)?` | No | Optional anchor/fragment |
| End anchor | `$` | Yes | Match to end of string |
| Flags | `/i` | — | Case-insensitive matching |

*Domain or IP — one of the two must be present.

---

## Regex vs. DFA in This Project

| Feature | Regex | DFA |
|---------|-------|-----|
| Implementation | Single pattern string | Explicit state machine |
| Readability | Compact but cryptic | Verbose but transparent |
| Educational value | Shows regular language notation | Shows automaton transitions |
| Equivalent power | Recognizes regular language | Recognizes regular language |
| Debugging | Harder to trace | Transition history logged per character |

Both approaches recognize the **same class of valid URLs** in this project, confirming the theoretical equivalence between regular expressions and finite automata (Kleene's Theorem).
