export type TajweedRule = {
  id: number;
  title: string;
  titleUrdu: string;
  summary: string;
  summaryUrdu: string;
  points: string[];
  example: string;
  exampleNote: string;
};

/** Core Tajweed rules — easy English / Urdu headings */
export const TAJWEED_RULES: TajweedRule[] = [
  {
    id: 1,
    title: "Start of Recitation",
    titleUrdu: "تلاوت کی ابتدا",
    summary:
      "Before reading Quran, seek Allah’s protection, then begin with His name.",
    summaryUrdu:
      "قرآن پڑھنے سے پہلے اللہ کی پناہ مانگیں، پھر اللہ کے نام سے شروع کریں۔",
    points: [
      "Say: أعوذ بالله من الشيطان الرجيم",
      "Then: بسم الله الرحمن الرحيم",
      "Start every new surah with Basmalah (except At-Tawbah).",
    ],
    example: "أَعُوذُ بِاللَّهِ ... بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    exampleNote: "Said before starting Quran recitation.",
  },
  {
    id: 2,
    title: "Letter Sounds",
    titleUrdu: "حروف کی آواز",
    summary: "Each Arabic letter comes from a clear place in the mouth or throat.",
    summaryUrdu: "ہر عربی حرف منہ یا حلق کے مخصوص مقام سے نکلتا ہے۔",
    points: [
      "Throat letters: ء ه ع ح غ خ",
      "Tongue letters: ق ك ج ش ي ض ل ن ر ط د ت ص ز س ظ ذ ث",
      "Lips: ف ب م و",
      "Nose helps م and ن (ghunnah).",
    ],
    example: "ق ≠ ك   ·   س ≠ ص   ·   ت ≠ ط",
    exampleNote: "Similar letters must stay distinct.",
  },
  {
    id: 3,
    title: "Noon Rules",
    titleUrdu: "نون کے قواعد",
    summary: "Four easy rules when Noon has sukoon, or a word ends with tanween.",
    summaryUrdu: "جب نون ساکن ہو یا تنوین ہو تو چار آسان قواعد۔",
    points: [
      "Izhar — say Noon clearly before throat letters",
      "Idgham — merge into ي ر م ل و ن",
      "Iqlab — Noon becomes Meem sound before ب",
      "Ikhfa — hide Noon lightly before remaining letters",
    ],
    example: "مِنْ خَوْفٍ  ·  مِنْ رَبِّهِمْ  ·  مِنْ بَعْدِ  ·  مِنْ شَرِّ",
    exampleNote: "Listen for clear vs merged vs hidden Noon.",
  },
  {
    id: 4,
    title: "Meem Rules",
    titleUrdu: "میم کے قواعد",
    summary: "Rules for Meem with sukoon before the next letter.",
    summaryUrdu: "میم پر سکون ہونے پر اگلے حرف کے لحاظ سے قواعد۔",
    points: [
      "Idgham Shafawi — م + م (with nasal sound)",
      "Ikhfa Shafawi — م + ب (light hide + nasal)",
      "Izhar Shafawi — م before all other letters (clear)",
    ],
    example: "لَهُمْ مَا  ·  تَرْمِيهِمْ بِحِجَارَةٍ  ·  عَلَيْهِمْ",
    exampleNote: "Keep lips correct and nasal sound clean.",
  },
  {
    id: 5,
    title: "Nasal Sound",
    titleUrdu: "غُنّہ",
    summary: "A soft nose sound held for about 2 counts on ن and م.",
    summaryUrdu: "نون اور میم پر ناک کی ہلکی آواز تقریباً دو حرکت۔",
    points: [
      "Needed in Idgham with ghunnah and Ikhfa",
      "Also on mushaddad نّ and مّ",
      "Not too long, not too short",
    ],
    example: "إِنَّ  ·  ثُمَّ  ·  مِنْ يَشَاءُ",
    exampleNote: "Feel a light vibration in the nose.",
  },
  {
    id: 6,
    title: "Echo Letters",
    titleUrdu: "قلقلہ",
    summary: "A small bounce on ق ط ب ج د when they have sukoon or at a stop.",
    summaryUrdu: "ق ط ب ج د پر سکون یا وقف میں ہلکی گونج۔",
    points: [
      "Letters: ق ط ب ج د",
      "Stronger when you stop on the letter",
      "Keep the bounce soft — not exaggerated",
    ],
    example: "قُلْ أَعُوذُ  ·  وَتَبَّ",
    exampleNote: "Especially clear at the end of an ayah.",
  },
  {
    id: 7,
    title: "Stretching (Madd)",
    titleUrdu: "مد",
    summary: "Stretch vowels for a set number of counts.",
    summaryUrdu: "حروفِ مد کو مقررہ مقدار تک کھینچنا۔",
    points: [
      "Natural Madd — usually 2 counts",
      "Madd Lazim — longest, often 6 counts",
      "Connected / separate hamzah stretch also exists",
    ],
    example: "الرَّحْمَٰنِ  ·  الضَّالِّينَ",
    exampleNote: "Keep the count steady.",
  },
  {
    id: 8,
    title: "Heavy & Light",
    titleUrdu: "بھاری و ہلکا",
    summary: "Some letters are full (heavy), others stay light.",
    summaryUrdu: "کچھ حروف بھاری اور کچھ ہلکے پڑھے جاتے ہیں۔",
    points: [
      "Always heavy: خ ص ض غ ط ق ظ",
      "ر and ل can be heavy or light by rule",
      "Other letters stay light",
    ],
    example: "اللَّه  ·  رَحِيم  ·  قَالَ",
    exampleNote: "Heavy letters feel fuller in the mouth.",
  },
  {
    id: 9,
    title: "Where to Stop",
    titleUrdu: "وقف",
    summary: "Stop at correct places so the meaning stays clear.",
    summaryUrdu: "صحیح جگہ وقف کریں تاکہ معنی خراب نہ ہو۔",
    points: [
      "Prefer stopping at the end of an ayah",
      "Avoid stopping where meaning breaks",
      "When restarting, begin from a sensible phrase",
    ],
    example: "Stop at ۝ (ayah end) when possible",
    exampleNote: "Meaning first — beauty second.",
  },
  {
    id: 10,
    title: "Lam in Allah",
    titleUrdu: "لفظ اللہ کا لام",
    summary: "In Allah, Lam is heavy or light by the vowel before it.",
    summaryUrdu: "لفظ اللہ میں لام پہلے حرف کی حرکت کے مطابق بھاری یا ہلکا۔",
    points: [
      "After Fatha or Damma → heavy Allah",
      "After Kasra → light Allah",
      "Practice: قالَ الله / بِسمِ الله",
    ],
    example: "قَالَ اللَّهُ  ·  بِسْمِ اللَّهِ",
    exampleNote: "Listen for fullness vs lightness on Lam.",
  },
];
