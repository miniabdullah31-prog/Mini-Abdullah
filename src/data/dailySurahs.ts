export type DailySurahAyah = {
  number: number;
  globalId: number;
  arabic: string;
  translationEn: string;
  translationUr: string;
};

export type DailySurah = {
  id: number;
  number: number;
  name: string;
  nameArabic: string;
  nameUrdu: string;
  ayahCount: number;
  revelation: "Meccan" | "Medinan";
  theme: string;
  ayahs: DailySurahAyah[];
};

/** Short surahs for daily memorization (offline) */
export const DAILY_SURAHS: DailySurah[] = [
  {
    id: 1,
    number: 1,
    name: "Al-Fatihah",
    nameArabic: "الفاتحة",
    nameUrdu: "سورۃ الفاتحہ",
    ayahCount: 7,
    revelation: "Meccan",
    theme: "Opening — praise, guidance, and prayer",
    ayahs: [
      { number: 1, globalId: 1, arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translationEn: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", translationUr: "اللہ کے نام سے جو رحمان و رحیم ہے۔" },
      { number: 2, globalId: 2, arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ", translationEn: "All praise is for Allah, Lord of the worlds.", translationUr: "تمام تعریف اللہ کے لیے ہے جو تمام جہانوں کا رب ہے۔" },
      { number: 3, globalId: 3, arabic: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translationEn: "The Entirely Merciful, the Especially Merciful.", translationUr: "جو رحمان اور رحیم ہے۔" },
      { number: 4, globalId: 4, arabic: "مَـٰلِكِ يَوْمِ ٱلدِّينِ", translationEn: "Master of the Day of Judgment.", translationUr: "روزِ جزا کا مالک ہے۔" },
      { number: 5, globalId: 5, arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translationEn: "You alone we worship, and You alone we ask for help.", translationUr: "ہم صرف تیری عبادت کرتے ہیں اور تجھی سے مدد مانگتے ہیں۔" },
      { number: 6, globalId: 6, arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", translationEn: "Guide us to the straight path.", translationUr: "ہمیں سیدھا راستہ دکھا۔" },
      { number: 7, globalId: 7, arabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", translationEn: "The path of those You have blessed — not of those who earned anger, nor of those who went astray.", translationUr: "ان لوگوں کا راستہ جن پر تو نے انعام کیا، نہ کہ جن پر غضب ہوا، اور نہ گمراہوں کا۔" },
    ],
  },
  {
    id: 2,
    number: 112,
    name: "Al-Ikhlas",
    nameArabic: "الإخلاص",
    nameUrdu: "سورۃ الاخلاص",
    ayahCount: 4,
    revelation: "Meccan",
    theme: "Pure Oneness of Allah",
    ayahs: [
      { number: 1, globalId: 6222, arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", translationEn: "Say, He is Allah, the One.", translationUr: "کہو: وہ اللہ ایک ہے۔" },
      { number: 2, globalId: 6223, arabic: "ٱللَّهُ ٱلصَّمَدُ", translationEn: "Allah, the Eternal Refuge.", translationUr: "اللہ بے نیاز ہے۔" },
      { number: 3, globalId: 6224, arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translationEn: "He neither begets nor is born.", translationUr: "نہ اس کی کوئی اولاد ہے اور نہ وہ کسی کی اولاد۔" },
      { number: 4, globalId: 6225, arabic: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", translationEn: "And there is none comparable to Him.", translationUr: "اور اس کے برابر کوئی نہیں۔" },
    ],
  },
  {
    id: 3,
    number: 113,
    name: "Al-Falaq",
    nameArabic: "الفلق",
    nameUrdu: "سورۃ الفلق",
    ayahCount: 5,
    revelation: "Meccan",
    theme: "Protection from outer harms",
    ayahs: [
      { number: 1, globalId: 6226, arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", translationEn: "Say, I seek refuge in the Lord of daybreak.", translationUr: "کہو: میں صبح کے رب کی پناہ مانگتا ہوں۔" },
      { number: 2, globalId: 6227, arabic: "مِن شَرِّ مَا خَلَقَ", translationEn: "From the evil of what He created.", translationUr: "اس کی پیدا کردہ چیزوں کے شر سے۔" },
      { number: 3, globalId: 6228, arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", translationEn: "And from the evil of darkness when it settles.", translationUr: "اور رات کی تاریکی کے شر سے جب وہ چھا جائے۔" },
      { number: 4, globalId: 6229, arabic: "وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ", translationEn: "And from the evil of those who blow on knots.", translationUr: "اور گرہوں میں پھونکنے والیوں کے شر سے۔" },
      { number: 5, globalId: 6230, arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", translationEn: "And from the evil of an envier when he envies.", translationUr: "اور حسد کرنے والے کے شر سے جب وہ حسد کرے۔" },
    ],
  },
  {
    id: 4,
    number: 114,
    name: "An-Nas",
    nameArabic: "الناس",
    nameUrdu: "سورۃ الناس",
    ayahCount: 6,
    revelation: "Meccan",
    theme: "Protection from whispers",
    ayahs: [
      { number: 1, globalId: 6231, arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", translationEn: "Say, I seek refuge in the Lord of mankind.", translationUr: "کہو: میں لوگوں کے رب کی پناہ مانگتا ہوں۔" },
      { number: 2, globalId: 6232, arabic: "مَلِكِ ٱلنَّاسِ", translationEn: "The King of mankind.", translationUr: "لوگوں کے بادشاہ کی۔" },
      { number: 3, globalId: 6233, arabic: "إِلَـٰهِ ٱلنَّاسِ", translationEn: "The God of mankind.", translationUr: "لوگوں کے معبود کی۔" },
      { number: 4, globalId: 6234, arabic: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ", translationEn: "From the evil of the retreating whisperer.", translationUr: "وسوسہ ڈالنے والے کے شر سے جو پیچھے ہٹ جاتا ہے۔" },
      { number: 5, globalId: 6235, arabic: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ", translationEn: "Who whispers into the chests of mankind.", translationUr: "جو لوگوں کے سینوں میں وسوسے ڈالتا ہے۔" },
      { number: 6, globalId: 6236, arabic: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", translationEn: "From among the jinn and mankind.", translationUr: "جنوں میں سے ہو یا انسانوں میں سے۔" },
    ],
  },
  {
    id: 5,
    number: 108,
    name: "Al-Kawthar",
    nameArabic: "الكوثر",
    nameUrdu: "سورۃ الکوثر",
    ayahCount: 3,
    revelation: "Meccan",
    theme: "Allah’s abundant gift",
    ayahs: [
      { number: 1, globalId: 6205, arabic: "إِنَّآ أَعْطَيْنَـٰكَ ٱلْكَوْثَرَ", translationEn: "Indeed, We have granted you Al-Kawthar.", translationUr: "بیشک ہم نے تمہیں کوثر عطا کی۔" },
      { number: 2, globalId: 6206, arabic: "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ", translationEn: "So pray to your Lord and sacrifice.", translationUr: "پس اپنے رب کے لیے نماز پڑھو اور قربانی دو۔" },
      { number: 3, globalId: 6207, arabic: "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ", translationEn: "Indeed, your enemy is the one cut off.", translationUr: "بیشک تمہارا دشمن ہی بے نام و نشان ہے۔" },
    ],
  },
  {
    id: 6,
    number: 103,
    name: "Al-Asr",
    nameArabic: "العصر",
    nameUrdu: "سورۃ العصر",
    ayahCount: 3,
    revelation: "Meccan",
    theme: "Time, faith, and patience",
    ayahs: [
      { number: 1, globalId: 6177, arabic: "وَٱلْعَصْرِ", translationEn: "By time.", translationUr: "زمانے کی قسم۔" },
      { number: 2, globalId: 6178, arabic: "إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ", translationEn: "Indeed, mankind is in loss.", translationUr: "بیشک انسان نقصان میں ہے۔" },
      { number: 3, globalId: 6179, arabic: "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ", translationEn: "Except those who believe, do good, urge truth, and urge patience.", translationUr: "سوائے ان کے جو ایمان لائے، نیک عمل کیے، حق اور صبر کی وصیت کی۔" },
    ],
  },
  {
    id: 7,
    number: 110,
    name: "An-Nasr",
    nameArabic: "النصر",
    nameUrdu: "سورۃ النصر",
    ayahCount: 3,
    revelation: "Medinan",
    theme: "Victory and praise",
    ayahs: [
      { number: 1, globalId: 6214, arabic: "إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ", translationEn: "When the help of Allah and the victory come.", translationUr: "جب اللہ کی مدد اور فتح آ جائے۔" },
      { number: 2, globalId: 6215, arabic: "وَرَأَيْتَ ٱلنَّاسَ يَدْخُلُونَ فِى دِينِ ٱللَّهِ أَفْوَاجًا", translationEn: "And you see people entering Allah’s religion in crowds.", translationUr: "اور تم دیکھو لوگ فوج در فوج اللہ کے دین میں داخل ہو رہے ہیں۔" },
      { number: 3, globalId: 6216, arabic: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ ۚ إِنَّهُۥ كَانَ تَوَّابًۢا", translationEn: "Then glorify your Lord with praise and ask His forgiveness.", translationUr: "تو اپنے رب کی حمد کے ساتھ تسبیح کرو اور اس سے بخشش مانگو۔" },
    ],
  },
  {
    id: 8,
    number: 109,
    name: "Al-Kafirun",
    nameArabic: "الكافرون",
    nameUrdu: "سورۃ الکافرون",
    ayahCount: 6,
    revelation: "Meccan",
    theme: "Clear line between belief and disbelief",
    ayahs: [
      { number: 1, globalId: 6208, arabic: "قُلْ يَـٰٓأَيُّهَا ٱلْكَـٰفِرُونَ", translationEn: "Say, O disbelievers.", translationUr: "کہو: اے کافرو!" },
      { number: 2, globalId: 6209, arabic: "لَآ أَعْبُدُ مَا تَعْبُدُونَ", translationEn: "I do not worship what you worship.", translationUr: "میں ان کی عبادت نہیں کرتا جن کی تم عبادت کرتے ہو۔" },
      { number: 3, globalId: 6210, arabic: "وَلَآ أَنتُمْ عَـٰبِدُونَ مَآ أَعْبُدُ", translationEn: "Nor are you worshippers of what I worship.", translationUr: "اور نہ تم اس کی عبادت کرنے والے ہو جس کی میں عبادت کرتا ہوں۔" },
      { number: 4, globalId: 6211, arabic: "وَلَآ أَنَا۠ عَابِدٌۭ مَّا عَبَدتُّمْ", translationEn: "Nor will I worship what you worship.", translationUr: "اور نہ میں ان کی عبادت کروں گا جن کی تم نے عبادت کی۔" },
      { number: 5, globalId: 6212, arabic: "وَلَآ أَنتُمْ عَـٰبِدُونَ مَآ أَعْبُدُ", translationEn: "Nor will you worship what I worship.", translationUr: "اور نہ تم اس کی عبادت کرنے والے ہو جس کی میں عبادت کرتا ہوں۔" },
      { number: 6, globalId: 6213, arabic: "لَكُمْ دِينُكُمْ وَلِىَ دِينِ", translationEn: "For you is your religion, and for me is mine.", translationUr: "تمہارے لیے تمہارا دین اور میرے لیے میرا دین۔" },
    ],
  },
  {
    id: 9,
    number: 105,
    name: "Al-Fil",
    nameArabic: "الفيل",
    nameUrdu: "سورۃ الفیل",
    ayahCount: 5,
    revelation: "Meccan",
    theme: "Allah protected the Kaaba",
    ayahs: [
      { number: 1, globalId: 6189, arabic: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَـٰبِ ٱلْفِيلِ", translationEn: "Have you not seen how your Lord dealt with the companions of the elephant?", translationUr: "کیا تم نے نہیں دیکھا تمہارے رب نے ہاتھی والوں کے ساتھ کیا کیا؟" },
      { number: 2, globalId: 6190, arabic: "أَلَمْ يَجْعَلْ كَيْدَهُمْ فِى تَضْلِيلٍۢ", translationEn: "Did He not make their plot go astray?", translationUr: "کیا ان کی چال کو ناکام نہیں کر دیا؟" },
      { number: 3, globalId: 6191, arabic: "وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ", translationEn: "And He sent against them birds in flocks.", translationUr: "اور ان پر جھنڈ کے جھنڈ پرندے بھیجے۔" },
      { number: 4, globalId: 6192, arabic: "تَرْمِيهِم بِحِجَارَةٍۢ مِّن سِجِّيلٍۢ", translationEn: "Striking them with stones of baked clay.", translationUr: "جو ان پر پختہ مٹی کے پتھر پھینک رہے تھے۔" },
      { number: 5, globalId: 6193, arabic: "فَجَعَلَهُمْ كَعَصْفٍۢ مَّأْكُولٍۭ", translationEn: "And He made them like eaten straw.", translationUr: "پھر ان کو کھائے ہوئے بھوسے جیسا کر دیا۔" },
    ],
  },
  {
    id: 10,
    number: 106,
    name: "Quraysh",
    nameArabic: "قريش",
    nameUrdu: "سورۃ قریش",
    ayahCount: 4,
    revelation: "Meccan",
    theme: "Gratitude for safety and provision",
    ayahs: [
      { number: 1, globalId: 6194, arabic: "لِإِيلَـٰفِ قُرَيْشٍ", translationEn: "For the accustomed security of Quraysh.", translationUr: "قریش کے الفت کے سبب۔" },
      { number: 2, globalId: 6195, arabic: "إِۦلَـٰفِهِمْ رِحْلَةَ ٱلشِّتَآءِ وَٱلصَّيْفِ", translationEn: "Their journey of winter and summer.", translationUr: "ان کے سردی اور گرمی کے سفر کی الفت۔" },
      { number: 3, globalId: 6196, arabic: "فَلْيَعْبُدُوا۟ رَبَّ هَـٰذَا ٱلْبَيْتِ", translationEn: "So let them worship the Lord of this House.", translationUr: "پس وہ اس گھر کے رب کی عبادت کریں۔" },
      { number: 4, globalId: 6197, arabic: "ٱلَّذِىٓ أَطْعَمَهُم مِّن جُوعٍۢ وَءَامَنَهُم مِّنْ خَوْفٍۭ", translationEn: "Who fed them against hunger and secured them from fear.", translationUr: "جس نے انہیں بھوک سے کھانا دیا اور خوف سے امن بخشا۔" },
    ],
  },
];
