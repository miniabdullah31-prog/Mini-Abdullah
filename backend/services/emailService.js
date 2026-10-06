const nodemailer = require("nodemailer");

/**
 * Read SMTP settings from environment only (never hardcode credentials).
 * Placeholder / empty values count as "not configured".
 */

function envTrim(name) {
  const raw = process.env[name];
  if (raw == null) return "";
  return String(raw).trim().replace(/^["']|["']$/g, "");
}

function looksLikePlaceholder(value) {
  if (!value) return true;
  const v = String(value).trim();
  if (!v) return true;
  // Common template placeholders — not real credentials
  if (/^YOUR[_-]/i.test(v)) return true;
  if (/placeholder/i.test(v)) return true;
  if (/^<.*>$/.test(v)) return true;
  if (/^(changeme|todo|xxx|null|undefined)$/i.test(v)) return true;
  return false;
}

/**
 * True only when host + user + pass look like real SMTP config.
 * Does not log or expose secrets.
 */
function isMailConfigured() {
  const host = envTrim("SMTP_HOST");
  const user = envTrim("SMTP_USER");
  const pass = envTrim("SMTP_PASS");
  if (!host || looksLikePlaceholder(host)) return false;
  if (!user || looksLikePlaceholder(user)) return false;
  if (!pass || looksLikePlaceholder(pass)) return false;
  // Gmail app passwords are typically 16 chars (often with spaces); require some length
  if (pass.replace(/\s+/g, "").length < 8) return false;
  return true;
}

function smtpNotConfiguredMessage() {
  return (
    "Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS " +
    "in backend/.env (one app sender account — not each user's email). " +
    "Use a real mailbox / app password; leave them empty for DEV OTP mode."
  );
}

function getTransporter() {
  if (!isMailConfigured()) {
    const err = new Error(smtpNotConfiguredMessage());
    err.code = "SMTP_NOT_CONFIGURED";
    throw err;
  }

  const host = envTrim("SMTP_HOST");
  const port = Number(envTrim("SMTP_PORT") || 587);
  const user = envTrim("SMTP_USER");
  const pass = envTrim("SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port: Number.isFinite(port) ? port : 587,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

function resolveFromAddress() {
  const mailFrom = envTrim("MAIL_FROM");
  const user = envTrim("SMTP_USER");
  if (mailFrom && !looksLikePlaceholder(mailFrom)) {
    return mailFrom;
  }
  if (user && !looksLikePlaceholder(user)) {
    return `Mini Abdullah <${user}>`;
  }
  return "Mini Abdullah <noreply@miniabdullah.app>";
}

/**
 * Safe error message for API clients (never includes password).
 * @param {unknown} err
 */
function publicMailErrorMessage(err) {
  if (!err) {
    return "Could not send email. Check SMTP settings in backend/.env";
  }
  const code = err.code || err.responseCode;
  const msg = String(err.message || "");

  if (code === "SMTP_NOT_CONFIGURED" || /not configured/i.test(msg)) {
    return smtpNotConfiguredMessage();
  }
  if (
    code === "EAUTH" ||
    /invalid login|authentication|credentials|535/i.test(msg)
  ) {
    return (
      "SMTP authentication failed. Check SMTP_USER and SMTP_PASS " +
      "(for Gmail use an App Password) in backend/.env"
    );
  }
  if (
    code === "ECONNECTION" ||
    code === "ETIMEDOUT" ||
    code === "ESOCKET" ||
    /timeout|connect/i.test(msg)
  ) {
    return (
      "Could not connect to the SMTP server. Check SMTP_HOST, SMTP_PORT, " +
      "and network/firewall settings."
    );
  }
  // Do not forward raw provider dumps that might include auth material
  return "Could not send email. Check SMTP settings in backend/.env";
}

/**
 * Send an email via SMTP (signup verification OTP, forgot-password OTP, etc.).
 * Credentials are read only from process.env.
 * @param {{ to: string, subject: string, text?: string, html?: string }} options
 */
async function sendMail({ to, subject, text, html }) {
  if (!to || !subject) {
    throw new Error("sendMail requires `to` and `subject`");
  }
  if (!text && !html) {
    throw new Error("sendMail requires `text` or `html`");
  }

  if (!isMailConfigured()) {
    const err = new Error(smtpNotConfiguredMessage());
    err.code = "SMTP_NOT_CONFIGURED";
    throw err;
  }

  let transporter;
  try {
    transporter = getTransporter();
  } catch (err) {
    // Never log SMTP_PASS
    console.log("[email] transporter setup failed:", publicMailErrorMessage(err));
    const wrapped = new Error(publicMailErrorMessage(err));
    wrapped.code = err.code || "SMTP_SETUP_FAILED";
    throw wrapped;
  }

  try {
    const info = await transporter.sendMail({
      from: resolveFromAddress(),
      to,
      subject,
      text,
      html,
    });
    // Log delivery id only — never password, never OTP body
    console.log(
      "[email] sent ok",
      info && info.messageId ? `(id=${info.messageId})` : "",
    );
    return info;
  } catch (err) {
    console.log("[email] send failed:", publicMailErrorMessage(err));
    const wrapped = new Error(publicMailErrorMessage(err));
    wrapped.code = err.code || "SMTP_SEND_FAILED";
    throw wrapped;
  }
}

module.exports = {
  sendMail,
  isMailConfigured,
  publicMailErrorMessage,
};
