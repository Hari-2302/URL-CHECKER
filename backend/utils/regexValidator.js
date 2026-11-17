/**
 * URL Regex Validator
 * Subject: 22ITT53 - Formal Languages and Automata Theory
 *
 * Validates URL structure using JavaScript Regular Expressions.
 *
 * Pattern breakdown:
 *   ^(https?):\/\/                      - Protocol: http or https (required)
 *   (                                   - Domain group (one of):
 *     ([\w-]+\.)+[\w-]{2,}             -   Hostname with optional subdomains + TLD >= 2 chars
 *     | (\d{1,3}\.){3}\d{1,3}          -   IPv4 address (e.g. 192.168.1.1)
 *   )
 *   (:\d{1,5})?                         - Optional port number
 *   (\/[^\s]*)?                         - Optional path
 *   (\?[^\s]*)?                         - Optional query string
 *   (#[^\s]*)?                          - Optional fragment
 */

function validateWithRegex(url) {
  // Main structural URL pattern — allows standard HTTP/HTTPS, optional userinfo authority (@), domain/IP, port, path, query, fragment
  const urlPattern = /^(https?):\/\/(([\w.~%!$&'()*+,;=:-]+)@)?(([\w-]+\.)+[\w-]{2,}|(\d{1,3}\.){3}\d{1,3})(:\d{1,5})?(\/[^\s]*)?(\?[^\s]*)?(#[^\s]*)?$/i;

  // Protocol presence check (http:// or https://)
  const protocolPattern = /^https?:\/\//i;

  // IP address domain detection
  const ipPattern = /^https?:\/\/(\d{1,3}\.){3}\d{1,3}/i;

  const isValid = urlPattern.test(url);
  const hasProtocol = protocolPattern.test(url);
  const isIP = ipPattern.test(url);

  let matchedPattern = '';
  let details = '';

  if (isValid) {
    if (isIP) {
      matchedPattern = 'IP-based URL';
      details = 'URL matches the IP address pattern. Structurally valid but suspicious — legitimate websites rarely use raw IP addresses.';
    } else {
      matchedPattern = 'Standard URL';
      details = 'URL fully matches the standard URL regex pattern including protocol, domain, and optional path/query/fragment.';
    }
  } else {
    if (!hasProtocol) {
      details = 'URL is missing a valid protocol (http:// or https://). All valid URLs must begin with a recognized protocol.';
    } else if (/^https?:\/\/$/.test(url.trim())) {
      details = 'URL has a valid protocol but no domain name. A complete URL requires a hostname after the protocol separator.';
    } else {
      details = 'URL does not match the standard URL regex pattern. Check domain format, path structure, or query string.';
    }
  }

  return {
    isValid,
    matchedPattern,
    details,
    testedPattern: urlPattern.toString()
  };
}

module.exports = { validateWithRegex };
