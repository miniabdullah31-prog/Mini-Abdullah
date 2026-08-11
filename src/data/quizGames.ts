/** Islamic Quiz games data — kid-friendly vocabulary */

export type QuizLang = "ar" | "ur" | "en";

export type WordTriple = {
  ar: string;
  ur: string;
  en: string;
};

/**
 * Word Search — short undiacritized forms (grid-friendly).
 * Urdu meanings kept clearly different from Arabic spelling.
 */
export const WORD_SEARCH_L1: WordTriple[] = [
  { ar: "نور", ur: "روشنی", en: "LIGHT" },
  { ar: "حب", ur: "محبت", en: "LOVE" },
  { ar: "خير", ur: "بھلائی", en: "GOOD" },
  { ar: "قلب", ur: "دل", en: "HEART" },
  { ar: "بيت", ur: "گھر", en: "HOME" },
  { ar: "ماء", ur: "پانی", en: "WATER" },
  { ar: "قمر", ur: "چاند", en: "MOON" },
  { ar: "شمس", ur: "سورج", en: "SUN" },
  { ar: "كتاب", ur: "کتاب", en: "BOOK" },
  { ar: "دعاء", ur: "دعا", en: "PRAYER" },
  { ar: "أمل", ur: "امید", en: "HOPE" },
  { ar: "جنة", ur: "جنت", en: "JANNAH" },
  { ar: "علم", ur: "جانکاری", en: "KNOW" },
  { ar: "حق", ur: "سچائی", en: "TRUTH" },
  { ar: "دين", ur: "مذہب", en: "FAITH" },
  { ar: "سلام", ur: "امن", en: "PEACE" },
  { ar: "صبر", ur: "تحمل", en: "PATIENT" },
  { ar: "شكر", ur: "احسان", en: "THANKS" },
  { ar: "ايمان", ur: "یقین", en: "IMAN" },
  { ar: "الله", ur: "اللہ", en: "ALLAH" },
];

export const WORD_SEARCH_L2: WordTriple[] = [
  { ar: "رحمة", ur: "مہربانی", en: "MERCY" },
  { ar: "بركة", ur: "خیر و برکت", en: "BARAKAH" },
  { ar: "صدق", ur: "سچ بولنا", en: "HONEST" },
  { ar: "امانة", ur: "دیانت", en: "TRUST" },
  { ar: "توبة", ur: "معافی مانگنا", en: "TAWBAH" },
  { ar: "عبادة", ur: "بندگی", en: "IBADAH" },
  { ar: "زكاة", ur: "خیرات", en: "ZAKAH" },
  { ar: "صلاة", ur: "نماز", en: "SALAH" },
  { ar: "نبي", ur: "پیغمبر", en: "NABI" },
  { ar: "رسول", ur: "پیغامبر", en: "RASOOL" },
  { ar: "مسجد", ur: "عبادت گاہ", en: "MASJID" },
  { ar: "حسن", ur: "اچھا کام", en: "KIND" },
  { ar: "عفو", ur: "معافی", en: "FORGIVE" },
  { ar: "فوز", ur: "کامیابی", en: "SUCCESS" },
  { ar: "تقوى", ur: "پرہیزگاری", en: "TAQWA" },
  { ar: "قرآن", ur: "قرآن مجید", en: "QURAN" },
  { ar: "مسلم", ur: "مسلمان", en: "MUSLIM" },
  { ar: "حلال", ur: "جائز چیز", en: "HALAL" },
  { ar: "رضا", ur: "خوشنودی", en: "RIDHA" },
  { ar: "امل", ur: "آس", en: "HOPE" },
];

/**
 * Match + Pick Meaning — Arabic WITH tashkeel (زبر زیر پیش),
 * Urdu clearly different from Arabic spelling.
 */
export const MATCH_L1: WordTriple[] = [
  { ar: "نُورٌ", ur: "روشنی", en: "LIGHT" },
  { ar: "حُبٌّ", ur: "محبت", en: "LOVE" },
  { ar: "خَيْرٌ", ur: "بھلائی", en: "GOOD" },
  { ar: "قَلْبٌ", ur: "دل", en: "HEART" },
  { ar: "بَيْتٌ", ur: "گھر", en: "HOME" },
  { ar: "مَاءٌ", ur: "پانی", en: "WATER" },
  { ar: "قَمَرٌ", ur: "چاند", en: "MOON" },
  { ar: "شَمْسٌ", ur: "سورج", en: "SUN" },
  { ar: "كِتَابٌ", ur: "کتاب", en: "BOOK" },
  { ar: "دُعَاءٌ", ur: "دعا", en: "PRAYER" },
  { ar: "أَمَلٌ", ur: "امید", en: "HOPE" },
  { ar: "جَنَّةٌ", ur: "جنت", en: "JANNAH" },
  { ar: "عِلْمٌ", ur: "جانکاری", en: "KNOW" },
  { ar: "حَقٌّ", ur: "سچائی", en: "TRUTH" },
  { ar: "دِينٌ", ur: "مذہب", en: "FAITH" },
  { ar: "سَلَامٌ", ur: "امن", en: "PEACE" },
  { ar: "صَبْرٌ", ur: "تحمل", en: "PATIENT" },
  { ar: "شُكْرٌ", ur: "احسان منانا", en: "THANKS" },
  { ar: "إِيمَانٌ", ur: "یقین", en: "IMAN" },
  { ar: "اللَّهُ", ur: "اللہ", en: "ALLAH" },
];

export const MATCH_L2: WordTriple[] = [
  { ar: "رَحْمَةٌ", ur: "مہربانی", en: "MERCY" },
  { ar: "بَرَكَةٌ", ur: "خیر و برکت", en: "BARAKAH" },
  { ar: "صِدْقٌ", ur: "سچ بولنا", en: "HONEST" },
  { ar: "أَمَانَةٌ", ur: "دیانت", en: "TRUST" },
  { ar: "تَوْبَةٌ", ur: "معافی مانگنا", en: "TAWBAH" },
  { ar: "عِبَادَةٌ", ur: "بندگی", en: "IBADAH" },
  { ar: "زَكَاةٌ", ur: "خیرات", en: "ZAKAH" },
  { ar: "صَلَاةٌ", ur: "نماز", en: "SALAH" },
  { ar: "نَبِيٌّ", ur: "پیغمبر", en: "NABI" },
  { ar: "رَسُولٌ", ur: "پیغامبر", en: "RASOOL" },
  { ar: "مَسْجِدٌ", ur: "عبادت گاہ", en: "MASJID" },
  { ar: "حُسْنٌ", ur: "اچھا کام", en: "KIND" },
  { ar: "عَفْوٌ", ur: "معافی", en: "FORGIVE" },
  { ar: "فَوْزٌ", ur: "کامیابی", en: "SUCCESS" },
  { ar: "تَقْوَى", ur: "پرہیزگاری", en: "TAQWA" },
  { ar: "قُرْآنٌ", ur: "قرآن مجید", en: "QURAN" },
  { ar: "مُسْلِمٌ", ur: "مسلمان", en: "MUSLIM" },
  { ar: "حَلَالٌ", ur: "جائز چیز", en: "HALAL" },
  { ar: "رِضَا", ur: "خوشنودی", en: "RIDHA" },
  { ar: "أَمَلٌ", ur: "آس", en: "HOPE" },
];

export const MEANING_L1: WordTriple[] = MATCH_L1;
export const MEANING_L2: WordTriple[] = MATCH_L2;

export const WORDS_PER_ROUND = 5;
export const ROUNDS_BEFORE_REPEAT = 4;
export const MAX_WRONG_ATTEMPTS = 5;
export const GRID_SIZE = 8;

export function pickRoundWords(
  pool: WordTriple[],
  playCount: number,
): WordTriple[] {
  const setIndex = playCount % ROUNDS_BEFORE_REPEAT;
  const start = setIndex * WORDS_PER_ROUND;
  return pool.slice(start, start + WORDS_PER_ROUND);
}

export function wordForLang(w: WordTriple, lang: QuizLang): string {
  if (lang === "ar") return w.ar;
  if (lang === "ur") return w.ur;
  return w.en.toUpperCase();
}

/** UI copy — simple for kids */
export const QUIZ_UI: Record<
  QuizLang,
  {
    findWords: string;
    level: string;
    attemptsLeft: string;
    levelCleared: string;
    tryAgainTitle: string;
    tryAgainMsg: string;
    nextLevel: string;
    cancel: string;
    back: string;
    tryAgain: string;
    starsHint: string;
    matchHint: string;
    meaningHint: string;
    bothDone: string;
    playLevel: string;
    wordSearch: string;
    matchGame: string;
    meaningGame: string;
    wordSearchSub: string;
    matchSub: string;
    meaningSub: string;
  }
> = {
  en: {
    findWords: "Find these words",
    level: "Level",
    attemptsLeft: "Tries left",
    levelCleared: "Level Cleared!",
    tryAgainTitle: "Out of tries",
    tryAgainMsg: "You used 5 wrong tries. Try again?",
    nextLevel: "Next Level",
    cancel: "Cancel",
    back: "Back",
    tryAgain: "Try Again",
    starsHint: "Your stars",
    matchHint: "Match Arabic with the meaning",
    meaningHint: "Tap the correct meaning",
    bothDone: "Both levels done! Great job!",
    playLevel: "Play",
    wordSearch: "Word Search",
    matchGame: "Match Meaning",
    meaningGame: "Pick Meaning",
    wordSearchSub: "Find hidden words in the grid",
    matchSub: "Join Arabic with Urdu or English",
    meaningSub: "Choose the right meaning",
  },
  ur: {
    findWords: "یہ الفاظ تلاش کرو",
    level: "لیول",
    attemptsLeft: "باقی کوششیں",
    levelCleared: "لیول مکمل!",
    tryAgainTitle: "کوششیں ختم",
    tryAgainMsg: "۵ غلط کوششیں ہو گئیں۔ دوبارہ؟",
    nextLevel: "اگلا لیول",
    cancel: "منسوخ",
    back: "واپس",
    tryAgain: "دوبارہ کھیلو",
    starsHint: "تمہارے ستارے",
    matchHint: "عربی کا مطلب جوڑو",
    meaningHint: "صحیح مطلب چنو",
    bothDone: "دونوں لیول مکمل! شاباش!",
    playLevel: "کھیلو",
    wordSearch: "الفاظ تلاش",
    matchGame: "مطلوب جوڑو",
    meaningGame: "مطلب چنو",
    wordSearchSub: "گرڈ میں چھپے الفاظ ڈھونڈو",
    matchSub: "عربی کو اردو یا انگریزی سے جوڑو",
    meaningSub: "درست مطلب منتخب کرو",
  },
  ar: {
    findWords: "ابحث عن هذه الكلمات",
    level: "المستوى",
    attemptsLeft: "محاولات متبقية",
    levelCleared: "تم المستوى!",
    tryAgainTitle: "انتهت المحاولات",
    tryAgainMsg: "٥ محاولات خاطئة. حاول مرة أخرى؟",
    nextLevel: "المستوى التالي",
    cancel: "إلغاء",
    back: "رجوع",
    tryAgain: "أعد المحاولة",
    starsHint: "نجومك",
    matchHint: "اربط العربية بالمعنى",
    meaningHint: "اختر المعنى الصحيح",
    bothDone: "المستويان انتهيا! أحسنت!",
    playLevel: "العب",
    wordSearch: "بحث الكلمات",
    matchGame: "طابق المعنى",
    meaningGame: "اختر المعنى",
    wordSearchSub: "ابحث عن الكلمات المخفية",
    matchSub: "اربط العربية بأردو أو إنجليزي",
    meaningSub: "اختر المعنى الصحيح",
  },
};

const AR_FILL = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split("");
const UR_FILL = "ابپتٹثجچحخدڈذرڑزژسشصضطظعغفقکگلمنںوهھءیے".split("");
const EN_FILL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function fillerAlphabet(lang: QuizLang): string[] {
  if (lang === "ar") return AR_FILL;
  if (lang === "ur") return UR_FILL;
  return EN_FILL;
}

export function starsFromWrongAttempts(wrong: number): number {
  return Math.max(1, Math.min(5, 5 - wrong));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
