import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  TextInput,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";
import LinearGradient from "react-native-linear-gradient";
import BackButton from "./BackButton";
import GradCardDecor from "./GradCardDecor";
import SmoothPressable from "./SmoothPressable";
import { speakArabicFemale, stopSpeaking } from "../services/quranTts";
import { useFeatureBackHandler } from "../hooks/useFeatureBackHandler";

type Props = {
  goBack: () => void;
};

/** Rotating gradients — same language as Duas / Quran / Daily Sunnah cards */
const NAME_CARD_COLORS: [string, string][] = [
  ["#2E6BFF", "#5AA0FF"],
  ["#7B2FF7", "#5B33C4"],
  ["#C45C2A", "#E08A4F"],
  ["#1F8A70", "#3CB89A"],
  ["#D94F8B", "#F07AB0"],
  ["#0F9B8E", "#34D1BF"],
  ["#C9A227", "#E8C547"],
];

const NamesOfAllahScreen: React.FC<Props> = ({ goBack }) => {
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState<any>(null);

  useFeatureBackHandler(
    useCallback(() => {
      if (selectedName) {
        stopSpeaking();
        setSelectedName(null);
        return true;
      }
      return false;
    }, [selectedName]),
    [selectedName],
  );

  const allahNames = [
    {
      id: 1,
      english: "Ar-Rahman",
      arabic: "ٱلرَّحْمَـٰنُ",
      meaning: "The Most Merciful",
      tafseerEng: "Allah showers His mercy upon all creation.",
      tafseerUrdu: "اللہ اپنی رحمت تمام مخلوق پر نازل فرماتا ہے۔",
    },
    {
      id: 2,
      english: "Ar-Raheem",
      arabic: "ٱلرَّحِيمُ",
      meaning: "The Especially Merciful",
      tafseerEng: "Allah gives special mercy to believers.",
      tafseerUrdu: "اللہ مومنوں پر خاص رحمت فرماتا ہے۔",
    },
    {
      id: 3,
      english: "Al-Malik",
      arabic: "ٱلْمَلِكُ",
      meaning: "The Absolute Ruler",
      tafseerEng: "Allah is the true King and Sovereign of everything.",
      tafseerUrdu: "اللہ پوری کائنات کا حقیقی بادشاہ ہے۔",
    },
    {
      id: 4,
      english: "Al-Quddus",
      arabic: "ٱلْقُدُّوسُ",
      meaning: "The Pure / Holy",
      tafseerEng: "Allah is absolutely free from all imperfections and faults.",
      tafseerUrdu: "اللہ ہر قسم کے عیب اور نقص سے پاک ہے۔",
    },
    {
      id: 5,
      english: "As-Salam",
      arabic: "ٱلسَّلَامُ",
      meaning: "The Source of Peace",
      tafseerEng: "Allah is the One who grants peace, safety, and security.",
      tafseerUrdu: "اللہ سلامتی اور امن عطا فرمانے والا ہے۔",
    },
    {
      id: 6,
      english: "Al-Mu'min",
      arabic: "ٱلْمُؤْمِنُ",
      meaning: "The Giver of Faith / Safety",
      tafseerEng: "Allah guarantees safety and protects His believers.",
      tafseerUrdu: "اللہ اپنے بندوں کو امن اور ایمان دینے والا ہے۔",
    },
    {
      id: 7,
      english: "Al-Muhaymin",
      arabic: "ٱلْمُهَيْمِنُ",
      meaning: "The Guardian / Overseer",
      tafseerEng: "Allah watches over and protects all of His creation.",
      tafseerUrdu: "اللہ سب کا نگہبان اور حفاظت کرنے والا ہے۔",
    },
    {
      id: 8,
      english: "Al-Aziz",
      arabic: "ٱلْعَزِيزُ",
      meaning: "The All-Mighty",
      tafseerEng: "Allah is the Defeater who is never defeated.",
      tafseerUrdu: "اللہ سب پر غالب ہے اور بہت عزت والا ہے۔",
    },
    {
      id: 9,
      english: "Al-Jabbar",
      arabic: "ٱلْجَبَّارُ",
      meaning: "The Compeller / Restorer",
      tafseerEng: "Allah fixes our broken affairs and enforces His will.",
      tafseerUrdu: "اللہ بگڑے ہوئے کاموں کو سنوارنے والا اور زبردست ہے۔",
    },
    {
      id: 10,
      english: "Al-Mutakabbir",
      arabic: "ٱلْمُتَكَبِّرُ",
      meaning: "The Supreme / Majestic",
      tafseerEng: "Allah is the One who reveals His greatness in all things.",
      tafseerUrdu: "اللہ سب سے بڑا ہے اور بڑائی اسی کے لیے ہے۔",
    },
    {
      id: 11,
      english: "Al-Khaliq",
      arabic: "ٱلْخَالِقُ",
      meaning: "The Creator",
      tafseerEng: "Allah created everything from nothingness.",
      tafseerUrdu: "اللہ پیدا کرنے والا اور وجود میں لانے والا ہے۔",
    },
    {
      id: 12,
      english: "Al-Bari",
      arabic: "ٱلْبَارِئُ",
      meaning: "The Originator",
      tafseerEng: "Allah shapes and creates without any model.",
      tafseerUrdu: "اللہ ٹھیک ٹھیک بنانے والا اور ایجاد کرنے wala ہے۔",
    },
    {
      id: 13,
      english: "Al-Musawwir",
      arabic: "ٱلْمُصَوِّرُ",
      meaning: "The Fashioner",
      tafseerEng: "Allah designs and gives distinct forms to all creation.",
      tafseerUrdu: "اللہ صورتیں بنانے والا اور شکلیں دینے والا ہے۔",
    },
    {
      id: 14,
      english: "Al-Ghaffar",
      arabic: "ٱلْغَفَّارُ",
      meaning: "The All-Forgiving",
      tafseerEng: "Allah repeatedly forgives the sins of His servants.",
      tafseerUrdu: "اللہ گناہوں کو بار بار معاف کرنے والا ہے۔",
    },
    {
      id: 15,
      english: "Al-Qahhar",
      arabic: "ٱلْقَهَّارُ",
      meaning: "The Subduer",
      tafseerEng: "Allah has perfect control over everything, nothing can resist Him.",
      tafseerUrdu: "اللہ سب پر کامل کنٹرول رکھنے والا اور غالب ہے۔",
    },
    {
      id: 16,
      english: "Al-Wahhab",
      arabic: "ٱلْوَهَّابُ",
      meaning: "The Supreme Bestower",
      tafseerEng: "Allah continuously gives without waiting for anything in return.",
      tafseerUrdu: "اللہ بغیر کسی عوض کے بہت کچھ عطا کرنے والا ہے۔",
    },
    {
      id: 17,
      english: "Ar-Razzaq",
      arabic: "ٱلرَّزَّاقُ",
      meaning: "The Provider",
      tafseerEng: "Allah provides sustenance to all alive creatures.",
      tafseerUrdu: "اللہ تمام مخلوقات کو رزق دینے والا ہے۔",
    },
    {
      id: 18,
      english: "Al-Fattah",
      arabic: "ٱلْفَتَّاحُ",
      meaning: "The Opener / Judge",
      tafseerEng: "Allah opens closed doors of mercy, success, and knowledge.",
      tafseerUrdu: "اللہ بند راستوں کو کھولنے والا اور فیصلہ کرنے والا ہے۔",
    },
    {
      id: 19,
      english: "Al-Alim",
      arabic: "ٱلْعَلِيمُ",
      meaning: "The All-Knowing",
      tafseerEng: "Allah knows everything, open or hidden, past, present, and future.",
      tafseerUrdu: "اللہ سب کچھ جاننے والا ہے، کچھ بھی اس سے چھپا نہیں۔",
    },
    {
      id: 20,
      english: "Al-Qabid",
      arabic: "ٱلْقَابِضُ",
      meaning: "The Withholder / Restrainer",
      tafseerEng: "Allah straightens or withholds sustenance according to His wisdom.",
      tafseerUrdu: "اللہ اپنی حکمت سے رزق اور روحوں کو قبض کرنے والا ہے۔",
    },
    {
      id: 21,
      english: "Al-Basit",
      arabic: "ٱلْبَاسِطُ",
      meaning: "The Extender / Expander",
      tafseerEng: "Allah expands resources, provisions, and joy for whom He wills.",
      tafseerUrdu: "اللہ اپنی رحمت سے رزق اور نعمتیں کشادہ کرنے والا ہے۔",
    },
    {
      id: 22,
      english: "Al-Khafid",
      arabic: "ٱلْخَافِضُ",
      meaning: "The Abaser / Demoter",
      tafseerEng: "Allah decreases the status of tyrants and the arrogant.",
      tafseerUrdu: "اللہ سرکشوں اور متکبرین کو نیچا دکھانے والا ہے۔",
    },
    {
      id: 23,
      english: "Ar-Rafi",
      arabic: "ٱلرَّافِعُ",
      meaning: "The Exalter / Elevator",
      tafseerEng: "Allah elevates the ranks of the righteous and believers.",
      tafseerUrdu: "اللہ ایمان والوں اور نیک لوگوں کے درجے بلند کرنے والا ہے۔",
    },
    {
      id: 24,
      english: "Al-Mu'izz",
      arabic: "ٱلْمُعِزُّ",
      meaning: "The Giver of Honor",
      tafseerEng: "Allah grants true respect and honor to whomever He pleases.",
      tafseerUrdu: "اللہ جسے چاہے عزت اور مرتبہ دینے والا ہے۔",
    },
    {
      id: 25,
      english: "Al-Mudhill",
      arabic: "ٱلْمُذِلُّ",
      meaning: "The Giver of Dishonor",
      tafseerEng: "Allah disgraces those who disobey Him and do injustice.",
      tafseerUrdu: "اللہ ظالموں اور نافرمانوں کو ذلیل و رسوا کرنے والا ہے۔",
    },
    {
      id: 26,
      english: "As-Sami",
      arabic: "ٱلسَّمِيعُ",
      meaning: "The All-Hearing",
      tafseerEng: "Allah hears every whisper, thought, and prayer instantly.",
      tafseerUrdu: "اللہ ہر پکار، سرگوشی اور دل کی بات سننے والا ہے۔",
    },
    {
      id: 27,
      english: "Al-Basir",
      arabic: "ٱلْبَصِيرُ",
      meaning: "The All-Seeing",
      tafseerEng: "Allah sees all things clearly, even the darkest secrets.",
      tafseerUrdu: "اللہ کائنات کی ہر چھوٹی بڑی چیز کو دیکھنے والا ہے۔",
    },
    {
      id: 28,
      english: "Al-Hakam",
      arabic: "ٱلْحَكَمُ",
      meaning: "The Supreme Judge",
      tafseerEng: "Allah delivers flawless justice and makes ultimate rulings.",
      tafseerUrdu: "اللہ بہترین فیصلہ کرنے والا اور عادل حاکم ہے۔",
    },
    {
      id: 29,
      english: "Al-Adl",
      arabic: "ٱلْعَدْلُ",
      meaning: "The Utterly Just",
      tafseerEng: "Allah acts with perfect fairness, free from any bias.",
      tafseerUrdu: "اللہ سراپا انصاف ہے اور اس کا ہر کام عدل پر مبنی ہے۔",
    },
    {
      id: 30,
      english: "Al-Latif",
      arabic: "ٱلَّطِيفُ",
      meaning: "The Subtle / Kind",
      tafseerEng: "Allah knows fine details and treats His creation with extreme gentleness.",
      tafseerUrdu: "اللہ باریک بین اور اپنے بندوں پر بے حد مہربان ہے۔",
    },
    {
      id: 31,
      english: "Al-Khabir",
      arabic: "ٱلْخَبِيرُ",
      meaning: "The All-Aware",
      tafseerEng: "Allah possesses inner, hidden knowledge of all things.",
      tafseerUrdu: "اللہ ہر چیز کی اندرونی حقیقت سے باخبر ہے۔",
    },
    {
      id: 32,
      english: "Al-Halim",
      arabic: "ٱلْحَلِيمُ",
      meaning: "The Forbearing / Clement",
      tafseerEng: "Allah does not rush to punish and remains patient with sinners.",
      tafseerUrdu: "اللہ بہت بردبار ہے اور عذاب دینے میں جلدی نہیں کرتا۔",
    },
    {
      id: 33,
      english: "Al-Azim",
      arabic: "ٱلْعَظِيمُ",
      meaning: "The Magnificent / Great",
      tafseerEng: "Allah's greatness is beyond human imagination and comprehension.",
      tafseerUrdu: "اللہ بہت عظمت اور بڑائی والا ہے۔",
    },
    {
      id: 34,
      english: "Al-Ghafur",
      arabic: "ٱلْغَفُورُ",
      meaning: "The All-Forgiving",
      tafseerEng: "Allah completely blots out sins and covers them entirely.",
      tafseerUrdu: "اللہ بہت زیادہ گناہ بخشنے والا ہے۔",
    },
    {
      id: 35,
      english: "Ash-Shakur",
      arabic: "ٱلشَّكُورُ",
      meaning: "The Most Appreciative",
      tafseerEng: "Allah rewards highly even for the small good deeds we do.",
      tafseerUrdu: "اللہ قدردان ہے اور تھوڑی نیکی کا بہت بڑا اجر دیتا ہے۔",
    },
    {
      id: 36,
      english: "Al-Ali",
      arabic: "ٱلْعَلِيُّ",
      meaning: "The Most High",
      tafseerEng: "Allah is exalted high above all of His creation.",
      tafseerUrdu: "اللہ سب سے بلند اور اعلیٰ مرتبے والا ہے۔",
    },
    {
      id: 37,
      english: "Al-Kabir",
      arabic: "ٱلْكَبِيرُ",
      meaning: "The Most Grand",
      tafseerEng: "Allah is uniquely great and unmatched in His existence.",
      tafseerUrdu: "اللہ سب سے بڑا ہے اور اس کی بڑائی کی کوئی حد نہیں۔",
    },
    {
      id: 38,
      english: "Al-Hafiz",
      arabic: "ٱلْحَفِيظُ",
      meaning: "The Preserver",
      tafseerEng: "Allah protects and preserves the universe and our deeds.",
      tafseerUrdu: "اللہ کائنات اور اپنے بندوں کی حفاظت کرنے والا ہے۔",
    },
    {
      id: 39,
      english: "Al-Muqit",
      arabic: "ٱلْمُقِيتُ",
      meaning: "The Sustainer",
      tafseerEng: "Allah supplies physical and spiritual nourishment to all.",
      tafseerUrdu: "اللہ سب کو طاقت اور روزی پہنچانے والا ہے۔",
    },
    {
      id: 40,
      english: "Al-Hasib",
      arabic: "ٱلْحَسِيبُ",
      meaning: "The Sufficient Accountant",
      tafseerEng: "Allah is sufficient for us and keeps an accurate account of everything.",
      tafseerUrdu: "اللہ سب کے لیے کافی ہے اور حساب لینے والا ہے۔",
    },
    {
      id: 41,
      english: "Al-Jalil",
      arabic: "ٱلْجَلِيلُ",
      meaning: "The Majestic / Glorious",
      tafseerEng: "Allah is absolute owner of sublimity, grandeur, and glory.",
      tafseerUrdu: "اللہ بہت بزرگی اور جلال والا ہے۔",
    },
    {
      id: 42,
      english: "Al-Karim",
      arabic: "ٱلْكَرِيمُ",
      meaning: "The Most Generous",
      tafseerEng: "Allah gives bountifully without being asked and forgives gracefully.",
      tafseerUrdu: "اللہ بے حد کرم فرمانے والا اور سخی ہے۔",
    },
    {
      id: 43,
      english: "Ar-Raqib",
      arabic: "ٱلرَّقِيبُ",
      meaning: "The Watchful Watcher",
      tafseerEng: "Allah observes all actions, thoughts, and movements at all times.",
      tafseerUrdu: "اللہ ہر وقت ہر چیز پر نظر رکھنے والا اور نگہبان ہے۔",
    },
    {
      id: 44,
      english: "Al-Mujib",
      arabic: "ٱلْمُجِيبُ",
      meaning: "The Responsive Hearer",
      tafseerEng: "Allah answers prayers and fulfills requests of those who call Him.",
      tafseerUrdu: "اللہ دعاؤں کو سننے والا اور قبول کرنے والا ہے۔",
    },
    {
      id: 45,
      english: "Al-Wasi",
      arabic: "ٱلْوَاسِعُ",
      meaning: "The All-Encompassing",
      tafseerEng: "Allah's knowledge, mercy, and presence have no limit.",
      tafseerUrdu: "اللہ کی وسعت، علم اور رحمت بے پناہ ہے۔",
    },
    {
      id: 46,
      english: "Al-Hakim",
      arabic: "ٱلْحَكِيمُ",
      meaning: "The All-Wise",
      tafseerEng: "Allah's choices and actions are filled with absolute flawless wisdom.",
      tafseerUrdu: "اللہ کمال حکمت والا ہے، اس کا کوئی کام حکمت سے خالی نہیں۔",
    },
    {
      id: 47,
      english: "Al-Wadud",
      arabic: "ٱلْوَدُودُ",
      meaning: "The Most Loving",
      tafseerEng: "Allah loves His pure servants deeply and fills hearts with affection.",
      tafseerUrdu: "اللہ اپنے بندوں سے بہت محبت کرنے والا ہے۔",
    },
    {
      id: 48,
      english: "Al-Majid",
      arabic: "ٱلْمَجِيدُ",
      meaning: "The Most Glorious",
      tafseerEng: "Allah is full of honor, nobility, and infinite generosity.",
      tafseerUrdu: "اللہ بہت زیادہ بزرگی اور تعریف والا ہے۔",
    },
    {
      id: 49,
      english: "Al-Ba'ith",
      arabic: "ٱلْبَاعِثُ",
      meaning: "The Resurrector",
      tafseerEng: "Allah will bring the dead back to life on the Day of Judgment.",
      tafseerUrdu: "اللہ مردوں کو دوبارہ زندہ کر کے اٹھانے والا ہے۔",
    },
    {
      id: 50,
      english: "Ash-Shahid",
      arabic: "ٱلشَّهِيدُ",
      meaning: "The All-Witnessing",
      tafseerEng: "Allah is present everywhere and witnesses every single detail.",
      tafseerUrdu: "اللہ ہر جگہ موجود اور سب کچھ دیکھنے والا گواہ ہے۔",
    },
    {
      id: 51,
      english: "Al-Haqq",
      arabic: "ٱلْحَقُّ",
      meaning: "The Absolute Truth",
      tafseerEng: "Allah is the ultimate Reality, unchanged and eternal.",
      tafseerUrdu: "اللہ ہی سچا اور برحق معبود ہے۔",
    },
    {
      id: 52,
      english: "Al-Wakil",
      arabic: "ٱلْوَكِيلُ",
      meaning: "The Ultimate Trustee",
      tafseerEng: "Allah manages all affairs perfectly for those who rely on Him.",
      tafseerUrdu: "اللہ بہترین کارساز ہے جس پر بھروسہ کیا جا سکتا ہے۔",
    },
    {
      id: 53,
      english: "Al-Qawiyy",
      arabic: "ٱلْقَوِيُّ",
      meaning: "The All-Strong",
      tafseerEng: "Allah has boundless strength that never fades or tires.",
      tafseerUrdu: "اللہ بے پناہ طاقت اور قوت کا مالک ہے۔",
    },
    {
      id: 54,
      english: "Al-Matin",
      arabic: "ٱلْمَتِينُ",
      meaning: "The Firm / Steadfast",
      tafseerEng: "Allah's power is stable and unshakable under all circumstances.",
      tafseerUrdu: "اللہ نہایت مضبوط قوت والا ہے۔",
    },
    {
      id: 55,
      english: "Al-Waliyy",
      arabic: "ٱلْوَلِيُّ",
      meaning: "The Protecting Friend",
      tafseerEng: "Allah is the supportive guardian and ally of righteous believers.",
      tafseerUrdu: "اللہ مومنوں کا سچا دوست اور مددگار ہے۔",
    },
    {
      id: 56,
      english: "Al-Hamid",
      arabic: "ٱلْحَمِيدُ",
      meaning: "The Praiseworthy",
      tafseerEng: "Allah alone deserves all praise for His infinite blessings.",
      tafseerUrdu: "اللہ ہی ہر قسم کی تعریف کے لائق ہے۔",
    },
    {
      id: 57,
      english: "Al-Muhsi",
      arabic: "ٱلْمُحْصِي",
      meaning: "The All-Counting Accountant",
      tafseerEng: "Allah calculates and numbers every atom and action accurately.",
      tafseerUrdu: "اللہ ہر چیز کا شمار رکھنے والا اور حساب جاننے والا ہے۔",
    },
    {
      id: 58,
      english: "Al-Mubdi",
      arabic: "ٱلْمُبْدِئُ",
      meaning: "The Initiator",
      tafseerEng: "Allah started the entire universe from nothing.",
      tafseerUrdu: "اللہ کائنات کو پہلی بار پیدا کرنے والا ہے۔",
    },
    {
      id: 59,
      english: "Al-Mu'id",
      arabic: "ٱلْمُعِيدُ",
      meaning: "The Restorer",
      tafseerEng: "Allah will recreate all things after death and termination.",
      tafseerUrdu: "اللہ فنا ہونے کے بعد دوبارہ پیدا کرنے والا ہے۔",
    },
    {
      id: 60,
      english: "Al-Muhyi",
      arabic: "ٱلْمُحْيِي",
      meaning: "The Giver of Life",
      tafseerEng: "Allah grants life and breathes souls into non-living matters.",
      tafseerUrdu: "اللہ ہی زندگی عطا کرنے والا ہے۔",
    },
    {
      id: 61,
      english: "Al-Mumit",
      arabic: "ٱلْمُمِيتُ",
      meaning: "The Bringer of Death",
      tafseerEng: "Allah decrees when and how a living creature will die.",
      tafseerUrdu: "اللہ ہی موت دینے والا ہے۔",
    },
    {
      id: 62,
      english: "Al-Hayy",
      arabic: "ٱلْحَيُّ",
      meaning: "The Ever-Living",
      tafseerEng: "Allah is eternal, alive forever without beginning or end.",
      tafseerUrdu: "اللہ ہمیشہ زندہ رہنے والا ہے جسے کبھی موت نہیں۔",
    },
    {
      id: 63,
      english: "Al-Qayyum",
      arabic: "ٱلْقَيُّومُ",
      meaning: "The Self-Sustaining",
      tafseerEng: "Allah sustains Himself and relies on absolutely nobody.",
      tafseerUrdu: "اللہ خود قائم رہنے والا اور پوری کائنات کو سنبھالنے والا ہے۔",
    },
    {
      id: 64,
      english: "Al-Wajid",
      arabic: "ٱلْوَاجِدُ",
      meaning: "The Perceiver / Finder",
      tafseerEng: "Allah finds and possesses whatever He desires effortlessly.",
      tafseerUrdu: "اللہ جو چاہے پا لینے والا ہے، کوئی اس سے چھپ نہیں سکتا۔",
    },
    {
      id: 65,
      english: "Al-Majid",
      arabic: "ٱلْمَاجِدُ",
      meaning: "The Illustrious",
      tafseerEng: "Allah is highly respected, noble, and infinitely magnificent.",
      tafseerUrdu: "اللہ بڑی شان اور شرف والا ہے۔",
    },
    {
      id: 66,
      english: "Al-Wahid",
      arabic: "ٱلْوَاحِدُ",
      meaning: "The One",
      tafseerEng: "Allah is unique in His identity and actions, with no equals.",
      tafseerUrdu: "اللہ اپنی ذات اور صفات میں یکتا ہے۔",
    },
    {
      id: 67,
      english: "Al-Ahad",
      arabic: "ٱلْأَحَدُ",
      meaning: "The Only One / Indivisible",
      tafseerEng: "Allah is the absolute indivisible One, completely unique.",
      tafseerUrdu: "اللہ اکیلا ہے، اس کا کوئی شریک یا حصہ دار نہیں۔",
    },
    {
      id: 68,
      english: "As-Samad",
      arabic: "ٱلصَّمَدُ",
      meaning: "The Eternal / Self-Sufficient",
      tafseerEng: "Everyone depends on Allah, but Allah depends on no one.",
      tafseerUrdu: "اللہ بے نیاز ہے، سب اس کے محتاج ہیں وہ کسی کا محتاج نہیں۔",
    },
    {
      id: 69,
      english: "Al-Qadir",
      arabic: "ٱلْقَادِرُ",
      meaning: "The All-Capable",
      tafseerEng: "Allah has execution power to execute whatever He wills.",
      tafseerUrdu: "اللہ ہر چیز پر پوری قدرت رکھنے والا ہے۔",
    },
    {
      id: 70,
      english: "Al-Muqtadir",
      arabic: "ٱلْمُقْتَدِرُ",
      meaning: "The All-Powerful Determiner",
      tafseerEng: "Allah controls creation with absolute supreme power.",
      tafseerUrdu: "اللہ عظیم طاقت والا اور اقتدار کا مالک ہے۔",
    },
    {
      id: 71,
      english: "Al-Muqaddim",
      arabic: "ٱلْمُقَدِّمُ",
      meaning: "The Expediter",
      tafseerEng: "Allah brings forward whatever He wills according to His wisdom.",
      tafseerUrdu: "اللہ جسے چاہے آگے بڑھانے والا اور تقدم دینے والا ہے۔",
    },
    {
      id: 72,
      english: "Al-Mu'akhkhir",
      arabic: "ٱلْمُؤَخِّرُ",
      meaning: "The Delayer",
      tafseerEng: "Allah pushes back or delays things according to His flawless plan.",
      tafseerUrdu: "اللہ اپنی حکمت سے جسے چاہے پیچھے کرنے والا ہے۔",
    },
    {
      id: 73,
      english: "Al-Awwal",
      arabic: "ٱلْأَوَّلُ",
      meaning: "The First",
      tafseerEng: "Allah existed before anything else was created, without a beginning.",
      tafseerUrdu: "اللہ سب سے پہلے موجود تھا، اس کی کوئی شروعات نہیں۔",
    },
    {
      id: 74,
      english: "Al-Akhir",
      arabic: "ٱلْآخِرُ",
      meaning: "The Last",
      tafseerEng: "Allah will remain alive forever after all creation vanishes.",
      tafseerUrdu: "اللہ سب کے بعد بھی باقی رہنے والا ہے، اس کی کوئی انتہا نہیں۔",
    },
    {
      id: 75,
      english: "Az-Zahir",
      arabic: "ٱلظَّاهِرُ",
      meaning: "The Manifest / Obvious",
      tafseerEng: "Allah's existence is clearly visible through His endless signs.",
      tafseerUrdu: "اللہ اپنی نشانیوں سے بالکل ظاہر اور عیاں ہے۔",
    },
    {
      id: 76,
      english: "Al-Batin",
      arabic: "ٱلْبَاطِنُ",
      meaning: "The Hidden / Invisible",
      tafseerEng: "Allah cannot be seen physically by human eyes in this world.",
      tafseerUrdu: "اللہ اپنی ذات میں پوشیدہ ہے، جسے آنکھیں دیکھ نہیں سکتیں۔",
    },
    {
      id: 77,
      english: "Al-Wali",
      arabic: "ٱلْوَالِي",
      meaning: "The Sole Governor",
      tafseerEng: "Allah rules over the cosmos and manages all worldly affairs.",
      tafseerUrdu: "اللہ کائنات کا اصل مالک اور واحد انتظام چلانے والا ہے۔",
    },
    {
      id: 78,
      english: "Al-Muta'ali",
      arabic: "ٱلْمُتَعَالِي",
      meaning: "The Supreme Exalted",
      tafseerEng: "Allah is sublime, far above any human attributes or limits.",
      tafseerUrdu: "اللہ سب سے بلند اور اعلیٰ شان والا ہے۔",
    },
    {
      id: 79,
      english: "Al-Barr",
      arabic: "ٱلْبَرُّ",
      meaning: "The Source of All Goodness",
      tafseerEng: "Allah is extremely kind, doing endless favors for His servants.",
      tafseerUrdu: "اللہ سراپا نیکی، احسان اور بھلائی کرنے والا ہے۔",
    },
    {
      id: 80,
      english: "At-Tawwab",
      arabic: "ٱلتَّوَّابُ",
      meaning: "The Ever-Acceptor of Repentance",
      tafseerEng: "Allah constantly accepts sincere repentance from sinners.",
      tafseerUrdu: "اللہ توبہ قبول کرنے والا اور معاف کرنے والا ہے۔",
    },
    {
      id: 81,
      english: "Al-Muntaqim",
      arabic: "ٱلْمُنْتَقِمُ",
      meaning: "The Avenger",
      tafseerEng: "Allah punishes wrongdoers justly when they cross boundaries.",
      tafseerUrdu: "اللہ ظالموں اور گناہ گاروں سے بدلہ لینے والا ہے۔",
    },
    {
      id: 82,
      english: "Al-Afuww",
      arabic: "ٱلْعَفُوُّ",
      meaning: "The Supreme Pardoner",
      tafseerEng: "Allah completely erases sins as if they never happened.",
      tafseerUrdu: "اللہ گناہوں کو بالکل مٹا دینے والا اور معاف کرنے والا ہے۔",
    },
    {
      id: 83,
      english: "Ar-Ra'uf",
      arabic: "ٱلرَّؤُوفُ",
      meaning: "The Most Kind / Compassionate",
      tafseerEng: "Allah possesses extreme pity and beautiful mercy towards creation.",
      tafseerUrdu: "اللہ اپنے بندوں پر نہایت مہربان اور شفیق ہے۔",
    },
    {
      id: 84,
      english: "Malik-ul-Mulk",
      arabic: "مَالِكُ ٱلْمُلْكِ",
      meaning: "Master of Sovereign Kingdom",
      tafseerEng: "Allah is the permanent absolute owner of entire dominion.",
      tafseerUrdu: "اللہ پوری کائنات کی سلطنت کا تنہا مالک ہے۔",
    },
    {
      id: 85,
      english: "Dhul-Jalali wal-Ikram",
      arabic: "ذُو ٱلْجَلَٰلِ وَٱلْإِكْرَامِ",
      meaning: "Lord of Majesty and Generosity",
      tafseerEng: "Allah is the possessor of supreme glory, honor, and generosity.",
      tafseerUrdu: "اللہ بڑی عظمت، جلال اور انعام و اکرام والا ہے۔",
    },
    {
      id: 86,
      english: "Al-Muqsit",
      arabic: "ٱلْمُقْسِطُ",
      meaning: "The Equitable / Just",
      tafseerEng: "Allah establishes absolute justice and fairness in judgments.",
      tafseerUrdu: "اللہ ہر ایک کے ساتھ پورا انصاف کرنے والا ہے۔",
    },
    {
      id: 87,
      english: "Al-Jami",
      arabic: "ٱلْجَامِعُ",
      meaning: "The Gatherer",
      tafseerEng: "Allah will assemble all humanity together on Judgment Day.",
      tafseerUrdu: "اللہ قیامت کے دن تمام لوگوں کو ایک جگہ جمع کرنے والا ہے۔",
    },
    {
      id: 88,
      english: "Al-Ghaniyy",
      arabic: "ٱلْغَنِيُّ",
      meaning: "The Absolutely Rich",
      tafseerEng: "Allah is independent, rich, and does not require anything.",
      tafseerUrdu: "اللہ سب سے بے نیاز ہے اور حقیقی دولت کا مالک ہے۔",
    },
    {
      id: 89,
      english: "Al-Mughni",
      arabic: "ٱلْمُغْنِي",
      meaning: "The Enricher",
      tafseerEng: "Allah makes whomever He pleases wealthy and satisfied.",
      tafseerUrdu: "اللہ جسے چاہتا ہے اپنی رحمت سے مالا مال کر دیتا ہے۔",
    },
    {
      id: 90,
      english: "Al-Mani",
      arabic: "ٱلْمَانِعُ",
      meaning: "The Withholder / Preventer",
      tafseerEng: "Allah stops or prevents things that are harmful or not decreed.",
      tafseerUrdu: "اللہ نقصان اور مصیبتوں کو روکنے والا ہے۔",
    },
    {
      id: 91,
      english: "Ad-Darr",
      arabic: "ٱلضَّارُّ",
      meaning: "The Distressor",
      tafseerEng: "Allah allows affliction and harm to touch people according to His test.",
      tafseerUrdu: "اللہ اپنی حکمت کے تحت آزمائش کے لیے نقصان پہنچانے پر قادر ہے۔",
    },
    {
      id: 92,
      english: "An-Nafi",
      arabic: "ٱلنَّافِعُ",
      meaning: "The Propitious / Benefactor",
      tafseerEng: "Allah sends real benefits, goodness, and success to people.",
      tafseerUrdu: "اللہ ہی حقیقی فائدہ اور نفع پہنچانے والا ہے۔",
    },
    {
      id: 93,
      english: "An-Nur",
      arabic: "ٱلنُّورُ",
      meaning: "The Divine Light",
      tafseerEng: "Allah illuminates the cosmos and guides hearts with light.",
      tafseerUrdu: "اللہ کائنات کو روشن کرنے والا اور ہدایت کا نور ہے۔",
    },
    {
      id: 94,
      english: "Al-Hadi",
      arabic: "ٱلْهَادِي",
      meaning: "The Guide",
      tafseerEng: "Allah provides flawless direction and path to truth.",
      tafseerUrdu: "اللہ سیدھی راہ دکھانے والا اور ہدایت دینے والا ہے۔",
    },
    {
      id: 95,
      english: "Al-Badi",
      arabic: "ٱلْبَدِيعُ",
      meaning: "The Incomparable Originator",
      tafseerEng: "Allah created the universe with spectacular, unprecedented design.",
      tafseerUrdu: "اللہ بغیر کسی نمونے کے انوکھی کائنات بنانے والا ہے۔",
    },
    {
      id: 96,
      english: "Al-Baqi",
      arabic: "ٱلْبَاقِي",
      meaning: "The Everlasting",
      tafseerEng: "Allah will remain forever after everything else has expired.",
      tafseerUrdu: "اللہ ہمیشہ باقی رہنے والا ہے، اسے کبھی فنا نہیں۔",
    },
    {
      id: 97,
      english: "Al-Warith",
      arabic: "ٱلْوَارِثُ",
      meaning: "The Ultimate Inheritor",
      tafseerEng: "Allah inherits entire property after all owners pass away.",
      tafseerUrdu: "اللہ سب کے فنا ہونے کے بعد کائنات کا اصل وارث ہے۔",
    },
    {
      id: 98,
      english: "Ar-Rashid",
      arabic: "ٱلرَّشِيدُ",
      meaning: "The Righteous Guide",
      tafseerEng: "Allah directs everything with flawless wisdom onto the right track.",
      tafseerUrdu: "اللہ سیدھے راستے پر چلانے والا اور بڑا عاقل ہے۔",
    },
    {
      id: 99,
      english: "As-Sabur",
      arabic: "ٱلصَّبُورُ",
      meaning: "The Most Patient",
      tafseerEng: "Allah does not rush to penalize or act before the right time.",
      tafseerUrdu: "اللہ بڑا صابر ہے، گناہ گاروں کو مہلت دینے والا ہے۔",
    },
  ];

  const filteredNames = allahNames.filter((item) =>
    item.english.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- DETAIL SCREEN ---------------- */
  if (selectedName) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
        <BackButton
          onPress={() => {
            stopSpeaking();
            setSelectedName(null);
          }}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <ImageBackground
            source={require("../homeAssets/Quotebg.jpg")}
            style={styles.detailHeader}
            imageStyle={{
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            <Text style={styles.bigArabic}>{selectedName.arabic}</Text>
            <Text style={styles.bigEnglish}>{selectedName.english}</Text>
          </ImageBackground>

          {/* DETAIL CARD */}
          <View style={styles.detailCard}>
            <Text style={styles.heading}>Meaning 🌙</Text>
            <View style={styles.translationRow}>
              <Text style={styles.engMeaning}>{selectedName.meaning}</Text>
              <Text style={styles.urduMeaning}>{selectedName.tafseerUrdu}</Text>
            </View>

            <Text style={styles.heading}>Pronunciation 🔊</Text>
            <Text style={styles.pronounceText}>{selectedName.english}</Text>

            {/* AUDIO BUTTON — female TTS */}
            <TouchableOpacity
              style={styles.audioButton}
              activeOpacity={0.85}
              onPress={() =>
                speakArabicFemale(selectedName.arabic, selectedName.english)
              }
            >
              <Ionicons name="volume-high" size={24} color="#fff" />
              <Text style={styles.audioText}>Hear pronunciation</Text>
            </TouchableOpacity>

            <Text style={styles.heading}>Tafseer 📖</Text>
            <Text style={styles.tafseerEng}>{selectedName.tafseerEng}</Text>
            <Text style={styles.tafseerUrdu}>{selectedName.tafseerUrdu}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ---------------- MAIN SCREEN ---------------- */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
      <BackButton onPress={goBack} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <ImageBackground
          source={require("../homeAssets/Quotebg.jpg")}
          style={styles.header}
          imageStyle={{
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          <Text style={styles.headerTitle}>99 Names of Allah 🌙</Text>
          <Text style={styles.headerSubtitle}>Learn the beautiful names</Text>

          {/* SEARCH */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={22} color="#777" />
            <TextInput
              placeholder="Search name..."
              placeholderTextColor="#777"
              value={search}
              onChangeText={setSearch}
              style={styles.input}
            />
          </View>
        </ImageBackground>

        {/* CARDS */}
        <View style={styles.cardsContainer}>
          {filteredNames.map((item) => {
            const colors =
              NAME_CARD_COLORS[(item.id - 1) % NAME_CARD_COLORS.length];
            return (
              <SmoothPressable
                key={item.id}
                radius={20}
                style={styles.cardWrapper}
                onPress={() => setSelectedName(item)}
              >
                <LinearGradient
                  colors={colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <GradCardDecor />
                  <View style={styles.iconCircle}>
                    <Ionicons name="moon" size={20} color="#fff" />
                  </View>
                  <View style={styles.cardTextCol}>
                    <View style={styles.nameRow}>
                      <View style={styles.nameLeft}>
                        <Text style={styles.englishName}>{item.english}</Text>
                        <Text style={styles.meaning} numberOfLines={1}>
                          {item.meaning}
                        </Text>
                      </View>
                      <Text style={styles.arabicName}>{item.arabic}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFFCC" />
                </LinearGradient>
              </SmoothPressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NamesOfAllahScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  header: {
    paddingTop: 70,
    paddingBottom: 35,
    alignItems: "center",
  },
  detailHeader: {
    paddingTop: 70,
    paddingBottom: 50,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 20,
  },
  headerSubtitle: {
    color: "#EAE2FF",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
  },
  searchBar: {
    backgroundColor: "#fff",
    width: "88%",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 22,
    height: 58,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 50,
  },
  cardWrapper: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    minHeight: 88,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
    position: "relative",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  cardTextCol: {
    flex: 1,
    zIndex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  nameLeft: {
    flex: 1,
  },
  englishName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  meaning: {
    color: "#F3EEFF",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  arabicName: {
    color: "#fff",
    fontSize: 22,
    textAlign: "right",
    fontWeight: "800",
    lineHeight: 32,
    maxWidth: "42%",
  },
  detailCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 28,
    padding: 24,
    elevation: 6,
  },
  bigArabic: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "bold",
    marginTop: 20,
  },
  bigEnglish: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4B2AA8",
    marginTop: 18,
    marginBottom: 12,
  },
  translationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  engMeaning: {
    fontSize: 18,
    color: "#333",
    width: "45%",
    fontWeight: "700",
  },
  urduMeaning: {
    fontSize: 18,
    color: "#333",
    width: "45%",
    textAlign: "right",
    fontWeight: "700",
  },
  pronounceText: {
    fontSize: 20,
    color: "#444",
    marginBottom: 10,
    fontWeight: "700",
  },
  audioButton: {
    backgroundColor: "#6C4DF7",
    paddingVertical: 16,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  audioText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  tafseerEng: {
    fontSize: 17,
    color: "#444",
    lineHeight: 30,
    marginBottom: 14,
  },
  tafseerUrdu: {
    fontSize: 18,
    color: "#444",
    lineHeight: 34,
    textAlign: "right",
  },
  normalText: {
    fontSize: 17,
    color: "#555",
    lineHeight: 30,
  },
});