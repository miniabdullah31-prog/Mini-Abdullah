const SupportMessage = require("../models/SupportMessage");
const { sendMail } = require("../services/emailService");

const submitSupport = async (req, res) => {
  try {
    const { name, email, message, type } = req.body;

    if (!email || !String(email).trim()) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    if (!message || !String(message).trim()) {
      return res.json({
        success: false,
        message: "Message is required",
      });
    }

    const cleanMessage = String(message).trim();
    if (cleanMessage.length > 2000) {
      return res.json({
        success: false,
        message: "Message is too long (max 2000 characters)",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = (name && String(name).trim()) || "Guest";
    const cleanType = type === "feedback" ? "feedback" : "support";

    const saved = await SupportMessage.create({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
      type: cleanType,
    });

    const supportTo =
      process.env.SUPPORT_TO_EMAIL ||
      process.env.SMTP_USER ||
      null;

    let emailSent = false;

    if (supportTo) {
      try {
        const subject =
          cleanType === "feedback"
            ? "Mini Abdullah — App Feedback"
            : "Mini Abdullah — Support Request";

        await sendMail({
          to: supportTo,
          subject,
          text: [
            `Type: ${cleanType}`,
            `From: ${cleanName} <${cleanEmail}>`,
            `Message ID: ${saved._id}`,
            "",
            cleanMessage,
          ].join("\n"),
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
              <h2>${subject}</h2>
              <p><strong>From:</strong> ${cleanName} &lt;${cleanEmail}&gt;</p>
              <p><strong>Type:</strong> ${cleanType}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${cleanMessage
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (mailError) {
        console.log("SUPPORT EMAIL ERROR:", mailError.message);
        // Message is already saved in DB — still treat as success
      }
    }

    return res.json({
      success: true,
      message: emailSent
        ? "Message sent successfully"
        : "Message saved. Our team will review it soon.",
    });
  } catch (error) {
    console.log("SUPPORT ERROR:", error.message);
    return res.json({
      success: false,
      message: error.message || "Could not submit message",
    });
  }
};

module.exports = { submitSupport };
