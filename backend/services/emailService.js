const nodemailer = require("nodemailer");

function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!isMailConfigured()) {
    throw new Error(
      "Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env (one app sender account — not each user's email)"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Send an email via SMTP.
 * @param {{ to: string, subject: string, text?: string, html?: string }} options
 */
async function sendMail({ to, subject, text, html }) {
  if (!to || !subject) {
    throw new Error("sendMail requires `to` and `subject`");
  }
  if (!text && !html) {
    throw new Error("sendMail requires `text` or `html`");
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return info;
}

module.exports = { sendMail, isMailConfigured };
