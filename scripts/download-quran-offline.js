/**
 * One-time script: downloads all 30 Juz (Arabic + EN + UR + Tajweed) into src/data/quran/
 * Run: node scripts/download-quran-offline.js
 *
 * Arabic plain text: text_uthmani → `arabic`
 * Tajweed markup: text_uthmani_tajweed → `arabicTajweed` (Quran.com HTML tags)
 * To add Tajweed to existing files without re-downloading all text:
 *   node scripts/enrich-quran-tajweed.js
 */
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const OUT_DIR = path.join(__dirname, "..", "src", "data", "quran");
const QURAN_API = "https://api.quran.com/api/v4";
const TRANSLATION_EN = 20;
const TRANSLATION_UR = 97;

function cleanTranslation(text) {
  return (text || "")
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#?\w+;/g, " ")
    .replace(/(\S)\s*\d{1,2}(?=\s*[۔.!?,،]|$)/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function mapVerse(verse) {
  const translations = Array.isArray(verse.translations) ? verse.translations : [];
  const en =
    translations.find((t) => t.resource_id === TRANSLATION_EN)?.text || "";
  const ur =
    translations.find((t) => t.resource_id === TRANSLATION_UR)?.text || "";
  const [surahStr, ayahStr] = String(verse.verse_key || "0:0").split(":");

  return {
    id: verse.id,
    verseKey: verse.verse_key,
    surah: Number(surahStr) || 0,
    ayahNumber: Number(ayahStr) || verse.verse_number || 0,
    arabic: verse.text_uthmani || "",
    arabicTajweed: verse.text_uthmani_tajweed || "",
    translationEn: cleanTranslation(en),
    translationUr: cleanTranslation(ur),
  };
}

async function fetchJuzPage(juzNumber, page) {
  const response = await axios.get(`${QURAN_API}/verses/by_juz/${juzNumber}`, {
    timeout: 60000,
    params: {
      translations: `${TRANSLATION_EN},${TRANSLATION_UR}`,
      fields: "text_uthmani,text_uthmani_tajweed",
      per_page: 50,
      page,
    },
  });
  return response.data;
}

async function fetchJuz(juzNumber) {
  const first = await fetchJuzPage(juzNumber, 1);
  const totalPages = first?.pagination?.total_pages || 1;
  const verses = [...(first?.verses || [])];

  for (let page = 2; page <= totalPages; page += 1) {
    process.stdout.write(`  page ${page}/${totalPages}\r`);
    const next = await fetchJuzPage(juzNumber, page);
    verses.push(...(next?.verses || []));
    await new Promise((r) => setTimeout(r, 200));
  }

  return verses.map(mapVerse);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (let juz = 1; juz <= 30; juz += 1) {
    const outFile = path.join(OUT_DIR, `juz-${juz}.json`);
    if (fs.existsSync(outFile)) {
      const existing = JSON.parse(fs.readFileSync(outFile, "utf8"));
      if (Array.isArray(existing) && existing.length > 0) {
        console.log(`Para ${juz}: already exists (${existing.length} ayahs) — skip`);
        continue;
      }
    }

    console.log(`Para ${juz}: downloading...`);
    let attempts = 0;
    while (attempts < 4) {
      try {
        const ayahs = await fetchJuz(juz);
        fs.writeFileSync(outFile, JSON.stringify(ayahs));
        console.log(`Para ${juz}: saved ${ayahs.length} ayahs`);
        break;
      } catch (err) {
        attempts += 1;
        console.log(
          `Para ${juz}: failed (${err.message}) — retry ${attempts}/4`,
        );
        await new Promise((r) => setTimeout(r, 2000 * attempts));
        if (attempts >= 4) {
          throw err;
        }
      }
    }
  }

  console.log("Done. Offline Quran data ready in src/data/quran/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
