const { listMedia, getMediaById } = require("../services/mediaService");

/** GET /api/media?category=stories&type=image */
async function list(req, res) {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const type = req.query.type ? String(req.query.type) : undefined;
    const started = Date.now();
    const data = await listMedia({ category, type });
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[stories-perf] GET /api/media category=${category || "all"} ${Date.now() - started}ms items=${data.length}`,
      );
    }
    return res.json({ success: true, data });
  } catch (err) {
    console.log("[media] list error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load media",
    });
  }
}

/** GET /api/media/:id */
async function getOne(req, res) {
  try {
    const item = await getMediaById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    console.log("[media] get error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load media",
    });
  }
}

module.exports = { list, getOne };
