const DailyContent = require("../models/DailyContent");

const TZ = "Asia/Karachi";

/** YYYY-MM-DD in Pakistan timezone */
function todayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dayIndex(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

const WORD_POOL = [
  {
    word: "Sabr",
    wordMeaning: "Patience — staying calm and trusting Allah",
    wordExample: "When homework is hard, use Sabr and try again!",
  },
  {
    word: "Shukr",
    wordMeaning: "Gratitude — saying thank you to Allah",
    wordExample: "Say Alhamdulillah after every meal for Shukr.",
  },
  {
    word: "Tawakkul",
    wordMeaning: "Trust in Allah after doing your best",
    wordExample: "Study well, then have Tawakkul before your test.",
  },
  {
    word: "Ikhlaas",
    wordMeaning: "Doing good deeds only for Allah",
    wordExample: "Help your sibling with Ikhlaas, not for praise.",
  },
  {
    word: "Adab",
    wordMeaning: "Good manners and respect",
    wordExample: "Say Assalamu Alaikum with Adab when you enter home.",
  },
  {
    word: "Taqwa",
    wordMeaning: "Being mindful of Allah in everything",
    wordExample: "Choose kind words with Taqwa when you feel angry.",
  },
  {
    word: "Rahmah",
    wordMeaning: "Mercy and kindness",
    wordExample: "Show Rahmah to animals and plants.",
  },
  {
    word: "Sidq",
    wordMeaning: "Truthfulness",
    wordExample: "Always speak with Sidq, even when it is hard.",
  },
];

const DUA_POOL = [
  {
    dua: "رَبِّ زِدْنِي عِلْمًا",
    duaMeaning: "My Lord, increase me in knowledge.",
  },
  {
    dua: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً",
    duaMeaning: "Our Lord, give us good in this world and the next.",
  },
  {
    dua: "بِسْمِ اللَّهِ",
    duaMeaning: "In the name of Allah — say before starting anything good.",
  },
  {
    dua: "الْحَمْدُ لِلَّهِ",
    duaMeaning: "All praise is for Allah — say when something good happens.",
  },
  {
    dua: "رَبِّ اغْفِرْ لِي",
    duaMeaning: "My Lord, forgive me.",
  },
  {
    dua: "سُبْحَانَ اللَّهِ",
    duaMeaning: "Glory be to Allah — a beautiful dhikr anytime.",
  },
];

const QUEST_POOL = [
  {
    questTitle: "Kindness Quest",
    questDescription: "Do one kind act for a family member today.",
    rewardXP: 15,
    rewardCoins: 8,
  },
  {
    questTitle: "Salah Star",
    questDescription: "Pray one salah on time and say the duas after it.",
    rewardXP: 20,
    rewardCoins: 10,
  },
  {
    questTitle: "Quran Minute",
    questDescription: "Read or listen to Quran for 5 minutes.",
    rewardXP: 12,
    rewardCoins: 6,
  },
  {
    questTitle: "Wudu Warrior",
    questDescription: "Practice wudu steps in the Games hub.",
    rewardXP: 18,
    rewardCoins: 9,
  },
  {
    questTitle: "True or False Hero",
    questDescription: "Play one round of True or False in Games.",
    rewardXP: 10,
    rewardCoins: 5,
  },
  {
    questTitle: "Dua Detective",
    questDescription: "Open Duas and learn one new dua by heart.",
    rewardXP: 14,
    rewardCoins: 7,
  },
];

function pickFromPool(pool, index) {
  return pool[index % pool.length];
}

function buildDailyPayload(dateKey) {
  const idx = dayIndex(dateKey);
  const word = pickFromPool(WORD_POOL, idx);
  const dua = pickFromPool(DUA_POOL, idx + 3);
  const quest = pickFromPool(QUEST_POOL, idx + 5);
  return {
    date: dateKey,
    ...word,
    ...dua,
    ...quest,
  };
}

async function ensureTodayContent(dateKey = todayKey()) {
  let doc = await DailyContent.findOne({ date: dateKey });
  if (doc) {
    return doc;
  }
  const payload = buildDailyPayload(dateKey);
  doc = await DailyContent.create(payload);
  return doc;
}

async function getTodayContent() {
  return ensureTodayContent(todayKey());
}

function toClientShape(doc) {
  if (!doc) return null;
  return {
    date: doc.date,
    word: doc.word,
    wordMeaning: doc.wordMeaning,
    wordExample: doc.wordExample || "",
    dua: doc.dua,
    duaMeaning: doc.duaMeaning,
    questTitle: doc.questTitle,
    questDescription: doc.questDescription,
    rewardXP: doc.rewardXP ?? 10,
    rewardCoins: doc.rewardCoins ?? 5,
  };
}

module.exports = {
  TZ,
  todayKey,
  ensureTodayContent,
  getTodayContent,
  toClientShape,
  buildDailyPayload,
};
