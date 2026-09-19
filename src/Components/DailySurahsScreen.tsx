import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  TextInput,
  ScrollView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import SmoothPressable from "./SmoothPressable";
import GradCardDecor from "./GradCardDecor";
import HeaderSpark from "./HeaderSparkStar";
import { DAILY_SURAHS, DailySurah } from "../data/dailySurahs";
import { speakArabicFemale, stopSpeaking } from "../services/quranTts";
import { useFeatureBackHandler } from "../hooks/useFeatureBackHandler";

type Props = { goBack: () => void };
type TranslationMode = "off" | "en" | "ur";

const GRADIENTS = [
  ["#C45C2A", "#E08A4F"],
  ["#5B33C4", "#7B5CFF"],
  ["#1F8A70", "#3CB89A"],
  ["#2E6BFF", "#5AA0FF"],
  ["#8E2DE2", "#4A00E0"],
];

const DailySurahsScreen: React.FC<Props> = ({ goBack }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DailySurah | null>(null);
  const [translation, setTranslation] = useState<TranslationMode>("off");
  const [playingId, setPlayingId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DAILY_SURAHS;
    return DAILY_SURAHS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nameUrdu.includes(search.trim()) ||
        s.nameArabic.includes(search.trim()) ||
        String(s.number).includes(q),
    );
  }, [search]);

  const closeDetail = useCallback(() => {
    stopSpeaking();
    setPlayingId(null);
    setSelected(null);
    setTranslation("off");
  }, []);

  useFeatureBackHandler(
    useCallback(() => {
      if (selected) {
        closeDetail();
        return true;
      }
      return false;
    }, [selected, closeDetail]),
    [selected, closeDetail],
  );

  const handlePlay = async (globalId: number, arabic: string) => {
    if (playingId === globalId) {
      stopSpeaking();
      setPlayingId(null);
      return;
    }
    setPlayingId(globalId);
    await speakArabicFemale(arabic);
  };

  if (selected) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
        <BackButton onPress={closeDetail} />
        <ImageBackground
          source={require("../homeAssets/Quotebg.jpg")}
          style={styles.detailHeader}
          imageStyle={styles.headerRadius}
        >
          <Text style={styles.headerTitle}>{selected.name}</Text>
          <Text style={styles.headerArabic}>{selected.nameArabic}</Text>
          <Text style={styles.headerSub}>
            Surah {selected.number} · {selected.ayahCount} ayahs
          </Text>
        </ImageBackground>

        <View style={styles.langRow}>
          {(["off", "ur", "en"] as TranslationMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.langChip, translation === mode && styles.langChipActive]}
              onPress={() => setTranslation(mode)}
            >
              <Text
                style={[
                  styles.langChipText,
                  translation === mode && styles.langChipTextActive,
                ]}
              >
                {mode === "off" ? "Arabic" : mode === "ur" ? "Urdu" : "English"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.detailBody}>
          <Text style={styles.themeText}>{selected.theme}</Text>

          {selected.ayahs.map((ayah) => (
            <View key={ayah.number} style={styles.ayahCard}>
              <View style={styles.ayahTop}>
                <View style={styles.ayahBadge}>
                  <Text style={styles.ayahBadgeText}>{ayah.number}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.audioBtn,
                    playingId === ayah.globalId && styles.audioBtnActive,
                  ]}
                  onPress={() => handlePlay(ayah.globalId, ayah.arabic)}
                >
                  <Ionicons
                    name={playingId === ayah.globalId ? "stop" : "play"}
                    size={16}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.ayahArabic}>{ayah.arabic}</Text>
              {translation === "en" && (
                <Text style={styles.ayahEn}>{ayah.translationEn}</Text>
              )}
              {translation === "ur" && (
                <Text style={styles.ayahUr}>{ayah.translationUr}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
      <BackButton onPress={goBack} />
      <ImageBackground
        source={require("../homeAssets/Quotebg.jpg")}
        style={styles.header}
        imageStyle={styles.headerRadius}
      >
        <Text style={styles.headerTitle}>Daily Surahs</Text>
        <Text style={styles.headerSub}>Short surahs · Memorize offline</Text>
        <HeaderSpark />
      </ImageBackground>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search surah..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <SmoothPressable
            radius={22}
            onPress={() => setSelected(item)}
            style={styles.cardWrap}
          >
            <LinearGradient
              colors={GRADIENTS[index % GRADIENTS.length]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <GradCardDecor />
              <View style={styles.numBadge}>
                <Text style={styles.numBadgeText}>{item.number}</Text>
              </View>
              <View style={styles.cardTextCol}>
                <Text style={styles.cardArabic}>{item.nameArabic}</Text>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>
                  {item.nameUrdu} · {item.ayahCount} ayahs
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </LinearGradient>
          </SmoothPressable>
        )}
      />
    </SafeAreaView>
  );
};

export default DailySurahsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  header: { paddingTop: 70, paddingBottom: 28, alignItems: "center" },
  detailHeader: {
    paddingTop: 70,
    paddingBottom: 24,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerRadius: { borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTitle: { color: "#fff", fontSize: 30, fontWeight: "bold" },
  headerArabic: { color: "#fff", fontSize: 26, marginTop: 4, fontWeight: "700" },
  headerSub: { color: "#EAE2FF", marginTop: 8, fontWeight: "600", textAlign: "center" },
  searchBox: {
    marginHorizontal: 20,
    marginTop: -18,
    backgroundColor: "#fff",
    borderRadius: 22,
    height: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    gap: 8,
  },
  searchInput: { flex: 1, color: "#333", fontWeight: "600" },
  list: { padding: 16, paddingBottom: 40 },
  cardWrap: { marginBottom: 12, borderRadius: 22, overflow: "hidden" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 22,
    gap: 12,
    overflow: "hidden",
    position: "relative",
  },
  numBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  numBadgeText: { color: "#fff", fontWeight: "800" },
  cardTextCol: { flex: 1 },
  cardArabic: { color: "#fff", fontSize: 22, fontWeight: "700", textAlign: "right" },
  cardTitle: { color: "#fff", fontSize: 17, fontWeight: "700", marginTop: 2 },
  cardSub: { color: "#F3EEFF", marginTop: 4, fontWeight: "600", fontSize: 13 },
  langRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  langChip: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6DEFF",
  },
  langChipActive: { backgroundColor: "#5B33C4", borderColor: "#5B33C4" },
  langChipText: { color: "#5B33C4", fontWeight: "700", fontSize: 13 },
  langChipTextActive: { color: "#fff" },
  detailBody: { padding: 16, paddingBottom: 40 },
  themeText: { color: "#666", fontWeight: "600", marginBottom: 12, lineHeight: 20 },
  ayahCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  ayahTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  ayahBadge: {
    backgroundColor: "#5B33C4",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ayahBadgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  audioBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5B33C4",
    alignItems: "center",
    justifyContent: "center",
  },
  audioBtnActive: { backgroundColor: "#2E8B57" },
  ayahArabic: {
    fontSize: 24,
    lineHeight: 42,
    color: "#1a1a1a",
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
  },
  ayahEn: { marginTop: 12, color: "#444", fontSize: 15, lineHeight: 23 },
  ayahUr: {
    marginTop: 12,
    color: "#444",
    fontSize: 16,
    lineHeight: 28,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
