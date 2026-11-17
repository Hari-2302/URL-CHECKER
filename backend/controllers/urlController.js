const URLHistory = require('../models/URLHistory');
const { validateWithRegex } = require('../utils/regexValidator');
const { validateWithDFA }   = require('../utils/dfaValidator');

// ================================================================
// checkSuspiciousPatterns
// ================================================================
// Independently inspects the URL for predefined suspicious patterns.
// This runs regardless of Regex/DFA results.
// A structurally valid URL can still be SUSPICIOUS.
//
// Returns: { reasons: string[], hasSuspicion: boolean }
// ================================================================
function checkSuspiciousPatterns(rawUrl) {
  const reasons = [];

  // ── Parse safely ────────────────────────────────────────────────
  let parsed = null;
  try { parsed = new URL(rawUrl); } catch { /* unparseable — no object checks */ }

  // ── 1. @ symbol in the URL authority (credential injection) ─────
  //   Only in authority/userinfo section, NOT in query or path.
  //   https://example.com@evil.com → browser navigates to evil.com
  if (parsed) {
    if (parsed.username || parsed.password) {
      reasons.push(
        `@ symbol in URL authority; actual hostname is ${parsed.hostname}.`
      );
    }
  } else {
    // For raw strings where URL constructor might fail, check only authority before first '/'
    const authority = rawUrl.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0];
    if (authority.includes('@')) {
      const actualHost = authority.split('@').pop();
      reasons.push(
        `@ symbol in URL authority; actual hostname is ${actualHost}.`
      );
    }
  }

  // ── 2. IP address used as hostname ──────────────────────────────
  if (parsed && /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname)) {
    reasons.push(
      `Raw IP address used as hostname (${parsed.hostname}). ` +
      `Legitimate websites almost always use registered domain names.`
    );
  } else if (!parsed && /^https?:\/\/(\d{1,3}\.){3}\d{1,3}/i.test(rawUrl)) {
    reasons.push('Raw IP address used as hostname. Legitimate websites rarely use raw IPs.');
  }

  // ── 3. URL shortener domains ─────────────────────────────────────
  const SHORTENERS = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd',
    'buff.ly', 'rebrand.ly', 'short.link', 'tiny.cc', 'bl.ink',
    'cutt.ly', 'shorturl.at', 'x.co', 'tiny.one'
  ];
  if (parsed) {
    const hn = parsed.hostname.toLowerCase();
    const matched = SHORTENERS.find(s => hn === s || hn.endsWith('.' + s));
    if (matched) {
      reasons.push(
        `URL shortener domain detected (${parsed.hostname}). ` +
        `Shorteners hide the true destination and are frequently abused in phishing.`
      );
    }
  }

  // ── 4. Excessive subdomains ──────────────────────────────────────
  if (parsed) {
    const parts = parsed.hostname.split('.');
    if (parts.length > 4) {
      reasons.push(
        `Excessive subdomains (${parts.length - 2} subdomain levels in "${parsed.hostname}"). ` +
        `Phishing sites stack subdomains to mimic trusted brands.`
      );
    }
  }

  // ── 5. Suspicious keywords in hostname or path ───────────────────
  //   Note: These are INDICATORS only — a valid login page can have them.
  //   We flag them as suspicious, not malicious.
  const SUSPICIOUS_KEYWORDS = [
    'verify', 'verification', 'confirm', 'password', 'passwd',
    'banking', 'account-update', 'suspended', 'secure-login',
    'reset-password', 'recover', 'credential', 'signin-verify',
    'login-verify', 'update-account'
  ];
  if (parsed) {
    const target = (parsed.hostname + parsed.pathname).toLowerCase();
    const matched = SUSPICIOUS_KEYWORDS.filter(kw => target.includes(kw));
    if (matched.length > 0) {
      reasons.push(
        `Suspicious keyword(s) in hostname/path: [${matched.join(', ')}]. ` +
        `These words are commonly used by phishing pages to impersonate banks or account portals. ` +
        `Note: a legitimate site may also use these words.`
      );
    }
  }

  // ── 6. No HTTPS ──────────────────────────────────────────────────
  if (parsed && parsed.protocol === 'http:') {
    reasons.push(
      `Unencrypted HTTP protocol. Data transmitted over HTTP is not encrypted ` +
      `and can be intercepted (man-in-the-middle attack).`
    );
  }

  // ── 7. External redirect & encoded URL parameters ───────────────
  //   Parse query params using URLSearchParams.
  //   Decode values and compare hostnames to detect open redirects.
  const REDIRECT_PARAMS = [
    'redirect', 'redirect_to', 'redirect_url', 'redirect_uri',
    'url', 'next', 'return', 'return_to', 'returnurl',
    'continue', 'destination', 'goto', 'target', 'redir', 'location'
  ];

  if (parsed) {
    const originalHostname = parsed.hostname.toLowerCase();
    const foundRedirects = [];

    // Check specific known redirect parameters first
    for (const [param, rawVal] of parsed.searchParams.entries()) {
      if (!rawVal) continue;

      // Safely decode parameter value (supports double-encoded URLs)
      let decoded = rawVal;
      try { decoded = decodeURIComponent(rawVal); } catch { /* keep raw */ }
      try { decoded = decodeURIComponent(decoded); } catch { /* keep single */ }

      // Check if value contains an external URL
      if (/^https?:\/\//i.test(decoded.trim())) {
        try {
          const redirectTarget = new URL(decoded.trim());
          const redirectHostname = redirectTarget.hostname.toLowerCase();

          // Flag if destination hostname differs from original hostname
          if (redirectHostname !== originalHostname &&
              !redirectHostname.endsWith('.' + originalHostname) &&
              !originalHostname.endsWith('.' + redirectHostname)) {
            const isKnownRedirect = REDIRECT_PARAMS.includes(param.toLowerCase());
            const desc = isKnownRedirect
              ? `${redirectHostname}`
              : `${redirectHostname} (in encoded parameter "${param}")`;
            if (!foundRedirects.includes(desc)) {
              foundRedirects.push(desc);
            }
          }
        } catch { /* ignore non-parseable URL values */ }
      }
    }

    if (foundRedirects.length > 0) {
      reasons.push(`External redirect detected: ${foundRedirects.join(', ')}`);
    }
  }

  // ── 8. Misleading domain (digit substitution / typosquatting) ───
  if (parsed) {
    const hn = parsed.hostname.toLowerCase().replace(/\.(com|net|org|io|co)$/, '');
    // Look for digits mixed into letter sequences (e.g. paypa1, g00gle)
    if (/[a-z]\d[a-z]/.test(hn) || /\d[a-z]\d/.test(hn)) {
      reasons.push(
        `Possible typosquatting — hostname "${parsed.hostname}" contains digits mixed into ` +
        `letter sequences, which may mimic a known brand (e.g. paypa1.com, g00gle.com).`
      );
    }
  }

  return { reasons, hasSuspicion: reasons.length > 0 };
}

// ================================================================
// analyzeUrl — POST /api/analyze
// ================================================================
async function analyzeUrl(req, res) {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid URL string.' });
    }
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return res.status(400).json({ error: 'URL cannot be empty.' });
    if (trimmedUrl.length > 2048) return res.status(400).json({ error: 'URL is too long (max 2048 characters).' });

    // ── Run structural validators ──────────────────────────────────
    const regexResult = validateWithRegex(trimmedUrl);
    const dfaResult   = validateWithDFA(trimmedUrl);

    // ── Run security analysis (independent of structure) ──────────
    const { reasons, hasSuspicion } = checkSuspiciousPatterns(trimmedUrl);

    // ── Determine securityStatus ───────────────────────────────────
    // INVALID  → Regex OR DFA failed (URL is structurally malformed)
    // SUSPICIOUS → Both passed but suspicious patterns found
    // NO_SUSPICIOUS_PATTERN → Both passed and no suspicious patterns
    let securityStatus;
    if (!regexResult.isValid || !dfaResult.isAccepted) {
      securityStatus = 'INVALID';
    } else if (hasSuspicion) {
      securityStatus = 'SUSPICIOUS';
    } else {
      securityStatus = 'NO_SUSPICIOUS_PATTERN';
    }

    // ── Map to legacy fields (kept for backward compat in DB/UI) ──
    const finalState =
      securityStatus === 'NO_SUSPICIOUS_PATTERN' ? 'valid' :
      securityStatus === 'SUSPICIOUS'             ? 'suspicious' : 'invalid';

    const riskLevel =
      securityStatus === 'NO_SUSPICIOUS_PATTERN' ? 'safe'   :
      securityStatus === 'SUSPICIOUS'             ? (reasons.length >= 3 ? 'high' : 'medium') :
      'high';

    const isValid = securityStatus !== 'INVALID';

    // Build indicator objects
    const suspiciousIndicators = reasons.map(r => {
      const colonIdx = r.indexOf(' ');
      return { type: r.split(' ')[0] || 'Flag', reason: r };
    });

    // ── Save to MongoDB ────────────────────────────────────────────
    const record = new URLHistory({
      originalUrl: trimmedUrl,
      isValid,
      regexResult: {
        isValid:        regexResult.isValid,
        matchedPattern: regexResult.matchedPattern,
        details:        regexResult.details
      },
      dfaResult: {
        isAccepted:        dfaResult.isAccepted,
        finalState:        dfaResult.finalState,
        transitionHistory: dfaResult.transitionHistory,
        details:           dfaResult.details
      },
      securityStatus,
      suspiciousIndicators,
      finalState,
      riskLevel
    });

    await record.save();

    // ── API Response ───────────────────────────────────────────────
    return res.status(200).json({
      _id:         record._id,
      originalUrl: trimmedUrl,
      // Three independent results:
      regexValid:    regexResult.isValid,
      dfaAccepted:   dfaResult.isAccepted,
      securityStatus,
      suspiciousReasons: reasons,
      // Full details for UI:
      regexResult,
      dfaResult,
      suspiciousIndicators,
      // Legacy compat:
      isValid,
      finalState,
      riskLevel,
      createdAt: record.createdAt
    });

  } catch (err) {
    console.error('analyzeUrl error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}

// ================================================================
// getHistory — GET /api/history
// ================================================================
async function getHistory(req, res) {
  try {
    const records = await URLHistory.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select('originalUrl isValid regexResult dfaResult securityStatus finalState riskLevel createdAt suspiciousIndicators');
    return res.status(200).json(records);
  } catch (err) {
    console.error('getHistory error:', err);
    return res.status(500).json({ error: 'Failed to fetch history.' });
  }
}

// ================================================================
// getStats — GET /api/stats
// ================================================================
async function getStats(req, res) {
  try {
    const totalScans      = await URLHistory.countDocuments();
    const noSuspicionCount = await URLHistory.countDocuments({ securityStatus: 'NO_SUSPICIOUS_PATTERN' });
    const suspiciousCount  = await URLHistory.countDocuments({ securityStatus: 'SUSPICIOUS' });
    const invalidCount     = await URLHistory.countDocuments({ securityStatus: 'INVALID' });
    // Fallback for legacy records that only have finalState
    const legacySafeCount  = await URLHistory.countDocuments({ securityStatus: { $exists: false }, finalState: 'valid' });
    const legacySuspCount  = await URLHistory.countDocuments({ securityStatus: { $exists: false }, finalState: 'suspicious' });
    const legacyInvCount   = await URLHistory.countDocuments({ securityStatus: { $exists: false }, finalState: 'invalid' });

    const safeCount = noSuspicionCount + legacySafeCount;
    const totalSusp = suspiciousCount  + legacySuspCount;
    const totalInv  = invalidCount     + legacyInvCount;

    const lastRecord = await URLHistory.findOne().sort({ createdAt: -1 });
    const recentRecords = await URLHistory.find().sort({ createdAt: -1 }).limit(200);

    // Top domains
    const domainMap = {};
    recentRecords.forEach(r => {
      try {
        const domain = new URL(r.originalUrl).hostname;
        const status = r.securityStatus || r.finalState || 'invalid';
        if (!domainMap[domain]) {
          domainMap[domain] = { domain, count: 0, status, riskLevel: r.riskLevel, lastScanned: r.createdAt };
        }
        domainMap[domain].count += 1;
      } catch {
        const fallback = r.originalUrl.substring(0, 30);
        if (!domainMap[fallback]) {
          domainMap[fallback] = { domain: fallback, count: 1, status: r.finalState || 'invalid', riskLevel: r.riskLevel, lastScanned: r.createdAt };
        } else {
          domainMap[fallback].count += 1;
        }
      }
    });
    const topDomains = Object.values(domainMap).sort((a, b) => b.count - a.count).slice(0, 5);

    // Trends by date
    const trendsMap = {};
    recentRecords.forEach(r => {
      const d = new Date(r.createdAt).toLocaleDateString('en-GB');
      if (!trendsMap[d]) trendsMap[d] = { date: d, legitimate: 0, suspicious: 0, invalid: 0, total: 0 };
      trendsMap[d].total += 1;
      const st = r.securityStatus || r.finalState;
      if (st === 'NO_SUSPICIOUS_PATTERN' || st === 'valid') trendsMap[d].legitimate  += 1;
      else if (st === 'SUSPICIOUS' || st === 'suspicious')  trendsMap[d].suspicious  += 1;
      else                                                   trendsMap[d].invalid     += 1;
    });

    return res.status(200).json({
      totalScans,
      safeCount,
      suspiciousCount: totalSusp,
      invalidCount:    totalInv,
      phishingOrSuspicious: totalSusp + totalInv,
      lastScan: lastRecord ? lastRecord.createdAt : null,
      topDomains,
      trends: Object.values(trendsMap)
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
}

// ================================================================
// deleteHistoryRecord — DELETE /api/history/:id
// ================================================================
async function deleteHistoryRecord(req, res) {
  try {
    const { id } = req.params;
    const deleted = await URLHistory.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Record not found.' });
    return res.status(200).json({ message: 'Record deleted successfully.' });
  } catch (err) {
    console.error('deleteHistoryRecord error:', err);
    return res.status(500).json({ error: 'Failed to delete record.' });
  }
}

module.exports = { analyzeUrl, getHistory, getStats, deleteHistoryRecord };
