export type DailySunnah = {
  id: number;
  title: string;
  titleUrdu: string;
  arabic?: string;
  meaningEn: string;
  meaningUrdu: string;
  howEn: string;
  howUrdu: string;
  prophetEn: string;
  prophetUrdu: string;
  benefitEn: string;
  benefitUrdu: string;
  tipEn: string;
  tipUrdu: string;
  colors: [string, string];
};

/** Max 7 daily sunnah cards for kids */
export const DAILY_SUNNAHS: DailySunnah[] = [
  {
    id: 1,
    title: "Say Salam",
    titleUrdu: "سلام کہنا",
    arabic: "السَّلَامُ عَلَيْكُمْ",
    meaningEn:
      "Salam means peace. We greet others with Assalamu Alaikum to spread love and kindness.",
    meaningUrdu:
      "سلام کا مطلب امن ہے۔ ہم دوسروں کو السلام علیکم کہہ کر محبت اور خوشی بانٹتے ہیں۔",
    howEn:
      "1) Softly smile when you meet someone.\n2) Say Assalamu Alaikum clearly.\n3) Wait for their reply with a kind heart.",
    howUrdu:
      "1) ملاقات پر نرمی سے مسکراؤ۔\n2) واضح طور پر السلام علیکم کہو۔\n3) محبت سے جواب کا انتظار کرو۔",
    prophetEn:
      "Our beloved Prophet ﷺ greeted people with Salam wherever he went.\nHe taught that the best among us are those who begin with Salam.",
    prophetUrdu:
      "ہمارے پیارے نبی ﷺ جہاں جاتے، سلام سے ہی ملاقات شروع فرماتے۔\nآپ ﷺ نے سکھایا کہ بہترین وہ ہیں جو پہلے سلام کہیں۔",
    benefitEn: "Salam opens hearts, removes distance, and fills homes with peace.",
    benefitUrdu: "سلام دلوں کو جوڑتا ہے، دوری کم کرتا ہے اور گھر میں سکون لاتا ہے۔",
    tipEn: "Say Salam when entering home, class, or meeting friends.",
    tipUrdu: "گھر، کلاس یا دوستوں سے ملاقات پر بھی سلام کہو۔",
    colors: ["#1F8A70", "#3CB89A"],
  },
  {
    id: 2,
    title: "Smile Softly",
    titleUrdu: "مسکراہٹ",
    meaningEn:
      "A gentle smile is charity. It costs nothing, yet it can light up someone’s whole day.",
    meaningUrdu:
      "نرم مسکراہٹ بھی صدقہ ہے۔ اس میں کچھ خرچ نہیں، مگر کسی کا دن روشن کر سکتی ہے۔",
    howEn:
      "1) Keep your face soft and calm.\n2) Smile when you greet family and friends.\n3) Speak kindly with a warm look.",
    howUrdu:
      "1) چہرہ نرم اور پرسکون رکھو۔\n2) گھر والوں اور دوستوں سے مسکرا کر ملو۔\n3) اچھی بات نرم انداز سے کرو۔",
    prophetEn:
      "Our Prophet ﷺ often spoke with a soft smile on his blessed face.\nPeople felt peace just by looking at him — his smile was mercy.",
    prophetUrdu:
      "ہمارے نبی ﷺ اکثر مسکرا کر بات فرماتے تھے۔\nلوگ صرف آپ ﷺ کا چہرہ دیکھ کر سکون پاتے — آپ کی مسکراہٹ رحمت تھی۔",
    benefitEn: "Smiling softens hearts and follows the beautiful Sunnah of kindness.",
    benefitUrdu: "مسکراہٹ دل نرم کرتی ہے اور نبی ﷺ کی مہربانی والی سنت ہے۔",
    tipEn: "Even a small smile for your mother or sibling is precious.",
    tipUrdu: "ماں یا بہن بھائی کے لیے چھوٹی سی مسکراہٹ بھی بہت قیمتی ہے۔",
    colors: ["#2E6BFF", "#5AA0FF"],
  },
  {
    id: 3,
    title: "Bismillah Before Eating",
    titleUrdu: "کھانے سے پہلے بسم اللہ",
    arabic: "بِسْمِ اللَّهِ",
    meaningEn:
      "Before every bite, we begin with Allah’s name so our food becomes blessed.",
    meaningUrdu:
      "ہر نوالے سے پہلے اللہ کا نام لیتے ہیں تاکہ کھانے میں برکت آئے۔",
    howEn:
      "1) Sit properly and calmly.\n2) Say Bismillah before the first bite.\n3) Eat with the right hand and without waste.",
    howUrdu:
      "1) ٹھیک سے اور سکون سے بیٹھو۔\n2) پہلے نوالے سے پہلے بسم اللہ کہو۔\n3) دائیں ہاتھ سے کھاؤ اور ضائع نہ کرو۔",
    prophetEn:
      "The Prophet ﷺ never began a meal without remembering Allah.\nHe taught us: say Bismillah, eat with the right hand, and from what is near.",
    prophetUrdu:
      "نبی ﷺ کھانا اللہ کا نام لیے بغیر شروع نہیں فرماتے تھے۔\nآپ ﷺ نے سکھایا: بسم اللہ کہو، دائیں ہاتھ سے کھاؤ، اور قریب سے لو۔",
    benefitEn: "Remembering Allah brings barakah and gratitude to every meal.",
    benefitUrdu: "اللہ کا ذکر کھانے میں برکت اور شکر کا احساس پیدا کرتا ہے۔",
    tipEn: "If you forget at the start, say Bismillah when you remember.",
    tipUrdu: "اگر شروع میں بھول جاؤ تو جب یاد آئے بسم اللہ کہہ لو۔",
    colors: ["#C45C2A", "#E08A4F"],
  },
  {
    id: 4,
    title: "Help Parents",
    titleUrdu: "والدین کی مدد",
    meaningEn:
      "Serving parents with love is one of the greatest ways to please Allah.",
    meaningUrdu:
      "والدین کی محبت بھری خدمت اللہ کو راضی کرنے کے بہترین طریقوں میں سے ہے۔",
    howEn:
      "1) Ask gently: How can I help?\n2) Do one small chore without being told.\n3) Speak softly and never raise your voice.",
    howUrdu:
      "1) نرمی سے پوچھو: میں کیا مدد کروں؟\n2) بغیر کہے ایک چھوٹا کام خود کرو۔\n3) نرم لہجے میں بات کرو، آواز نہ اٹھاؤ۔",
    prophetEn:
      "The Prophet ﷺ taught that Paradise lies beneath the feet of mothers.\nHe honored parents deeply and guided us to serve them with gentleness.",
    prophetUrdu:
      "نبی ﷺ نے فرمایا: جنت ماؤں کے قدموں کے نیچے ہے۔\nآپ ﷺ والدین کا بہت احترام کرتے اور نرمی سے خدمت سکھاتے۔",
    benefitEn: "Allah loves the child who is kind, helpful, and soft with parents.",
    benefitUrdu: "اللہ اس بچے کو پسند فرماتا ہے جو والدین کے ساتھ نرم اور مددگار ہو۔",
    tipEn: "Bringing water, folding clothes, or a kind word — all count.",
    tipUrdu: "پانی لانا، کپڑے فولڈ کرنا، یا ایک پیاری بات — سب نیکی ہے۔",
    colors: ["#7B2FF7", "#5B33C4"],
  },
  {
    id: 5,
    title: "Sleep the Sunnah Way",
    titleUrdu: "سونے کی سنت",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    meaningEn:
      "We sleep with remembrance of Allah, so the night becomes peaceful and blessed.",
    meaningUrdu:
      "ہم اللہ کا ذکر کرتے ہوئے سوتے ہیں تاکہ رات سکون اور برکت والی بنے۔",
    howEn:
      "1) Dust the bed lightly with your hand.\n2) Lie on your right side.\n3) Recite a short sleep dua before closing your eyes.",
    howUrdu:
      "1) ہاتھ سے بستر ہلکا صاف کرو۔\n2) دائیں پہلو پر لیٹو۔\n3) آنکھیں بند کرنے سے پہلے مختصر دعا پڑھو۔",
    prophetEn:
      "Our Prophet ﷺ would dust his bed and sleep on his right side.\nHe ended the day with dua — placing his night in Allah’s care.",
    prophetUrdu:
      "ہمارے نبی ﷺ بستر صاف کر کے دائیں پہلو پر سوتے تھے۔\nآپ ﷺ دن کا اختتام دعا سے کرتے — رات اللہ کی حفاظت میں۔",
    benefitEn: "Sleeping with dua brings calm, safety, and sweet rest.",
    benefitUrdu: "دعا کے ساتھ سونے سے سکون، حفاظت اور میٹھی نیند ملتی ہے۔",
    tipEn: "Keep the phone away and sleep with a peaceful heart.",
    tipUrdu: "فون دور رکھو اور پرسکون دل سے سوؤ۔",
    colors: ["#0F9B8E", "#34D1BF"],
  },
  {
    id: 6,
    title: "Say Alhamdulillah",
    titleUrdu: "الحمدللہ کہنا",
    arabic: "الْحَمْدُ لِلَّهِ",
    meaningEn:
      "Alhamdulillah means all praise belongs to Allah. We thank Him for every blessing.",
    meaningUrdu:
      "الحمدللہ کا مطلب ہے تمام تعریفیں اللہ کے لیے ہیں۔ ہر نعمت پر شکر ادا کرتے ہیں۔",
    howEn:
      "1) When happy, say Alhamdulillah.\n2) After eating or drinking, thank Allah.\n3) Share this habit with siblings and friends.",
    howUrdu:
      "1) خوشی میں الحمدللہ کہو۔\n2) کھانے پینے کے بعد شکر کرو۔\n3) بہن بھائیوں اور دوستوں کو بھی سکھاؤ۔",
    prophetEn:
      "The Prophet ﷺ praised Allah in ease and in difficulty.\nHis heart stayed grateful — and he taught us that gratitude invites more blessings.",
    prophetUrdu:
      "نبی ﷺ آسانی اور مشکل دونوں میں اللہ کی تعریف فرماتے۔\nآپ ﷺ کا دل شکر گزار رہتا — اور سکھایا کہ شکر سے نعمتیں بڑھتی ہیں۔",
    benefitEn: "A thankful heart stays happy, humble, and close to Allah.",
    benefitUrdu: "شکر گزار دل خوش، عاجز اور اللہ کے قریب رہتا ہے۔",
    tipEn: "Say Alhamdulillah for small joys too — a meal, a smile, a new day.",
    tipUrdu: "چھوٹی خوشیوں پر بھی الحمدللہ کہو — کھانا، مسکراہٹ، نیا دن۔",
    colors: ["#B06AB3", "#7B3FA0"],
  },
  {
    id: 7,
    title: "Keep Clean (Taharah)",
    titleUrdu: "صفائی رکھنا",
    meaningEn:
      "Cleanliness is part of faith. A clean body, clothes, and place please Allah.",
    meaningUrdu:
      "صفائی ایمان کا حصہ ہے۔ صاف جسم، کپڑے اور جگہ اللہ کو پسند ہیں۔",
    howEn:
      "1) Wash hands before and after meals.\n2) Keep clothes neat and fresh.\n3) Tidy your study corner every day.",
    howUrdu:
      "1) کھانے سے پہلے اور بعد ہاتھ دھوؤ۔\n2) کپڑے صاف اور درست رکھو۔\n3) روزانہ پڑھائی کی جگہ سجاؤ۔",
    prophetEn:
      "The Prophet ﷺ loved cleanliness and kept himself beautifully pure.\nHe used the miswak, cared for his clothes, and taught that purity is beloved to Allah.",
    prophetUrdu:
      "نبی ﷺ صفائی سے بہت محبت رکھتے اور خود بھی خوب صاف رہتے۔\nآپ ﷺ مسواک کرتے، کپڑوں کا خیال رکھتے، اور سکھاتے کہ پاکیزگی اللہ کو پیاری ہے۔",
    benefitEn: "Being clean feels fresh, healthy, and close to the Sunnah.",
    benefitUrdu: "صفائی سے تازگی، صحت اور سنت کی قربت ملتی ہے۔",
    tipEn: "Brush / clean your mouth regularly — a sweet Sunnah habit.",
    tipUrdu: "منہ کی صفائی باقاعدہ رکھو — یہ پیاری سنت ہے۔",
    colors: ["#2E6BFF", "#0F9B8E"],
  },
];
