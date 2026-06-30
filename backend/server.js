const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: "./.env" });
console.log(process.env.MONGO_URI);
const authRoutes = require("./routes/auth");
const prayerRoutes = require("./routes/prayerRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/ping", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/prayer", prayerRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});