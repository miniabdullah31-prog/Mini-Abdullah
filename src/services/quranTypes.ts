export type TranslationLang = "off" | "en" | "ur";

export type QuranAyah = {
  id: number;
  verseKey: string;
  surah: number;
  ayahNumber: number;
  arabic: string;
  /** Quran.com text_uthmani_tajweed HTML markup (optional). */
  arabicTajweed?: string;
  translationEn: string;
  translationUr: string;
  audioUrl: string;
  /** True when this ayah ends a Mushaf Ruku (ع marker). */
  endsRuku?: boolean;
};
