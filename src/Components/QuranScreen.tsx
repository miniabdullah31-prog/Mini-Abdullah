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
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import GradCardDecor from "./GradCardDecor";
import HeaderSpark from "./HeaderSparkStar";
import SmoothPressable from "./SmoothPressable";
import ReadQuranScreen from "./ReadQuranScreen";
import ParaAyahsScreen from "./ParaAyahsScreen";
import NooraniQaidaScreen from "./NooraniQaidaScreen";
import TajweedScreen from "./TajweedScreen";
import QuranWordsScreen from "./QuranWordsScreen";
import DailySurahsScreen from "./DailySurahsScreen";
import { useFeatureBackHandler } from "../hooks/useFeatureBackHandler";

type Props = {
  goBack: () => void;
};

type QuranView =
  | "hub"
  | "qaida"
  | "tajweed"
  | "read"
  | "para"
  | "words"
  | "surahs";

const HUB_CARDS = [
  {
    id: 1,
    title: "Noorani Qaida",
    subtitle: "All letters · meaning & audio",
    icon: "book" as const,
    colors: ["#1F8A70", "#3CB89A"],
  },
  {
    id: 2,
    title: "Tajweed",
    subtitle: "Simple rules · EN & UR",
    icon: "musical-notes" as const,
    colors: ["#2E6BFF", "#5AA0FF"],
  },
  {
    id: 3,
    title: "Read Quran",
    subtitle: "30 paras · offline · female voice",
    icon: "book-outline" as const,
    colors: ["#0F9B8E", "#34D1BF"],
  },
  {
    id: 4,
    title: "Common Quran Words",
    subtitle: "هو · لهم · تثنیہ · جمع",
    icon: "text" as const,
    colors: ["#7B2FF7", "#5B33C4"],
  },
  {
    id: 5,
    title: "Daily Surahs",
    subtitle: "Short surahs · play ayah audio",
    icon: "moon" as const,
    colors: ["#C45C2A", "#E08A4F"],
  },
];

const QuranScreen: React.FC<Props> = ({ goBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<QuranView>("hub");
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);

  const filteredCards = HUB_CARDS.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCardPress = (cardId: number) => {
    if (cardId === 1) setView("qaida");
    if (cardId === 2) setView("tajweed");
    if (cardId === 3) setView("read");
    if (cardId === 4) setView("words");
    if (cardId === 5) setView("surahs");
  };

  useFeatureBackHandler(
    useCallback(() => {
      if (view === "para" && (selectedJuz != null || selectedSurah != null)) {
        setSelectedJuz(null);
        setSelectedSurah(null);
        setView("read");
        return true;
      }
      if (view !== "hub") {
        setView("hub");
        return true;
      }
      return false;
    }, [view, selectedJuz, selectedSurah]),
    [view, selectedJuz, selectedSurah],
  );

  if (view === "para" && selectedSurah != null) {
    return (
      <ParaAyahsScreen
        mode="surah"
        surahNumber={selectedSurah}
        goBack={() => {
          setSelectedSurah(null);
          setView("read");
        }}
      />
    );
  }

  if (view === "para" && selectedJuz != null) {
    return (
      <ParaAyahsScreen
        mode="para"
        juzNumber={selectedJuz}
        goBack={() => {
          setSelectedJuz(null);
          setView("read");
        }}
      />
    );
  }

  if (view === "read") {
    return (
      <ReadQuranScreen
        goBack={() => setView("hub")}
        onOpenJuz={(juzNumber) => {
          setSelectedSurah(null);
          setSelectedJuz(juzNumber);
          setView("para");
        }}
        onOpenSurah={(surahNumber) => {
          setSelectedJuz(null);
          setSelectedSurah(surahNumber);
          setView("para");
        }}
      />
    );
  }

  if (view === "qaida") {
    return <NooraniQaidaScreen goBack={() => setView("hub")} />;
  }

  if (view === "tajweed") {
    return <TajweedScreen goBack={() => setView("hub")} />;
  }

  if (view === "words") {
    return <QuranWordsScreen goBack={() => setView("hub")} />;
  }

  if (view === "surahs") {
    return <DailySurahsScreen goBack={() => setView("hub")} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
      <BackButton onPress={goBack} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require("../homeAssets/Quotebg.jpg")}
          style={styles.header}
          imageStyle={{
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}
        >
          <Text style={styles.headerTitle}>Quran Learning</Text>
          <Text style={styles.headerSubtitle}>
            Offline · clear · light to use
          </Text>
          <HeaderSpark />
        </ImageBackground>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics, surahs..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Start Learning</Text>

        <View style={styles.cardsContainer}>
          {filteredCards.map((item) => (
            <SmoothPressable
              key={item.id}
              radius={20}
              style={styles.cardWrapper}
              onPress={() => handleCardPress(item.id)}
            >
              <LinearGradient
                colors={item.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <GradCardDecor />
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon} size={24} color="#fff" />
                </View>
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFFCC" />
              </LinearGradient>
            </SmoothPressable>
          ))}

          {filteredCards.length === 0 && (
            <Text style={styles.noResultText}>No results found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QuranScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  header: {
    paddingTop: 70,
    paddingBottom: 36,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
  },
  headerSubtitle: {
    color: "#EAE2FF",
    fontSize: 15,
    marginTop: 8,
    fontWeight: "600",
  },
  searchContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#35158B",
    marginTop: 28,
    marginLeft: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 14,
  },
  cardWrapper: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
    position: "relative",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#F3EEFF",
    marginTop: 4,
    lineHeight: 18,
    fontWeight: "600",
  },
  noResultText: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
    marginTop: 20,
  },
});
