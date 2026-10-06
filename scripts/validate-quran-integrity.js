/**
 * Offline integrity checks for bundled Quran juz JSON + ruku ends.
 * Run: node scripts/validate-quran-integrity.js
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "src", "data", "quran");
const RUKU = JSON.parse(
  fs.readFileSync(path.join(DIR, "rukuEnds.json"), "utf8"),
);
const SURAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
];

// Quran.com Madani juz boundaries (first verse_key of each juz)
const JUZ_FIRST = {
  1: "1:1",
  2: "2:142",
  3: "2:253",
  4: "3:92",
  5: "4:24",
  6: "4:148",
  7: "5:82",
  8: "6:111",
  9: "7:88",
  10: "8:41",
  11: "9:93",
  12: "11:6",
  13: "12:53",
  14: "15:1",
  15: "17:1",
  16: "18:75",
  17: "21:1",
  18: "23:1",
  19: "25:21",
  20: "27:56",
  21: "29:46",
  22: "33:31",
  23: "36:28",
  24: "39:32",
  25: "41:47",
  26: "46:1",
  27: "51:31",
  28: "58:1",
  29: "67:1",
  30: "78:1",
};

const issues = [];
const byKey = new Map();
const surahAyahs = {};
let total = 0;
const sukun = { u0652: 0, u06e1: 0, u06df: 0 };

for (let j = 1; j <= 30; j++) {
  const arr = JSON.parse(fs.readFileSync(path.join(DIR, `juz-${j}.json`), "utf8"));
  if (!arr.length) issues.push(`juz ${j} empty`);
  if (arr[0].verseKey !== JUZ_FIRST[j]) {
    issues.push(
      `juz ${j} first expected ${JUZ_FIRST[j]} got ${arr[0].verseKey}`,
    );
  }
  for (let i = 0; i < arr.length; i++) {
    const a = arr[i];
    total++;
    if (byKey.has(a.verseKey)) {
      issues.push(`duplicate ${a.verseKey} juz ${byKey.get(a.verseKey)} and ${j}`);
    }
    byKey.set(a.verseKey, j);
    if (i > 0 && a.id < arr[i - 1].id) {
      issues.push(`order juz ${j} ${arr[i - 1].verseKey} -> ${a.verseKey}`);
    }
    if (!a.arabic) issues.push(`missing arabic ${a.verseKey}`);
    if (!a.arabicTajweed || !/class=/.test(a.arabicTajweed)) {
      issues.push(`missing tajweed ${a.verseKey}`);
    }
    surahAyahs[a.surah] = (surahAyahs[a.surah] || 0) + 1;
    for (const ch of a.arabic) {
      const c = ch.codePointAt(0);
      if (c === 0x0652) sukun.u0652++;
      if (c === 0x06e1) sukun.u06e1++;
      if (c === 0x06df) sukun.u06df++;
    }
  }
}

for (let s = 1; s <= 114; s++) {
  const got = surahAyahs[s] || 0;
  const exp = SURAH_COUNTS[s - 1];
  if (got !== exp) issues.push(`surah ${s} ayahs ${got} expected ${exp}`);
}

if (total !== 6236) issues.push(`total ayahs ${total} expected 6236`);
if (byKey.size !== 6236) issues.push(`unique keys ${byKey.size}`);
if (!Array.isArray(RUKU) || RUKU.length < 500) {
  issues.push(`rukuEnds suspicious length ${RUKU?.length}`);
}
for (const k of RUKU) {
  if (!byKey.has(k)) issues.push(`ruku end missing ayah ${k}`);
}

// Boundary spotlight
const j3 = JSON.parse(fs.readFileSync(path.join(DIR, "juz-3.json"), "utf8"));
const j4 = JSON.parse(fs.readFileSync(path.join(DIR, "juz-4.json"), "utf8"));
console.log("Juz3 last", j3[j3.length - 1].verseKey, "Juz4 first", j4[0].verseKey);
console.log("3:92 juz", byKey.get("3:92"), "3:93 juz", byKey.get("3:93"));
console.log("sukun codepoints", sukun);
console.log("ruku ends", RUKU.length);
console.log("total", total, "issues", issues.length);
if (issues.length) {
  console.log(issues.slice(0, 40));
  process.exit(1);
}
console.log("OK");
