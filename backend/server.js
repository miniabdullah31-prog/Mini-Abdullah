const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/auth");
const prayerRoutes = require("./routes/prayerRoutes");
const chatRoutes = require("./routes/chatRoutes");
const inspirationRoutes = require("./routes/inspiration");
const supportRoutes = require("./routes/supportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dailyContentRoutes = require("./routes/dailyContentRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const { startDailyNotificationScheduler } = require("./services/dailyNotificationScheduler");
const { seedTutorsIfNeeded } = require("./services/tutorService");
const { seedMediaIfNeeded, PUBLIC_DIR } = require("./services/mediaService");
const mediaRoutes = require("./routes/mediaRoutes");
const rewardsRoutes = require("./routes/rewardsRoutes");
const User = require("./models/User");

const app = express();

app.use(helmet());

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean)
  : true;

app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

app.use(express.json({ limit: "100kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again later.",
  },
});

app.get("/ping", (_req, res) => res.json({ ok: true }));

/** Quick status — Mongo/Gemini optional; server still runs without them. */
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mongo: mongoose.connection.readyState === 1,
    gemini: !!process.env.GEMINI_API_KEY,
    jwt: !!process.env.JWT_SECRET,
    firebaseAdmin: !!(
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ),
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/prayer", prayerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/inspiration", inspirationRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/daily-content", dailyContentRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/rewards", rewardsRoutes);

app.use(
  "/media",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(PUBLIC_DIR, {
    maxAge: "30d",
    etag: true,
    lastModified: true,
    index: false,
    setHeaders(res) {
      // Public lesson/story files only — not private user uploads.
      res.setHeader(
        "Cache-Control",
        "public, max-age=2592000, stale-while-revalidate=86400",
      );
    },
  }),
);

const port = process.env.PORT || 5000;

async function start() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected");
      try {
        await seedTutorsIfNeeded();
      } catch (seedErr) {
        console.log("Tutor seed error:", seedErr.message);
      }
      try {
        await seedMediaIfNeeded();
      } catch (mediaSeedErr) {
        console.log("Media seed error:", mediaSeedErr.message);
      }
      try {
        await User.ensureGoogleIdIndex();
      } catch (googleIdIdxErr) {
        console.log("User googleId index migrate error:", googleIdIdxErr.message);
      }
    } else {
      console.log("MONGO_URI missing — DB features unavailable");
    }
  } catch (err) {
    console.log("MongoDB connection error:", err.message);
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
    console.log(`Phone/emulator can reach this PC at http://<your-LAN-IP>:${port}`);
    startDailyNotificationScheduler();
  });
}

start();
