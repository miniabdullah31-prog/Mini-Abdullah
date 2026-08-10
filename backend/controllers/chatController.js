const { generateChatReply } = require("../services/chatService");

async function chat(req, res) {
  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const result = await generateChatReply(message, history);

    return res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        model: result.model,
      },
    });
  } catch (error) {
    if (error.code === "MISSING_API_KEY") {
      return res.status(503).json({
        success: false,
        message:
          "Chat AI is not configured. Add GEMINI_API_KEY in backend/.env",
      });
    }

    if (error.code === "VALIDATION") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.log("Chat error:", error.message);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Could not get a reply right now. Please try again.",
    });
  }
}

module.exports = {
  chat,
};
