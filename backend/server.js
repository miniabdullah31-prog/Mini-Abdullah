const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/auth");
const prayerRoutes = require("./routes/prayerRoutes");
const chatRoutes = require("./routes/chatRoutes");
const inspirationRoutes = require("./routes/inspiration");
const supportRoutes = require("./routes/supportRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/ping", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/prayer", prayerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/inspiration", inspirationRoutes);
app.use("/api/support", supportRoutes);

const port = process.env.PORT || 5000;

async function start() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected");
    } else {
      console.log("MONGO_URI missing — DB features unavailable");
    }
  } catch (err) {
    console.log("MongoDB connection error:", err.message);
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
    console.log(`Phone/emulator can reach this PC at http://<your-LAN-IP>:${port}`);
  });
}

start();
