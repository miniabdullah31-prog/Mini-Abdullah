import { getSudaisAudioUrl, JUZ_LIST } from "../data/juzMeta";
import type { QuranAyah } from "./quranTypes";

export type { QuranAyah, TranslationLang } from "./quranTypes";

const RUKU_ENDS: Set<string> = new Set(
  require("../data/quran/rukuEnds.json") as string[],
);

const JUZ_LOADERS: Record<number, () => unknown> = {
  1: () => require("../data/quran/juz-1.json"),
  2: () => require("../data/quran/juz-2.json"),
  3: () => require("../data/quran/juz-3.json"),
  4: () => require("../data/quran/juz-4.json"),
  5: () => require("../data/quran/juz-5.json"),
  6: () => require("../data/quran/juz-6.json"),
  7: () => require("../data/quran/juz-7.json"),
  8: () => require("../data/quran/juz-8.json"),
  9: () => require("../data/quran/juz-9.json"),
  10: () => require("../data/quran/juz-10.json"),
  11: () => require("../data/quran/juz-11.json"),
  12: () => require("../data/quran/juz-12.json"),
  13: () => require("../data/quran/juz-13.json"),
  14: () => require("../data/quran/juz-14.json"),
  15: () => require("../data/quran/juz-15.json"),
  16: () => require("../data/quran/juz-16.json"),
  17: () => require("../data/quran/juz-17.json"),
  18: () => require("../data/quran/juz-18.json"),
  19: () => require("../data/quran/juz-19.json"),
  20: () => require("../data/quran/juz-20.json"),
  21: () => require("../data/quran/juz-21.json"),
  22: () => require("../data/quran/juz-22.json"),
  23: () => require("../data/quran/juz-23.json"),
  24: () => require("../data/quran/juz-24.json"),
  25: () => require("../data/quran/juz-25.json"),
  26: () => require("../data/quran/juz-26.json"),
  27: () => require("../data/quran/juz-27.json"),
  28: () => require("../data/quran/juz-28.json"),
  29: () => require("../data/quran/juz-29.json"),
  30: () => require("../data/quran/juz-30.json"),
};

function normalizeAyahs(raw: unknown): QuranAyah[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { default?: unknown })?.default)
      ? ((raw as { default: unknown[] }).default as unknown[])
      : [];

  return list.map((item: any) => {
    const id = Number(item?.id) || 0;
    const verseKey = String(item?.verseKey || "");
    return {
      id,
      verseKey,
      surah: Number(item?.surah) || 0,
      ayahNumber: Number(item?.ayahNumber) || 0,
      arabic: String(item?.arabic || ""),
      arabicTajweed: item?.arabicTajweed
        ? String(item.arabicTajweed)
        : undefined,
      translationEn: String(item?.translationEn || ""),
      translationUr: String(item?.translationUr || ""),
      audioUrl: String(item?.audioUrl || (id ? getSudaisAudioUrl(id) : "")),
      endsRuku: RUKU_ENDS.has(verseKey),
    };
  });
}

/** Load a para (juz) from bundled offline JSON. */
export async function getJuzAyahs(juzNumber: number): Promise<QuranAyah[]> {
  const loader = JUZ_LOADERS[juzNumber];
  if (!loader) {
    throw new Error("Invalid para number.");
  }
  try {
    const ayahs = normalizeAyahs(loader());
    if (!ayahs.length) {
      throw new Error("This para has no ayahs yet.");
    }
    return ayahs;
  } catch (e: any) {
    throw new Error(e?.message || "Could not load this para.");
  }
}

/** Which paras may contain a given surah (from JUZ_LIST ranges). */
function juzNumbersForSurah(surahNumber: number): number[] {
  const matches: number[] = [];
  for (const juz of JUZ_LIST) {
    const m = String(juz.range).match(
      /(\d+)\s*:\s*\d+\s*[–-]\s*(\d+)\s*:\s*\d+/,
    );
    if (!m) continue;
    const startSurah = Number(m[1]);
    const endSurah = Number(m[2]);
    if (surahNumber >= startSurah && surahNumber <= endSurah) {
      matches.push(juz.number);
    }
  }
  if (matches.length) return matches;
  return Array.from({ length: 30 }, (_, i) => i + 1);
}

/** Load all ayahs for a surah from bundled juz JSON (plain arabic unchanged). */
export async function getSurahAyahs(surahNumber: number): Promise<QuranAyah[]> {
  if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
    throw new Error("Invalid surah number.");
  }
  try {
    const juzNums = juzNumbersForSurah(surahNumber);
    const collected: QuranAyah[] = [];
    for (const juz of juzNums) {
      const ayahs = await getJuzAyahs(juz);
      for (const a of ayahs) {
        if (a.surah === surahNumber) collected.push(a);
      }
    }
    collected.sort((a, b) => a.ayahNumber - b.ayahNumber);
    if (!collected.length) {
      throw new Error("This surah has no ayahs yet.");
    }
    return collected;
  } catch (e: any) {
    throw new Error(e?.message || "Could not load this surah.");
  }
}
