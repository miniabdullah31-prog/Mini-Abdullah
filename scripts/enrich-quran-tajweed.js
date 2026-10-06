/**
 * Enrich existing juz-*.json with arabicTajweed from Quran.com
 * text_uthmani_tajweed. Does NOT change arabic / translations.
 *
 * Run: node scripts/enrich-quran-tajweed.js
 */
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const OUT_DIR = path.join(__dirname, "..", "src", "data", "quran");
const META_OUT = path.join(__dirname, "..", "src", "data", "surahMeta.ts");
const QURAN_API = "https://api.quran.com/api/v4";

async function fetchJuzTajweedPage(juzNumber, page) {
  const response = await axios.get(`${QURAN_API}/verses/by_juz/${juzNumber}`, {
    timeout: 60000,
    params: {
      fields: "text_uthmani,text_uthmani_tajweed",
      per_page: 50,
      page,
    },
  });
  return response.data;
}

async function fetchJuzTajweed(juzNumber) {
  const first = await fetchJuzTajweedPage(juzNumber, 1);
  const totalPages = first?.pagination?.total_pages || 1;
  const verses = [...(first?.verses || [])];

  for (let page = 2; page <= totalPages; page += 1) {
    process.stdout.write(`  tajweed page ${page}/${totalPages}\r`);
    const next = await fetchJuzTajweedPage(juzNumber, page);
    verses.push(...(next?.verses || []));
    await new Promise((r) => setTimeout(r, 150));
  }

  const byKey = new Map();
  for (const v of verses) {
    byKey.set(String(v.verse_key), String(v.text_uthmani_tajweed || ""));
  }
  return byKey;
}

async function enrichJuz(juzNumber) {
  const outFile = path.join(OUT_DIR, `juz-${juzNumber}.json`);
  if (!fs.existsSync(outFile)) {
    throw new Error(`Missing ${outFile} — run download-quran-offline.js first`);
  }

  const existing = JSON.parse(fs.readFileSync(outFile, "utf8"));
  if (!Array.isArray(existing) || !existing.length) {
    throw new Error(`Empty juz file: ${outFile}`);
  }

  const tajweedByKey = await fetchJuzTajweed(juzNumber);
  let filled = 0;
  const next = existing.map((ayah) => {
    const key = String(ayah.verseKey || "");
    const arabicTajweed = tajweedByKey.get(key) || ayah.arabicTajweed || "";
    if (arabicTajweed) filled += 1;
    return {
      ...ayah,
      arabic: ayah.arabic, // keep plain Uthmani unchanged
      arabicTajweed,
    };
  });

  fs.writeFileSync(outFile, JSON.stringify(next));
  console.log(
    `Para ${juzNumber}: enriched ${filled}/${next.length} ayahs with arabicTajweed`,
  );
}

async function writeSurahMeta() {
  const response = await axios.get(`${QURAN_API}/chapters`, {
    timeout: 30000,
    params: { language: "en" },
  });
  const chapters = response.data?.chapters || [];
  if (!chapters.length) {
    throw new Error("No chapters from Quran.com");
  }

  const lines = [
    "export type SurahMeta = {",
    "  number: number;",
    "  name: string;",
    "  nameArabic: string;",
    "  revelation: \"Meccan\" | \"Medinan\";",
    "  ayahCount: number;",
    "};",
    "",
    "/** 114 Surahs — metadata from Quran.com chapters API (no invented fields). */",
    "export const SURAH_LIST: SurahMeta[] = [",
  ];

  for (const ch of chapters) {
    const revelation =
      String(ch.revelation_place || "").toLowerCase() === "madinah"
        ? "Medinan"
        : "Meccan";
    const name = String(ch.name_simple || "").replace(/"/g, '\\"');
    const nameArabic = String(ch.name_arabic || "").replace(/"/g, '\\"');
    lines.push(
      `  { number: ${ch.id}, name: "${name}", nameArabic: "${nameArabic}", revelation: "${revelation}", ayahCount: ${Number(ch.verses_count) || 0} },`,
    );
  }

  lines.push("];", "");
  fs.writeFileSync(META_OUT, lines.join("\n"));
  console.log(`Wrote ${chapters.length} surahs to src/data/surahMeta.ts`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await writeSurahMeta();

  for (let juz = 1; juz <= 30; juz += 1) {
    let attempts = 0;
    while (attempts < 4) {
      try {
        await enrichJuz(juz);
        break;
      } catch (err) {
        attempts += 1;
        console.log(
          `Para ${juz}: failed (${err.message}) — retry ${attempts}/4`,
        );
        await new Promise((r) => setTimeout(r, 2000 * attempts));
        if (attempts >= 4) throw err;
      }
    }
  }

  console.log("Done. arabicTajweed enriched; plain arabic unchanged.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
