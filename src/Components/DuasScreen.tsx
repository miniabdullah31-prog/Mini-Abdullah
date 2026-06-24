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

const DuasScreen: React.FC<Props> = ({ goBack }) => {
  const [search, setSearch] = useState("");
  const [selectedDua, setSelectedDua] = useState<any>(null);

  const Duas = [
    {
      id: 1,
      title: "Morning Dua",
      arabic: "أَصْـبَحْنا وَأَصْـبَحَ المـلْكُ لله",
      translation: "We have entered a new morning and with it all dominion belongs to Allah.",
      translationUrdu: "ہم نے صبح کی اور صبح کے وقت سارا ملک اللہ ہی کا ہے۔",
      tafseerEng: "This supplication protects a believer starting their day by submitting all ownership to the Creator.",
      tafseerUrdu: "یہ دعا دن کا آغاز اللہ کی حاکمیت اور توحید کے اقرار کے ساتھ کرنے اور سارا دن حفاظت میں رہنے کے لیے ہے۔",
      caption: "Yahan aap is dua se related apna custom caption likh sakti hain.",
      bg: require("../homeAssets/blueCard.jpg"),
    },
    {
      id: 2,
      title: "Sleeping Dua",
      arabic: "اللّهُـمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
      translation: "O Allah, in Your name I die and I live.",
      translationUrdu: "اے اللہ! میں تیرے ہی نام کے ساتھ مرتا ہوں اور جیتا ہوں۔",
      tafseerEng: "Sleep is considered a minor death; this dua surrenders our soul back to Allah before sleeping.",
      tafseerUrdu: "نیند کو موت کی ایک شکل کہا گیا ہے، اس دعا کے ذریعے ہم سوتے وقت اپنی روح اللہ کے سپرد کرتے ہیں۔",
      caption: "Yahan aap sleeping dua ka caption likh sakti hain.",
      bg: require("../homeAssets/purpleCard.jpg"),
    },
    {
      id: 3,
      title: "Eating Dua",
      arabic: "بِسْمِ اللهِ وَعَلَى بَرَكَةِ الله",
      translation: "In the name of Allah and with Allah’s blessings.",
      translationUrdu: "اللہ کے نام کے ساتھ اور اللہ کی برکت پر (ہم نے کھانا شروع کیا)۔",
      tafseerEng: "Saying Allah's name over food brings barakah and keeps Shaytan away from sharing your meal.",
      tafseerUrdu: "کھانے پر اللہ کا نام لینے سے کھانے میں برکت ہوتی ہے اور شیطان اس رزق میں شریک نہیں ہو پاتا۔",
      caption: "Yahan khane ki dua ka caption aayega.",
      bg: require("../homeAssets/orangeCard.jpg"),
    },
    {
      id: 4,
      title: "Travel Dua",
      arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
      translation: "Glory is to the One who made this journey easy for us, as we could not do it ourselves.",
      translationUrdu: "پاک ہے وہ ذات جس نے اس سواری کو ہمارے قابو میں کر دیا جبکہ ہم اسے قابو میں کرنے والے نہ تھے۔",
      tafseerEng: "A prayer of gratitude acknowledging that human intelligence alone cannot master transportation safely without divine help.",
      tafseerUrdu: "سفر پر روانہ ہوتے وقت اللہ کا شکر ادا کرنے اور حادثات سے محفوظ رہنے کی بہترین مسنون دعا ہے۔",
      caption: "Safar ki dua ka caption yahan likhein.",
      bg: require("../homeAssets/pinkCard.jpg"),
    },
    {
      id: 5,
      title: "Parents Dua",
      arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
      translation: "My Lord, have mercy upon my parents as they raised me when I was young.",
      translationUrdu: "اے میرے رب! ان دونوں (والدین) پر رحم فرما جیسا کہ انہوں نے بچپن میں مجھے پالا۔",
      tafseerEng: "A beautiful Quranic command asking for absolute mercy, health, and forgiveness for our parents.",
      tafseerUrdu: "قرآن مجید کی یہ آیت والدین کے حقوق، ان کے ساتھ حسن سلوک اور ان کے لیے دعائے رحمت کا بہترین ذریعہ ہے۔",
      caption: "Walidain ki dua ka caption yahan add hoga.",
      bg: require("../homeAssets/greencardBg.jpg"),
    },
    {
      id: 6,
      title: "Before Study",
      arabic: "رَّبِّ زِدْنِي عِلْمًا",
      translation: "My Lord, increase me in knowledge.",
      translationUrdu: "اے میرے رب! میرے علم میں اضافہ فرما۔",
      tafseerEng: "A short yet immensely powerful prayer from the Quran asking for useful and pure knowledge.",
      tafseerUrdu: "علم نافع حاصل کرنے، حافظہ تیز کرنے اور پڑھائی میں آسانی کے لیے یہ قرآنی دعا نہایت مفید ہے۔",
      caption: "Ilm me izafe ki dua ka caption yahan likhein.",
      bg: require("../homeAssets/cyanCard.jpg"),
    },
    {
      id: 7,
      title: "Leaving Home",
      arabic: "بِسْمِ اللهِ تَوَكَّلْتُ عَلَى الله",
      translation: "In the name of Allah, I trust in Allah, there is no power except with Allah.",
      translationUrdu: "اللہ کے نام کے ساتھ، میں نے اللہ پر توکل کیا، اور گناہوں سے بچنے کی طاقت اور نیکی کی قوت اللہ ہی کی طرف سے ہے۔",
      tafseerEng: "When leaving home with this dua, angels respond saying that you have been guided, sufficed, and protected.",
      tafseerUrdu: "گھر سے نکلتے وقت یہ دعا پڑھنے سے انسان شیطان کے شر سے محفوظ ہو جاتا ہے اور فرشتے اس کی حفاظت کرتے ہیں۔",
      caption: "Ghar se nikalne ki dua ka caption.",
      bg: require("../homeAssets/blueCard.jpg"),
    },
    {
      id: 8,
      title: "Entering Home",
      arabic: "اللّهُـمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ",
      translation: "O Allah, I ask You for the best entrance and the best exit.",
      translationUrdu: "اے اللہ! میں تجھ سے داخل ہونے کی اور نکلنے کی بھلائی مانگتا ہوں۔",
      tafseerEng: "Entering your house with remembrance of Allah brings peace and dispels any negative presence from the household.",
      tafseerUrdu: "گھر میں داخل ہوتے وقت برکت اور سلامتی حاصل کرنے کے لیے یہ مسنون عمل اور دعا ہے۔",
      caption: "Ghar me dakhil hone ki dua ka caption.",
      bg: require("../homeAssets/purpleCard.jpg"),
    },
    {
      id: 9,
      title: "Dua for Forgiveness",
      arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
      translation: "Our Lord, forgive me and my parents and the believers the Day the account is established.",
      translationUrdu: "اے ہمارے رب! مجھے، میرے والدین کو اور سب ایمان والوں کو اس دن معاف کر دینا جس دن حساب قائم ہو گا۔",
      tafseerEng: "A comprehensive Quranic prayer of Prophet Ibrahim (AS) looking forward to safety on Judgment Day.",
      tafseerUrdu: "حضرت ابراہیم علیہ السلام کی یہ خوبصورت دعا اپنی، والدین کی اور تمام امت مسلمہ کی مغفرت کا احاطہ کرتی ہے۔",
      caption: "Maghfirat ki dua ka caption.",
      bg: require("../homeAssets/orangeCard.jpg"),
    },
    {
      id: 10,
      title: "Dua for Protection",
      arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ",
      translation: "In the name of Allah, with whose name nothing can cause harm on earth nor in heaven.",
      translationUrdu: "اللہ کے نام کے ساتھ، جس کے نام کی برکت سے زمین اور آسمان میں کوئی چیز نقصان نہیں پہنچا سکتی۔",
      tafseerEng: "Reciting this in the morning and evening forms a divine shield preventing sudden calamities or illness.",
      tafseerUrdu: "صبح و شام یہ دعا پڑھنے سے انسان ناگہانی آفتوں، زہریلی چیزوں اور بیماریوں سے اللہ کی پناہ میں آ جاتا ہے۔",
      caption: "Hifazat ki dua ka caption yahan aayega.",
      bg: require("../homeAssets/pinkCard.jpg"),
    },
  ];

  const filteredDuas = Duas.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- DUA DETAIL SCREEN ---------------- */
  if (selectedDua) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          {/* HEADER */}
          <ImageBackground
            source={require("../homeAssets/Quotebg.jpg")}
            style={styles.detailHeader}
            imageStyle={{
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            <BackButton onPress={() => setSelectedDua(null)} />
            <Text style={styles.detailTitle}>{selectedDua.title}</Text>
          </ImageBackground>

          {/* DETAIL CARD */}
          <View style={styles.detailCard}>
            <Text style={styles.sectionHeading}>Dua 🤲</Text>
            <Text style={styles.arabicText}>{selectedDua.arabic}</Text>

            <Text style={styles.sectionHeading}>Meaning & Translation 🌍</Text>
            <View style={styles.translationRow}>
              <Text style={styles.engMeaning}>{selectedDua.translation}</Text>
              <Text style={styles.urduMeaning}>{selectedDua.translationUrdu}</Text>
            </View>

            {/* AUDIO BUTTON */}
            <TouchableOpacity style={styles.audioButton}>
              <Ionicons name="volume-high" size={24} color="#fff" />
              <Text style={styles.audioText}>Play Audio Recitation</Text>
            </TouchableOpacity>

            {/* TAFSEER & IMPORTANCE */}
            <Text style={styles.sectionHeading}>Tafseer & Importance 📖</Text>
            <Text style={styles.tafseerEng}>{selectedDua.tafseerEng}</Text>
            <Text style={styles.tafseerUrdu}>{selectedDua.tafseerUrdu}</Text>

            {/* SIMPLE CARD (WITHOUT INTERNAL TEXT) */}
            <TouchableOpacity 
              style={styles.simpleCard}
              activeOpacity={0.8}
              onPress={() => {
                // Aap apna video ya koi bhi custom action yahan trigger kar sakti hain
              }}
            >
              <Ionicons name="play-circle" size={45} color="#FF0000" />
            </TouchableOpacity>

            {/* CAPTION UNDERNEATH THE CARD */}
            <Text style={styles.captionText}>
              {selectedDua.caption}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ---------------- MAIN DUA LIST SCREEN ---------------- */
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
          <Text style={styles.headerTitle}>Daily Duas 🤲</Text>
          <Text style={styles.headerSubtitle}>Select a dua to learn</Text>

          {/* SEARCH BAR */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={22} color="#777" />
            <TextInput
              placeholder="Search dua..."
              placeholderTextColor="#777"
              value={search}
              onChangeText={setSearch}
              style={styles.input}
            />
          </View>
        </ImageBackground>

        {/* DUA TITLE CARDS */}
        <View style={styles.cardsContainer}>
          {filteredDuas.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.cardWrapper}
              onPress={() => setSelectedDua(item)}
            >
              <ImageBackground
                source={item.bg}
                style={styles.card}
                imageStyle={{
                  borderRadius: 22,
                }}
              >
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={28} color="#fff" />
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={goBack}>
          <Ionicons name="home" size={28} color="#7A3DFF" />
          <Text style={[styles.navText, { color: "#7A3DFF" }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="book" size={28} color="#2FB65D" />
          <Text style={[styles.navText, { color: "#2FB65D" }]}>Learn</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DuasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  header: {
    paddingTop: 35,
    paddingBottom: 35,
    alignItems: "center",
  },
  detailHeader: {
    paddingTop: 35,
    paddingBottom: 50,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 20,
  },
  detailTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 25,
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
    paddingHorizontal: 18,
    paddingTop: 25,
    paddingBottom: 120,
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
  },
  cardTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  detailCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 28,
    padding: 24,
    elevation: 6,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4B2AA8",
    marginBottom: 12,
    marginTop: 22,
  },
  arabicText: {
    fontSize: 28,
    color: "#222",
    textAlign: "right",
    lineHeight: 52,
    marginBottom: 15,
    fontWeight: "700",
  },
  translationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  engMeaning: {
    fontSize: 16,
    color: "#333",
    width: "47%",
    fontWeight: "600",
    lineHeight: 24,
  },
  urduMeaning: {
    fontSize: 17,
    color: "#333",
    width: "47%",
    textAlign: "right",
    fontWeight: "600",
    lineHeight: 28,
  },
  audioButton: {
    backgroundColor: "#6C4DF7",
    paddingVertical: 16,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  audioText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  simpleCard: {
    height: 140,
    backgroundColor: "#F2F3F7",
    borderColor: "#E2E4E9",
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  captionText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
    fontStyle: "italic",
    paddingHorizontal: 10,
  },
  tafseerEng: {
    fontSize: 16,
    color: "#444",
    lineHeight: 28,
    marginBottom: 12,
  },
  tafseerUrdu: {
    fontSize: 17,
    color: "#444",
    lineHeight: 32,
    textAlign: "right",
  },
  navbar: {
    position: "absolute",
    bottom: 12,
    left: 15,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 35,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
    elevation: 12,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
  },
});