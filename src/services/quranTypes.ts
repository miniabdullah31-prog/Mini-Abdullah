export type TranslationLang = "off" | "en" | "ur";

export type QuranAyah = {
  id: number;
  verseKey: string;
  surah: number;
  ayahNumber: number;
  arabic: string;
  translationEn: string;
  translationUr: string;
  audioUrl: string;
};
