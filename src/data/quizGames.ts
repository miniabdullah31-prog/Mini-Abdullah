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

export type TrueFalseItem = {
  statement: string;
  answer: boolean;
};

export const TRUE_FALSE_L1: TrueFalseItem[] = [
  { statement: "Muslims pray Salah five times every day.", answer: true },
  { statement: "We do wudu with milk instead of water.", answer: false },
  { statement: "Ramadan is the month of fasting.", answer: true },
  { statement: "It is okay to skip wudu before Salah.", answer: false },
  { statement: "The Quran was revealed to Prophet Muhammad (PBUH).", answer: true },
  { statement: "Zakah means stealing from the poor.", answer: false },
  { statement: "Masjid is a place for worship.", answer: true },
  { statement: "We can eat pork in Islam.", answer: false },
  { statement: "We say Bismillah before eating.", answer: true },
  { statement: "Allah has 99 beautiful names.", answer: true },
  { statement: "Fasting in Ramadan is only at night.", answer: false },
  { statement: "Hajj is a pillar of Islam.", answer: true },
  { statement: "We can lie if we are joking.", answer: false },
  { statement: "Wudu is done before Salah.", answer: true },
  { statement: "Salah is only on Fridays.", answer: false },
  { statement: "Islam teaches us to be kind to parents.", answer: true },
  { statement: "Muslims worship many gods.", answer: false },
  { statement: "Prophet Muhammad (PBUH) was the last prophet.", answer: true },
  { statement: "We should waste food according to Islam.", answer: false },
  { statement: "Helping neighbours is a good deed.", answer: true },
  { statement: "Backbiting is allowed in Islam.", answer: false },
  { statement: "Eid is a celebration for Muslims.", answer: true },
  { statement: "We wash our feet in the last step of wudu.", answer: true },
  { statement: "Playing with water is the same as wudu.", answer: false },
];

export const TRUE_FALSE_L2: TrueFalseItem[] = [
  { statement: "Shahada is declaring faith in one Allah.", answer: true },
  { statement: "Tahajjud is a night prayer.", answer: true },
  { statement: "We start wudu by washing our feet first.", answer: false },
  { statement: "Halal means allowed in Islam.", answer: true },
  { statement: "Haram means forbidden in Islam.", answer: true },
  { statement: "Interest (Riba) is allowed in Islam.", answer: false },
  { statement: "Sunnah means the way of the Prophet (PBUH).", answer: true },
  { statement: "Alcohol is halal for Muslims.", answer: false },
  { statement: "Angels record our good and bad deeds.", answer: true },
  { statement: "We can pray without cleaning ourselves.", answer: false },
  { statement: "Jannah is paradise in the Hereafter.", answer: true },
  { statement: "Ghusl is full body purification.", answer: true },
  { statement: "Stealing is okay if you are poor.", answer: false },
  { statement: "Tayammum can be used when water is not available.", answer: true },
  { statement: "We pray only when we feel like it.", answer: false },
  { statement: "Dua means calling upon Allah.", answer: true },
  { statement: "Masah means wiping the head in wudu.", answer: true },
  { statement: "We should mock people who make mistakes.", answer: false },
  { statement: "The Kaaba is in Makkah.", answer: true },
  { statement: "Charity (Sadaqah) brings reward.", answer: true },
  { statement: "Wudu breaks if you sleep deeply.", answer: true },
  { statement: "Patience (Sabr) is loved by Allah.", answer: true },
  { statement: "You never rinse your mouth in wudu.", answer: false },
  { statement: "Islam teaches cleanliness.", answer: true },
];

export const WORDS_PER_ROUND = 5;
export const ROUNDS_BEFORE_REPEAT = 4;
export const MAX_WRONG_ATTEMPTS = 5;
export const GRID_SIZE = 8;

export function pickRoundItems<T>(pool: T[], playCount: number): T[] {
  const setIndex = playCount % ROUNDS_BEFORE_REPEAT;
  const start = setIndex * WORDS_PER_ROUND;
  return pool.slice(start, start + WORDS_PER_ROUND);
}

export function pickRoundWords(
  pool: WordTriple[],
  playCount: number,
): WordTriple[] {
  return pickRoundItems(pool, playCount);
}

/** Har round mein true + false mix — pehle 5 sirf true na aayein */
export function pickTrueFalseRound(
  pool: TrueFalseItem[],
  playCount: number,
): TrueFalseItem[] {
  const trues = pool.filter((i) => i.answer);
  const falses = pool.filter((i) => !i.answer);
  const falseCount = Math.min(2, falses.length);
  const trueCount = WORDS_PER_ROUND - falseCount;

  const pickFrom = <T>(arr: T[], start: number, count: number): T[] => {
    const out: T[] = [];
    for (let i = 0; i < count; i += 1) {
      out.push(arr[(start + i) % arr.length]);
    }
    return out;
  };

  const tStart = (playCount * trueCount) % Math.max(trues.length, 1);
  const fStart = (playCount * falseCount) % Math.max(falses.length, 1);

  return shuffle([
    ...pickFrom(trues, tStart, trueCount),
    ...pickFrom(falses, fStart, falseCount),
  ]);
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
