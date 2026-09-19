/**
 * Duas data
 *
 * HOW TO ADD YOUR RECORDED AUDIO:
 * 1. Put .mp3 in:  src/assets/duas/
 *    e.g. morning.mp3 , sleep.mp3
 * 2. Set on the dua item:
 *    audio: require("../assets/duas/morning.mp3"),
 *
 * HOW TO ADD AI VIDEO LESSONS:
 * Prefer backend media (not the RN bundle):
 * 1. Put .mp4 in: backend/media/public/duas/
 * 2. Seed it in backend/services/mediaService.js (category: "duas")
 * 3. Set on the dua item:
 *    video: "/media/duas/sleeping-dua.mp4",
 * Bundled require() still works for older local files.
 *
 * Leave audio/video null until you attach your files.
 * (Quran Sudais + other screens keep TTS — only Duas use your files.)
 */

export type DuaItem = {
  id: number;
  title: string;
  titleUrdu: string;
  arabic: string;
  translation: string;
  translationUrdu: string;
  tafseerEng: string;
  tafseerUrdu: string;
  caption: string;
  /** Your recorded dua audio — require("../assets/duas/file.mp3") or null */
  audio: number | null;
  /** Bundled require() number, or backend `/media/...` path */
  video: number | string | null;
  icon: "sunny" | "moon" | "restaurant" | "airplane" | "people" | "school" | "walk" | "home" | "heart" | "shield-checkmark";
  colors: [string, string];
};

export const DUAS: DuaItem[] = [
  {
    id: 1,
    title: "Morning Dua",
    titleUrdu: "صبح کی دعا",
    arabic: "أَصْـبَحْنا وَأَصْـبَحَ المـلْكُ لله",
    translation:
      "We have entered a new morning and with it all dominion belongs to Allah.",
    translationUrdu: "ہم نے صبح کی اور صبح کے وقت سارا ملک اللہ ہی کا ہے۔",
    tafseerEng:
      "This dua starts the day by affirming that all ownership belongs to Allah, seeking His protection for the whole day.",
    tafseerUrdu:
      "یہ دعا دن کا آغاز اللہ کی حاکمیت کے اقرار کے ساتھ کرتی ہے تاکہ سارا دن حفاظت میں گزرے۔",
    caption: "Morning remembrance · start your day with Allah",
    audio: null, // require("../assets/duas/morning.mp3"),
    video: "/media/duas/morning-dua.mp4",
    icon: "sunny",
    colors: ["#1F8A70", "#3CB89A"],
  },
  {
    id: 2,
    title: "Sleeping Dua",
    titleUrdu: "سونے کی دعا",
    arabic: "اللّهُـمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
    translation: "O Allah, in Your name I die and I live.",
    translationUrdu:
      "اے اللہ! میں تیرے ہی نام کے ساتھ مرتا ہوں اور جیتا ہوں۔",
    tafseerEng:
      "Sleep is a minor death; this dua surrenders the soul to Allah before resting.",
    tafseerUrdu:
      "نیند کو چھوٹی موت کہا گیا ہے؛ اس دعا سے سوتے وقت روح اللہ کے سپرد ہوتی ہے۔",
    caption: "Before sleep · entrust yourself to Allah",
    audio: null, // require("../assets/duas/sleep.mp3"),
    video: "/media/duas/sleeping-dua.mp4",
    icon: "moon",
    colors: ["#2E6BFF", "#5AA0FF"],
  },
  {
    id: 3,
    title: "Eating Dua",
    titleUrdu: "کھانے کی دعا",
    arabic: "بِسْمِ اللهِ وَعَلَى بَرَكَةِ الله",
    translation: "In the name of Allah and with Allah’s blessings.",
    translationUrdu:
      "اللہ کے نام کے ساتھ اور اللہ کی برکت پر (ہم نے کھانا شروع کیا)۔",
    tafseerEng:
      "Saying Allah’s name over food brings barakah and keeps Shaytan away from the meal.",
    tafseerUrdu:
      "کھانے پر اللہ کا نام لینے سے برکت آتی ہے اور شیطان اس رزق میں شریک نہیں ہوتا۔",
    caption: "Before eating · begin with Bismillah",
    audio: null, // require("../assets/duas/eating.mp3"),
    video: null,
    icon: "restaurant",
    colors: ["#C45C2A", "#E08A4F"],
  },
  {
    id: 4,
    title: "Travel Dua",
    titleUrdu: "سفر کی دعا",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
    translation:
      "Glory is to the One who made this journey easy for us, as we could not do it ourselves.",
    translationUrdu:
      "پاک ہے وہ ذات جس نے اس سواری کو ہمارے قابو میں کر دیا جبکہ ہم اسے قابو میں کرنے والے نہ تھے۔",
    tafseerEng:
      "A dua of gratitude for safe travel, reminding us that ease on the road is from Allah.",
    tafseerUrdu:
      "سفر پر اللہ کا شکر اور حفاظت مانگنے کی مسنون دعا ہے۔",
    caption: "When starting a journey · ask for safety",
    audio: null, // require("../assets/duas/travel.mp3"),
    video: null,
    icon: "airplane",
    colors: ["#0F9B8E", "#34D1BF"],
  },
  {
    id: 5,
    title: "Parents Dua",
    titleUrdu: "والدین کی دعا",
    arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    translation:
      "My Lord, have mercy upon my parents as they raised me when I was young.",
    translationUrdu:
      "اے میرے رب! ان دونوں (والدین) پر رحم فرما جیسا کہ انہوں نے بچپن میں مجھے پالا۔",
    tafseerEng:
      "A Quranic dua asking mercy, health, and forgiveness for our parents.",
    tafseerUrdu:
      "قرآن کی یہ دعا والدین پر رحمت اور حسنِ سلوک سکھاتی ہے۔",
    caption: "For parents · mercy and gratitude",
    audio: null, // require("../assets/duas/parents.mp3"),
    video: "/media/duas/dua-for-parents.mp4?v=h264",
    icon: "people",
    colors: ["#7B2FF7", "#5B33C4"],
  },
  {
    id: 6,
    title: "Before Study",
    titleUrdu: "پڑھائی سے پہلے",
    arabic: "رَّبِّ زِدْنِي عِلْمًا",
    translation: "My Lord, increase me in knowledge.",
    translationUrdu: "اے میرے رب! میرے علم میں اضافہ فرما۔",
    tafseerEng:
      "A short Quranic prayer asking for useful and pure knowledge.",
    tafseerUrdu:
      "علمِ نافع، تیز حافظہ اور پڑھائی میں آسانی کے لیے مفید قرآنی دعا۔",
    caption: "Before studying · ask for useful knowledge",
    audio: null, // require("../assets/duas/study.mp3"),
    video: null,
    icon: "school",
    colors: ["#B06AB3", "#7B3FA0"],
  },
  {
    id: 7,
    title: "Leaving Home",
    titleUrdu: "گھر سے نکلتے وقت",
    arabic: "بِسْمِ اللهِ تَوَكَّلْتُ عَلَى اللهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ",
    translation:
      "In the name of Allah, I place my trust in Allah, and there is no power except with Allah.",
    translationUrdu:
      "اللہ کے نام کے ساتھ، میں نے اللہ پر توکل کیا، اور طاقت صرف اللہ ہی کی طرف سے ہے۔",
    tafseerEng:
      "Leaving home with this dua brings guidance, sufficiency, and protection.",
    tafseerUrdu:
      "گھر سے نکلتے وقت یہ دعا شیطان کے شر سے حفاظت دلاتی ہے۔",
    caption: "Leaving home · trust in Allah",
    audio: null, // require("../assets/duas/leaving-home.mp3"),
    video: null,
    icon: "walk",
    colors: ["#1F8A70", "#3CB89A"],
  },
  {
    id: 8,
    title: "Entering Home",
    titleUrdu: "گھر میں داخل ہوتے وقت",
    arabic: "اللّهُـمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ",
    translation: "O Allah, I ask You for the best entrance and the best exit.",
    translationUrdu:
      "اے اللہ! میں تجھ سے داخل ہونے کی اور نکلنے کی بھلائی مانگتا ہوں۔",
    tafseerEng:
      "Entering with remembrance of Allah brings peace to the home.",
    tafseerUrdu:
      "گھر میں داخل ہوتے وقت برکت اور سلامتی کے لیے مسنون دعا۔",
    caption: "Entering home · ask for blessing",
    audio: null, // require("../assets/duas/entering-home.mp3"),
    video: null,
    icon: "home",
    colors: ["#2E6BFF", "#5AA0FF"],
  },
  {
    id: 9,
    title: "Forgiveness",
    titleUrdu: "معافی کی دعا",
    arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    translation:
      "Our Lord, forgive me and my parents and the believers the Day the account is established.",
    translationUrdu:
      "اے ہمارے رب! مجھے، میرے والدین کو اور سب ایمان والوں کو حساب کے دن معاف فرما۔",
    tafseerEng:
      "A comprehensive Quranic prayer of Prophet Ibrahim (AS) for forgiveness on Judgment Day.",
    tafseerUrdu:
      "حضرت ابراہیم علیہ السلام کی دعا اپنی، والدین اور امت کی مغفرت کے لیے۔",
    caption: "Seek forgiveness · for yourself and others",
    audio: null, // require("../assets/duas/forgiveness.mp3"),
    video: null,
    icon: "heart",
    colors: ["#C45C2A", "#E08A4F"],
  },
  {
    id: 10,
    title: "Protection",
    titleUrdu: "حفاظت کی دعا",
    arabic:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    translation:
      "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing.",
    translationUrdu:
      "اللہ کے نام کے ساتھ، جس کے نام سے زمین و آسمان میں کوئی چیز نقصان نہیں پہنچا سکتی، اور وہ سننے والا جاننے والا ہے۔",
    tafseerEng:
      "Reciting this morning and evening forms a shield from sudden harm and illness.",
    tafseerUrdu:
      "صبح و شام پڑھنے سے ناگہانی آفت اور بیماری سے اللہ کی پناہ ملتی ہے۔",
    caption: "Morning & evening · divine protection",
    audio: null, // require("../assets/duas/protection.mp3"),
    video: null,
    icon: "shield-checkmark",
    colors: ["#7B2FF7", "#5B33C4"],
  },
];
