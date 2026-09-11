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
    extra: { localId: 1 },
  },
  {
    slug: "story-prophet-yunus",
    title: "Prophet Yunus (AS)",
    type: "image",
    category: "stories",
    filePath: "stories/hazrt-younas.png",
    extra: { localId: 2 },
  },
  {
    slug: "story-prophet-ibrahim",
    title: "Prophet Ibrahim (AS)",
    type: "image",
    category: "stories",
    filePath: "stories/hazrt-ibrahim.png",
    extra: { localId: 3 },
  },
  {
    slug: "story-daily-good-deed",
    title: "Daily good deed",
    type: "image",
    category: "stories",
    filePath: "stories/daily-good-deed.png",
    extra: { localId: 4 },
  },
  {
    slug: "story-helping-parents",
    title: "Helping parents",
    type: "image",
    category: "stories",
    filePath: "stories/helping-parents.png",
    extra: { localId: 5 },
  },
  {
    slug: "story-seerah-muhammad",
    title: "Seerah of Prophet Muhammad ﷺ",
    type: "image",
    category: "stories",
    filePath: "stories/hzrt-muhammad.png",
    extra: { localId: 6 },
  },
  {
    slug: "story-honesty",
    title: "Honesty",
    type: "image",
    category: "stories",
    filePath: "stories/honesty.png",
    extra: { localId: 7 },
  },
  {
    slug: "story-prophet-nuh",
    title: "Prophet Nuh (AS)",
    type: "image",
    category: "stories",
    filePath: "stories/hazrt-nuh.png",
    extra: { localId: 8 },
  },
  {
    slug: "story-prophet-yusuf",
    title: "Prophet Yusuf (AS)",
    type: "image",
    category: "stories",
    filePath: "stories/hazrt-yusuf.png",
    extra: { localId: 10 },
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

async function seedMediaIfNeeded() {
  ensureStoryFilesCopied();

  for (const item of STORY_SEED) {
    const existing = await Media.findOne({ slug: item.slug });
    if (existing) continue;
    if (!fileExists(item.filePath)) {
      console.log(`[media] skip seed ${item.slug} — file missing: ${item.filePath}`);
      continue;
    }
    await Media.create(item);
    console.log(`[media] seeded ${item.slug}`);
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
