export type JuzMeta = {
  number: number;
  name: string;
  nameArabic: string;
  range: string;
};

/** 30 Paras (Juz) — static list for Read Quran hub */
export const JUZ_LIST: JuzMeta[] = [
  { number: 1, name: "Alif Lam Meem", nameArabic: "الم", range: "1:1 – 2:141" },
  { number: 2, name: "Sayaqool", nameArabic: "سيقول", range: "2:142 – 2:252" },
  { number: 3, name: "Tilkal Rusul", nameArabic: "تلك الرسل", range: "2:253 – 3:91" },
  // App Para grouping: 3:92 لن تنالوا starts Para 4 (ayah identity unchanged).
  { number: 4, name: "Lan Tana Loo", nameArabic: "لن تنالوا", range: "3:92 – 4:23" },
  { number: 5, name: "Wal Mohsanat", nameArabic: "والمحصنات", range: "4:24 – 4:147" },
  { number: 6, name: "La Yuhibbullah", nameArabic: "لا يحب الله", range: "4:148 – 5:81" },
  { number: 7, name: "Wa Iza Samiu", nameArabic: "وإذا سمعوا", range: "5:82 – 6:110" },
  { number: 8, name: "Wa Lau Annana", nameArabic: "ولو أننا", range: "6:111 – 7:87" },
  { number: 9, name: "Qalal Malao", nameArabic: "قال الملأ", range: "7:88 – 8:40" },
  { number: 10, name: "Wa A'lamu", nameArabic: "واعلموا", range: "8:41 – 9:92" },
  { number: 11, name: "Yatazeroon", nameArabic: "يعتذرون", range: "9:93 – 11:5" },
  { number: 12, name: "Wa Mamin Da'abat", nameArabic: "وما من دابة", range: "11:6 – 12:52" },
  { number: 13, name: "Wa Ma Ubrioo", nameArabic: "وما أبرئ", range: "12:53 – 14:52" },
  { number: 14, name: "Rubama", nameArabic: "ربما", range: "15:1 – 16:128" },
  { number: 15, name: "Subhanallazi", nameArabic: "سبحان الذي", range: "17:1 – 18:74" },
  { number: 16, name: "Qal Alam", nameArabic: "قال ألم", range: "18:75 – 20:135" },
  { number: 17, name: "Aqtarabo", nameArabic: "اقترب", range: "21:1 – 22:78" },
  { number: 18, name: "Qadd Aflaha", nameArabic: "قد أفلح", range: "23:1 – 25:20" },
  { number: 19, name: "Wa Qalallazina", nameArabic: "وقال الذين", range: "25:21 – 27:55" },
  { number: 20, name: "A'man Khalaq", nameArabic: "أمن خلق", range: "27:56 – 29:45" },
  { number: 21, name: "Utlu Ma Oohi", nameArabic: "اتل ما أوحي", range: "29:46 – 33:30" },
  { number: 22, name: "Wa Manyaqnut", nameArabic: "ومن يقنت", range: "33:31 – 36:27" },
  { number: 23, name: "Wa Mali", nameArabic: "وما لي", range: "36:28 – 39:31" },
  { number: 24, name: "Faman Azlam", nameArabic: "فمن أظلم", range: "39:32 – 41:46" },
  { number: 25, name: "Elahe Yuruddo", nameArabic: "إليه يرد", range: "41:47 – 45:37" },
  { number: 26, name: "Ha'a Meem", nameArabic: "حم", range: "46:1 – 51:30" },
  { number: 27, name: "Qala Fama Khatbukum", nameArabic: "قال فما خطبكم", range: "51:31 – 57:29" },
  { number: 28, name: "Qadd SamiAllah", nameArabic: "قد سمع الله", range: "58:1 – 66:12" },
  { number: 29, name: "Tabarakallazi", nameArabic: "تبارك الذي", range: "67:1 – 77:50" },
  { number: 30, name: "Amma Yatasa'aloon", nameArabic: "عم يتساءلون", range: "78:1 – 114:6" },
];

export const SUDAIS_AUDIO_BASE =
  "https://cdn.islamic.network/quran/audio/192/ar.sudais";

export function getSudaisAudioUrl(globalAyahNumber: number) {
  return `${SUDAIS_AUDIO_BASE}/${globalAyahNumber}.mp3`;
}
