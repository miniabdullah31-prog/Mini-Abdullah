const {
  getTodayContent,
  toClientShape,
} = require("../services/dailyContentService");

/** GET /api/daily-content/today */
async function getToday(req, res) {
  try {
    const doc = await getTodayContent();
    const data = toClientShape(doc);

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.log("[daily-content] today error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load today's learning content",
    });
  }
}

module.exports = {
  getToday,
};
