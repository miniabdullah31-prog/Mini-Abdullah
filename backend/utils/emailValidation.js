/**
 * Shared email format check (signup / verify / resend).
 * Simple practical RFC-lite pattern — not a full RFC 5322 parser.
 */
function isValidEmailFormat(email) {
  const value = String(email || "")
    .trim()
    .toLowerCase();
  if (!value) return false;
  // local@domain.tld — rejects missing @, spaces, and bare "a@b"
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const VALID_EMAIL_MESSAGE = "Please enter a valid email address.";

module.exports = {
  isValidEmailFormat,
  VALID_EMAIL_MESSAGE,
};
