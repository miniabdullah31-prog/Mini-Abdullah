const path = require("path");
const fs = require("fs");
const Media = require("../models/Media");

const PUBLIC_DIR = path.join(__dirname, "..", "media", "public");

const STORY_SEED = [
  {
    slug: "story-prophet-musa",
    title: "Prophet Musa (AS)",
    type: "image",
    category: "stories",
    filePath: "stories/prophet-musa.png",
    thumbnailPath: "stories/thumbs/prophet-musa.jpg",
    extra: { localId: 1 },
  },
  {
    slug: "story-prophet-yunus",
    title: "Prophet Yunus (AS)",
    type: "image",
    category: "stories",
    filePath: "stories/hazrt-younas.png",
    extra: { localId: 2 },
    thumbnailPath: "stories/thumbs/hazrt-younas.jpg",
  },
  {
    slug: "story-prophet-ibrahim",
    title: "Prophet Ibrahim (AS)",
    type: "image",
    category: "stories",
    filePath: "stories/hazrt-ibrahim.png",
    extra: { localId: 3 },
    thumbnailPath: "stories/thumbs/hazrt-ibrahim.jpg",
  },
  {
    slug: "story-daily-good-deed",
    title: "Daily good deed",
    type: "image",
    category: "stories",
    filePath: "stories/daily-good-deed.png",
    extra: { localId: 4 },
    thumbnailPath: "stories/thumbs/daily-good-deed.jpg",
  },
  {
    slug: "story-helping-parents",
    title: "Helping parents",
    type: "image",
    category: "stories",
    filePath: "stories/helping-parents.png",
    extra: { localId: 5 },
    thumbnailPath: "stories/thumbs/helping-parents.jpg",
  },
  {
    slug: "story-seerah-muhammad",
    title: "Seerah of Prophet Muhammad ﷺ",
    type: "image",
    category: "stories",
    filePath: "stories/hzrt-muhammad.png",
    extra: { localId: 6 },
    thumbnailPath: "stories/thumbs/hzrt-muhammad.jpg",
  },
  {
    slug: "story-honesty",
    title: "Honesty",
    type: "image",
    category: "stories",
    filePath: "stories/honesty.png",
    extra: { localId: 7 },
    thumbnailPath: "stories/thumbs/honesty.jpg",
  },
  {
    slug: "story-prophet-nuh",
    title: "Prophet Nuh (AS)",
    type: "image",
    category: "stories",
    filePath: "stories/hazrt-nuh.png",
    extra: { localId: 8 },
    thumbnailPath: "stories/thumbs/hazrt-nuh.jpg",
  },
  {
    slug: "story-prophet-yusuf",
    title: "Prophet Yusuf (AS)",
    type: "image",
    category: "stories",
    filePath: "stories/hazrt-yusuf.png",
    extra: { localId: 10 },
    thumbnailPath: "stories/thumbs/hazrt-yusuf.jpg",
  },
];

const DUA_SEED = [
  {
    slug: "dua-morning",
    title: "Morning Dua",
    type: "video",
    category: "duas",
    filePath: "duas/morning-dua.mp4",
    extra: { localId: 1 },
  },
  {
    slug: "dua-sleeping",
    title: "Sleeping Dua",
    type: "video",
    category: "duas",
    filePath: "duas/sleeping-dua.mp4",
    extra: { localId: 2 },
  },
  {
    slug: "dua-for-parents",
    title: "Dua for Parents",
    type: "video",
    category: "duas",
    filePath: "duas/dua-for-parents.mp4",
    extra: { localId: 5 },
  },
];

function publicFileUrl(filePath) {
  if (!filePath) return "";
  const rel = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");
  const base = String(process.env.MEDIA_PUBLIC_BASE_URL || "").trim().replace(/\/+$/, "");
  if (base) {
    return `${base}/media/${rel}`;
  }
  return `/media/${rel}`;
}

function toClientShape(doc) {
  if (!doc) return null;
  const mediaUrl = publicFileUrl(doc.filePath);
  const thumbnailUrl = publicFileUrl(doc.thumbnailPath || doc.filePath);
  return {
    id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    type: doc.type,
    category: doc.category,
    mediaUrl,
    thumbnailUrl,
    duration: doc.duration,
    localId: doc.extra?.localId ?? null,
    isActive: !!doc.isActive,
  };
}

function fileExists(relPath) {
  return fs.existsSync(path.join(PUBLIC_DIR, relPath));
}

const FRONTEND_SHORTS_DIR = path.join(
  __dirname,
  "..",
  "..",
  "src",
  "assets",
  "shorts",
);

const STORY_FILE_COPIES = [
  ["prophet musa.png", "stories/prophet-musa.png"],
  ["hazrt younas.png", "stories/hazrt-younas.png"],
  ["hazrt ibrahim.png", "stories/hazrt-ibrahim.png"],
  ["daily good deed.png", "stories/daily-good-deed.png"],
  ["helping parents at home.png", "stories/helping-parents.png"],
  ["hzrt muhammad.png", "stories/hzrt-muhammad.png"],
  ["honesty.png", "stories/honesty.png"],
  ["hazrt nuh.png", "stories/hazrt-nuh.png"],
  ["hazrt yousaf.png", "stories/hazrt-yusuf.png"],
];

function ensureStoryFilesCopied() {
  fs.mkdirSync(path.join(PUBLIC_DIR, "stories"), { recursive: true });
  for (const [fromName, rel] of STORY_FILE_COPIES) {
    const dest = path.join(PUBLIC_DIR, rel);
    if (fs.existsSync(dest)) continue;
    const src = path.join(FRONTEND_SHORTS_DIR, fromName);
    if (!fs.existsSync(src)) continue;
    fs.copyFileSync(src, dest);
    console.log(`[media] copied ${fromName} → ${rel}`);
  }
}

const FRONTEND_DUAS_VIDEOS_DIR = path.join(
  __dirname,
  "..",
  "..",
  "src",
  "assets",
  "duas",
  "videos",
);

const DUA_VIDEO_COPIES = [
  ["WhatsApp Video 2026-09-02 at 9.36.35 AM (1).mp4", "duas/sleeping-dua.mp4"],
  ["WhatsApp Video 2026-09-02 at 9.36.35 AM.mp4", "duas/morning-dua.mp4"],
];

function ensureDuaVideoCopied() {
  fs.mkdirSync(path.join(PUBLIC_DIR, "duas"), { recursive: true });

  for (const [fromName, rel] of DUA_VIDEO_COPIES) {
    const dest = path.join(PUBLIC_DIR, rel);
    if (fs.existsSync(dest)) continue;
    const src = path.join(FRONTEND_DUAS_VIDEOS_DIR, fromName);
    if (!fs.existsSync(src)) continue;
    fs.copyFileSync(src, dest);
    console.log(`[media] copied ${fromName} → ${rel}`);
  }

  // Fallback: sleeping dua from Downloads if still missing
  const sleepingDest = path.join(PUBLIC_DIR, "duas", "sleeping-dua.mp4");
  if (!fs.existsSync(sleepingDest)) {
    const home = process.env.USERPROFILE || process.env.HOME || "";
    const fromDownloads = path.join(
      home,
      "Downloads",
      "WhatsApp Video 2026-09-02 at 9.36.35 AM (1).mp4",
    );
    if (fs.existsSync(fromDownloads)) {
      fs.copyFileSync(fromDownloads, sleepingDest);
      console.log("[media] copied Sleeping Dua video → duas/sleeping-dua.mp4");
    }
  }
}

async function seedMediaIfNeeded() {
  ensureStoryFilesCopied();
  ensureDuaVideoCopied();

  for (const item of [...STORY_SEED, ...DUA_SEED]) {
    const thumbOk = item.thumbnailPath && fileExists(item.thumbnailPath);
    const existing = await Media.findOne({ slug: item.slug });
    if (!existing) {
      if (!fileExists(item.filePath)) {
        console.log(`[media] skip seed ${item.slug} — file missing: ${item.filePath}`);
        continue;
      }
      await Media.create({
        ...item,
        thumbnailPath: thumbOk ? item.thumbnailPath : "",
      });
      console.log(`[media] seeded ${item.slug}`);
      continue;
    }
    let changed = false;
    if (thumbOk && existing.thumbnailPath !== item.thumbnailPath) {
      existing.thumbnailPath = item.thumbnailPath;
      changed = true;
    }
    if (existing.filePath !== item.filePath && fileExists(item.filePath)) {
      existing.filePath = item.filePath;
      changed = true;
    }
    if (existing.extra?.localId !== item.extra.localId) {
      existing.extra = { ...(existing.extra || {}), localId: item.extra.localId };
      existing.markModified("extra");
      changed = true;
    }
    if (changed) {
      await existing.save();
      console.log(`[media] updated ${item.slug}`);
    }
  }
}

async function listMedia({ category, type } = {}) {
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (type) filter.type = type;
  const docs = await Media.find(filter).sort({ "extra.localId": 1, title: 1 }).lean();
  return docs.map(toClientShape);
}

async function getMediaById(id) {
  if (!id || !String(id).match(/^[a-fA-F0-9]{24}$/)) return null;
  const doc = await Media.findOne({ _id: id, isActive: true }).lean();
  return toClientShape(doc);
}

module.exports = {
  PUBLIC_DIR,
  publicFileUrl,
  toClientShape,
  seedMediaIfNeeded,
  listMedia,
  getMediaById,
};
