import React, { useState } from "react";
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
import BackButton from "./BackButton";

type Props = {
  goBack: () => void;
};

const SalahScreen: React.FC<Props> = ({ goBack }) => {
  const [search, setSearch] = useState("");
  const [selectedStep, setSelectedStep] = useState<any>(null);

  const salahSteps = [
    {
      id: 1,
      title: "Takbeer",
      arabic: "اللَّهُ أَكْبَرُ",
      detail: "Raise both hands to your earlobes and say Allahu Akbar to start Salah.",
      detailUrdu: "دونوں ہاتھ کانوں کی لو تک اٹھائیں اور اللہ اکبر کہہ کر نماز شروع کریں۔",
      tafseerEng: "Takbeer signifies entering into a sacred state, cutting off all worldly attachments.",
      tafseerUrdu: "تکبیر تحریمہ کا مطلب ہے کہ دنیاوی تمام کام اب حرام ہو گئے اور آپ اللہ کی بارگاہ میں کھڑے ہیں۔",
      methodEng: "Hands facing the Qiblah, fingers naturally aligned, and look towards the place of Sajdah.",
      methodUrdu: "ہتھیلیاں قبلہ رخ ہوں، انگلیاں سیدھی ہوں اور نظر سجدے کی جگہ پر ہونی چاہیے۔",
      bg: require("../homeAssets/purpleCard.jpg"),
    },
    {
      id: 2,
      title: "Qiyam & Recitation",
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      detail: "Stand straight, fold your arms, and recite Sana, Surah Al-Fatihah, and another Surah.",
      detailUrdu: "سیدھے کھڑے ہوں، ہاتھ باندھیں اور ثناء، سورہ فاتحہ اور کوئی سورت تلاوت کریں۔",
      tafseerEng: "Standing respectfully represents absolute obedience and directly conversing with Allah.",
      tafseerUrdu: "قیام بندے کی عاجزی اور اللہ رب العزت کے سامنے انتہائی ادب کے ساتھ کھڑے ہونے کی علامت ہے۔",
      methodEng: "Place right hand over left hand below the navel or on the chest, keeping feet apart comfortably.",
      methodUrdu: "ناswitchف کے نیچے یا سینے پر دائیں ہاتھ کو بائیں ہاتھ کے اوپر باندھیں اور قدموں میں مناسب فاصلہ رکھیں۔",
      bg: require("../homeAssets/orangeCard.jpg"),
    },
    {
      id: 3,
      title: "Ruku (Bowing)",
      arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
      detail: "Bow down and recite 'Subhana Rabbiyal Azeem' three times.",
      detailUrdu: "رکوع میں جھکیں اور تین مرتبہ 'سبحان ربی العظیم' کہیں۔",
      tafseerEng: "Bowing down glorifies Allah's supreme greatness and acknowledges our humility.",
      tafseerUrdu: "رکوع اللہ تعالیٰ کی عظمت اور بڑائی کا اقرار ہے کہ وہی سب سے عظیم کائنات کا مالک ہے۔",
      methodEng: "Keep your back perfectly straight, hold your knees with fingers spread, and look at your feet.",
      methodUrdu: "اپنی پیٹھ بالکل سیدھی رکھیں، انگلیوں کو پھیلا کر گھٹنوں کو پکڑیں اور نظر پاؤں پر رکھیں۔",
      bg: require("../homeAssets/pinkCard.jpg"),
    },
    {
      id: 4,
      title: "Qaumah (Rising)",
      arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ",
      detail: "Stand straight up after Ruku, reciting praises to Allah.",
      detailUrdu: "رکوع سے سیدھے کھڑے ہوں اور اللہ کی حمد و ثناء بیان کریں۔",
      tafseerEng: "A state of gratitude to thank Allah for allowing us to bow down and praise Him.",
      tafseerUrdu: "اللہ کا شکر ادا کرنے کی حالت کہ اس نے ہمیں اپنی تعریف بیان کرنے کی توفیق عطا فرمائی۔",
      methodEng: "Let your hands drop to your sides naturally and say 'Rabbana lakal hamd'.",
      methodUrdu: "ہاتھوں کو بالکل سیدھا چھوڑ دیں اور 'ربنا لک الحمد' کہیں۔",
      bg: require("../homeAssets/greencardBg.jpg"),
    },
    {
      id: 5,
      title: "First Sajdah",
      arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَىٰ",
      detail: "Prostrate on the ground and recite 'Subhana Rabbiyal A'la' three times.",
      detailUrdu: "سجدے میں جائیں اور تین مرتبہ 'سبحان ربی الاعلیٰ' کہیں۔",
      tafseerEng: "Sajdah is the ultimate peak of humility where a slave is closest to Allah.",
      tafseerUrdu: "سجدہ بندگی کی معراج ہے، اس حالت میں انسان اپنے خالق کے سب سے زیادہ قریب ہوتا ہے۔",
      methodEng: "Seven parts must touch the ground: forehead, nose, two palms, two knees, and toes.",
      methodUrdu: "سات اعضاء زمین پر لگیں: پیشانی، ناک، دونوں ہتھیلیاں، دونوں گھٹنے اور دونوں پاؤں کی انگلیاں۔",
      bg: require("../homeAssets/cyanCard.jpg"),
    },
    {
      id: 6,
      title: "Jalsa (Sitting)",
      arabic: "رَبِّ اغْفِرْ لِي",
      detail: "Sit up straight and pause briefly between the two prostrations.",
      detailUrdu: "پہلے سجدے سے اٹھ کر سیدھے بیٹھیں اور دونوں سجدوں کے درمیان مختصر وقفہ کریں۔",
      tafseerEng: "A moment of stillness to seek forgiveness and mercy before the next prostration.",
      tafseerUrdu: "دو سجدوں کے درمیان بیٹھنا مغفرت اور رحمت طلب کرنے کا ایک خاص اور پرسکون لمحہ ہے۔",
      methodEng: "Sit on your left foot with the right foot upright, resting your hands on your thighs.",
      methodUrdu: "بایاں پاؤں بچھا کر اس پر بیٹھیں اور دایاں پاؤں کھڑا رکھیں، ہاتھ رانوں پر رکھیں۔",
      bg: require("../homeAssets/indigoCard.jpg"),
    },
    {
      id: 7,
      title: "Second Sajdah",
      arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَىٰ",
      detail: "Perform the second prostration exactly like the first one.",
      detailUrdu: "پہلے سجدے کی طرح ہی دوسرا سجدہ مکمل کریں۔",
      tafseerEng: "The second sajdah confirms our dedication and consistency in total worship.",
      tafseerUrdu: "دوسرا سجدہ عاجزی کی تجدید ہے کہ انسان بار بار اپنے رب کے سامنے سرنگوں ہوتا ہے۔",
      methodEng: "Ensure the same physical posture as the first Sajdah, maintaining complete focus.",
      methodUrdu: "جسمانی کیفیت پہلے سجدے جیسی ہی رکھیں اور پوری توجہ اللہ کی طرف مبذول رکھیں۔",
      bg: require("../homeAssets/yellowCard.jpg"),
    },
    {
      id: 8,
      title: "Tashahhud",
      arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ",
      detail: "Sit down after completing two Rak'ahs and recite At-Tahiyyat.",
      detailUrdu: "دو رکعتیں مکمل کرنے کے بعد قعدہ میں بیٹھیں اور التحیات پڑھیں۔",
      tafseerEng: "Tashahhud contains the dialogue between Prophet Muhammad (PBUH) and Allah during Mi'raj.",
      tafseerUrdu: "التحیات میں وہ بابرکت کلمات ہیں جو معراج کے موقع پر اللہ اور رسول اللہ ﷺ کے درمیان ہوئے۔",
      methodEng: "Raise your right index finger when testifying the oneness of Allah (Ashhadu alla...)",
      methodUrdu: "جب کلمہ شہادت (اشھد ان لا) پر پہنچیں تو دائیں ہاتھ کی شہادت کی انگلی اٹھا کر اشارہ کریں۔",
      bg: require("../homeAssets/pinkCard.jpg"),
    },
    {
      id: 9,
      title: "Durood Ibrahim",
      arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ",
      detail: "Recite Durood Ibrahim to send blessings upon Prophet Muhammad (PBUH).",
      detailUrdu: "نبی کریم ﷺ پر درود و سلام بھیجنے کے لیے درود ابراہیمی پڑھیں۔",
      tafseerEng: "Sending Durood unlocks acceptance of prayers and honors the Messenger of Allah.",
      tafseerUrdu: "نماز کے آخر میں درود شریف پڑھنا دعاؤں کی قبولیت اور حضور ﷺ سے محبت کا لازمی جزو ہے۔",
      methodEng: "Remain seated in the same position, reciting slowly with devotion.",
      methodUrdu: "اسی بیٹھنے کی حالت میں خشوع و خضوع کے ساتھ درود شریف اور اس کے بعد کوئی مسنون دعا پڑھیں۔",
      bg: require("../homeAssets/purpleCard.jpg"),
    },
    {
      id: 10,
      title: "Salam",
      arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
      detail: "Turn your head to the right and then to the left to conclude Salah.",
      detailUrdu: "نماز مکمل کرنے کے لیے پہلے دائیں اور پھر بائیں طرف سلام پھیریں۔",
      tafseerEng: "Greeting the angels on your sides and spreading peace to humanity.",
      tafseerUrdu: "سلام کے ذریعے ہم اپنے دائیں بائیں موجود فرشتوں اور تمام مسلمانوں پر سلامتی بھیجتے ہیں۔",
      methodEng: "Turn right until your cheek is visible from behind, then turn left.",
      methodUrdu: "پہلے دائیں طرف اتنا منہ پھیریں کہ پیچھے والے کو گال نظر آئے، پھر بائیں طرف سلام پھیریں۔",
      bg: require("../homeAssets/orangeCard.jpg"),
    },
  ];

  const filteredSteps = salahSteps.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- SALAH STEP DETAIL SCREEN ---------------- */
  if (selectedStep) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          {/* HEADER */}
          <ImageBackground
            source={require("../homeAssets/Quotebg.jpg")}
            style={styles.header}
          >
            <BackButton onPress={() => setSelectedStep(null)} />
            <Text style={styles.bigTitle}>{selectedStep.title}</Text>
          </ImageBackground>

          {/* DETAIL CONTENT CARD */}
          <View style={styles.detailCard}>
            <Text style={styles.sectionHeading}>Arabic Text 🕋</Text>
            <Text style={styles.arabic}>{selectedStep.arabic}</Text>

            <Text style={styles.sectionHeading}>Meaning & Details 🌍</Text>
            <View style={styles.translationRow}>
              <Text style={styles.engMeaning}>{selectedStep.detail}</Text>
              <Text style={styles.urduMeaning}>{selectedStep.detailUrdu}</Text>
            </View>

            {/* AUDIO RECITATION BUTTON */}
            <TouchableOpacity style={styles.audioButton}>
              <Ionicons name="volume-high" size={24} color="#fff" />
              <Text style={styles.audioText}>Play Step Audio</Text>
            </TouchableOpacity>

            <Text style={styles.sectionHeading}>How to Perform (Tareeqa) 🛠️</Text>
            <Text style={styles.tafseerEng}>• {selectedStep.methodEng}</Text>
            <Text style={styles.tafseerUrdu}>• {selectedStep.methodUrdu}</Text>

            <Text style={styles.sectionHeading}>Significance & Tafseer 📖</Text>
            <Text style={styles.tafseerEng}>{selectedStep.tafseerEng}</Text>
            <Text style={styles.tafseerUrdu}>{selectedStep.tafseerUrdu}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ---------------- MAIN SALAH LIST SCREEN ---------------- */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
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
          <BackButton onPress={goBack} />
          <Text style={styles.title}>Learn Salah 🕌</Text>
          <Text style={styles.subtitle}>Step by Step Salah Guide</Text>

          {/* SEARCH BAR */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={22} color="#777" />
            <TextInput
              placeholder="Search step (e.g. Ruku)..."
              placeholderTextColor="#777"
              value={search}
              onChangeText={setSearch}
              style={styles.input}
            />
          </View>
        </ImageBackground>

        {/* SALAH STEPS LIST */}
        <View style={styles.cardsContainer}>
          {filteredSteps.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.cardWrapper}
              onPress={() => setSelectedStep(item)}
            >
              <ImageBackground
                source={item.bg}
                style={styles.card}
                imageStyle={{
                  borderRadius: 22,
                }}
              >
                <Text style={styles.cardTitle}>
                  {item.id}. {item.title}
                </Text>
                <Ionicons name="chevron-forward" size={26} color="#fff" />
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SalahScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  header: {
    paddingTop: 35,
    paddingBottom: 40,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 20,
  },
  bigTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
  },
  subtitle: {
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
    elevation: 4,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  cardsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 22,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    minHeight: 90,
    elevation: 5,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  detailCard: {
    margin: 20,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 28,
    elevation: 6,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B2AA8",
    marginBottom: 12,
    marginTop: 22,
  },
  arabic: {
    fontSize: 32,
    textAlign: "right",
    lineHeight: 54,
    marginBottom: 15,
    color: "#222",
    fontWeight: "700",
  },
  translationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  engMeaning: {
    fontSize: 15,
    color: "#333",
    width: "47%",
    fontWeight: "600",
    lineHeight: 24,
  },
  urduMeaning: {
    fontSize: 16,
    color: "#333",
    width: "47%",
    textAlign: "right",
    fontWeight: "600",
    lineHeight: 28,
  },
  audioButton: {
    backgroundColor: "#6C4DF7",
    paddingVertical: 15,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 5,
  },
  audioText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  tafseerEng: {
    fontSize: 16,
    color: "#444",
    lineHeight: 26,
    marginBottom: 10,
  },
  tafseerUrdu: {
    fontSize: 16,
    color: "#444",
    lineHeight: 30,
    textAlign: "right",
    marginBottom: 10,
  },
});