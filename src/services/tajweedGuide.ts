/**
 * Child-friendly Tajweed legend — only classes used by the Quran WebView renderer.
 * Colors must stay in sync with TAJWEED_CLASS_COLORS.
 */
import { TAJWEED_CLASS_COLORS } from "./tajweedColors";

export type TajweedGuideLang = "ar" | "en" | "ur";

export type TajweedGuideRule = {
  id: string;
  color: string;
  /** Class names from arabicTajweed that map to this legend row */
  classes: string[];
  label: Record<TajweedGuideLang, string>;
  tip: Record<TajweedGuideLang, string>;
};

export const TAJWEED_GUIDE_RULES: TajweedGuideRule[] = [
  {
    id: "madd",
    color: TAJWEED_CLASS_COLORS.madda_normal,
    classes: [
      "madda_normal",
      "madda_permissible",
      "madda_necessary",
      "madda_obligatory",
      "madda_obligatory_monconnected",
      "madda_obligatory_mconnected",
    ],
    label: { en: "Madd", ur: "مد", ar: "مد" },
    tip: {
      en: "Stretch the sound for the required length.",
      ur: "آواز کو مقررہ لمبائی تک کھینچ کر پڑھو۔",
      ar: "مُدَّ الصَّوتَ بالمقدار المطلوب.",
    },
  },
  {
    id: "qalqalah",
    color: TAJWEED_CLASS_COLORS.qalaqah,
    classes: ["qalaqah", "qlq"],
    label: { en: "Qalqalah", ur: "قلقلہ", ar: "قلقلة" },
    tip: {
      en: "Make a light bouncing sound.",
      ur: "ہلکی سی اچھلتی آواز نکالو۔",
      ar: "أَخْرِجْ صَوتًا خَفيفًا مُتَقَلْقِلًا.",
    },
  },
  {
    id: "ghunnah",
    color: TAJWEED_CLASS_COLORS.ghunnah,
    classes: ["ghunnah"],
    label: { en: "Ghunnah", ur: "غنہ", ar: "غُنَّة" },
    tip: {
      en: "Read with a soft nasal sound.",
      ur: "نرم ناک کی آواز کے ساتھ پڑھو۔",
      ar: "اقْرَأْ بِصَوتٍ أَنْفِيٍّ خَفيف.",
    },
  },
  {
    id: "idgham",
    color: TAJWEED_CLASS_COLORS.idgham_ghunnah,
    classes: ["idgham_wo_ghunnah", "idgham_ghunnah", "idgham_shafawi"],
    label: { en: "Idgham", ur: "ادغام", ar: "إدغام" },
    tip: {
      en: "Merge the letters smoothly into the next sound.",
      ur: "حروف کو اگلی آواز میں نرمی سے ملاؤ۔",
      ar: "ادْمِجِ الحرفَ بِسلاسةٍ في ما بعده.",
    },
  },
  {
    id: "ikhafa",
    color: TAJWEED_CLASS_COLORS.ikhafa,
    classes: ["ikhafa", "ikhafa_shafawi"],
    label: { en: "Ikhfa", ur: "اخفا", ar: "إخفاء" },
    tip: {
      en: "Hide the noon sound gently, then continue.",
      ur: "نون کی آواز کو ہلکا چھپا کر آگے پڑھو۔",
      ar: "أَخْفِ صوتَ النونِ بِرِفقٍ ثمَّ تابِع.",
    },
  },
  {
    id: "iqlab",
    color: TAJWEED_CLASS_COLORS.iqlab,
    classes: ["iqlab"],
    label: { en: "Iqlab", ur: "اقلاب", ar: "إقلاب" },
    tip: {
      en: "Change the noon into a soft meem sound.",
      ur: "نون کو نرم میم کی آواز میں بدل دو۔",
      ar: "حَوِّلِ النونَ إلى صوتِ ميمٍ خفيف.",
    },
  },
  {
    id: "silent",
    color: TAJWEED_CLASS_COLORS.ham_wasl,
    classes: ["ham_wasl", "laam_shamsiyah", "slnt"],
    label: { en: "Silent", ur: "خاموش حرف", ar: "حرف صامت" },
    tip: {
      en: "See the letter, but do not pronounce it.",
      ur: "حرف دیکھو، مگر پڑھو نہیں۔",
      ar: "انْظُرِ الحرفَ ولا تَنْطِقْ به.",
    },
  },
];
