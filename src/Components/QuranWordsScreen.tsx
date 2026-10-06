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
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import SmoothPressable from "./SmoothPressable";
import { QURAN_WORDS, QuranWord } from "../data/quranWords";
import { speakArabicFemale, stopSpeaking } from "../services/quranTts";
import { useFeatureBackHandler } from "../hooks/useFeatureBackHandler";

type Props = { goBack: () => void };

const QuranWordsScreen: React.FC<Props> = ({ goBack }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<QuranWord | null>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return QURAN_WORDS;
    return QURAN_WORDS.filter(
      (w) =>
        w.transliteration.toLowerCase().includes(q) ||
        w.meaningEn.toLowerCase().includes(q) ||
        w.meaningUr.includes(search.trim()) ||
        w.arabic.includes(search.trim()) ||
        w.singular.includes(search.trim()) ||
        w.dual.includes(search.trim()) ||
        w.plural.includes(search.trim()),
    );
  }, [search]);

  useFeatureBackHandler(
    useCallback(() => {
      if (selected) {
        stopSpeaking();
        setSelected(null);
        return true;
      }
      return false;
    }, [selected]),
    [selected],
  );

  if (selected) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
        <BackButton
          onPress={() => {
            stopSpeaking();
            setSelected(null);
          }}
        />
        <ImageBackground
          source={require("../homeAssets/Quotebg.jpg")}
          style={styles.detailHeader}
          imageStyle={styles.headerRadius}
        >
          <Text style={styles.headerTitle}>{selected.transliteration}</Text>
          <Text style={styles.headerSub}>{selected.meaningEn}</Text>
        </ImageBackground>

        <ScrollView contentContainerStyle={styles.detailBody}>
          <View style={styles.mainCard}>
            <View style={styles.mainTop}>
              <Text style={styles.mainArabic}>{selected.arabic}</Text>
              <TouchableOpacity
                style={styles.audioBtn}
                onPress={() => speakArabicFemale(selected.arabic)}
              >
                <Ionicons name="volume-high" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.mainUr}>{selected.meaningUr}</Text>
            <Text style={styles.detailCount}>
              {typeof selected.occurrences === "number"
                ? `Occurrences in Qur'an: ${selected.occurrences}`
                : "Occurrences in Qur'an: —"}
            </Text>
          </View>

          {[
            { label: "Singular", labelUr: "واحد", value: selected.singular },
            { label: "Dual (Tasniya)", labelUr: "تثنیہ", value: selected.dual },
            { label: "Plural", labelUr: "جمع", value: selected.plural },
          ].map((row) => (
            <View key={row.label} style={styles.formCard}>
              <View style={styles.formHead}>
                <Text style={styles.formLabel}>{row.label}</Text>
                <Text style={styles.formLabelUr}>{row.labelUr}</Text>
              </View>
              <View style={styles.formRow}>
                <Text style={styles.formArabic}>{row.value}</Text>
                <TouchableOpacity
                  style={styles.audioBtnSmall}
                  onPress={() => speakArabicFemale(row.value)}
                >
                  <Ionicons name="volume-high" size={15} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {!!selected.note && (
            <Text style={styles.note}>Note: {selected.note}</Text>
          )}
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
        <Text style={styles.headerTitle}>Common Quran Words</Text>
        <Text style={styles.headerSub}>High-frequency words · Offline</Text>
      </ImageBackground>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search هو، لهم، کتاب..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.rowCard}>
            <Text style={styles.rowArabic}>{item.arabic}</Text>
            <View style={styles.rowMid}>
              <Text style={styles.rowTitle}>{item.transliteration}</Text>
              <Text style={styles.rowSub}>{item.meaningEn}</Text>
              <Text style={styles.rowUr}>{item.meaningUr}</Text>
              <Text style={styles.rowCount}>
                {typeof item.occurrences === "number"
                  ? `Occurrences: ${item.occurrences}`
                  : "Occurrences: —"}
              </Text>
              <SmoothPressable
                radius={14}
                style={styles.detailsBtn}
                onPress={() => setSelected(item)}
              >
                <Text style={styles.detailsBtnText}>Click to View Details</Text>
              </SmoothPressable>
            </View>
            <TouchableOpacity
              style={styles.audioBtnSmall}
              onPress={() => speakArabicFemale(item.arabic)}
            >
              <Ionicons name="volume-high" size={15} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default QuranWordsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  header: { paddingTop: 70, paddingBottom: 28, alignItems: "center", paddingHorizontal: 16 },
  detailHeader: { paddingTop: 70, paddingBottom: 24, alignItems: "center" },
  headerRadius: { borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "bold", textAlign: "center" },
  headerSub: { color: "#EAE2FF", marginTop: 8, fontWeight: "600" },
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
  rowCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    elevation: 2,
  },
  rowArabic: {
    fontSize: 24,
    color: "#35158B",
    fontWeight: "700",
    minWidth: 64,
    textAlign: "center",
    marginTop: 4,
  },
  rowMid: { flex: 1 },
  rowTitle: { color: "#35158B", fontWeight: "800", fontSize: 15 },
  rowSub: { color: "#555", marginTop: 2, fontSize: 13 },
  rowUr: { color: "#5B33C4", marginTop: 2, fontWeight: "600", fontSize: 13, textAlign: "right" },
  rowCount: {
    marginTop: 6,
    color: "#6B6288",
    fontWeight: "700",
    fontSize: 12,
  },
  detailsBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#5B33C4",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  detailsBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },
  audioBtnSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5B33C4",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  detailBody: { padding: 16, paddingBottom: 40 },
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
  },
  mainTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainArabic: { fontSize: 40, color: "#35158B", fontWeight: "700" },
  audioBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#5B33C4",
    alignItems: "center",
    justifyContent: "center",
  },
  mainUr: {
    marginTop: 10,
    color: "#444",
    fontSize: 16,
    textAlign: "right",
    writingDirection: "rtl",
  },
  detailCount: {
    marginTop: 10,
    color: "#5B33C4",
    fontWeight: "700",
    fontSize: 14,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  formHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  formLabel: { color: "#5B33C4", fontWeight: "800" },
  formLabelUr: { color: "#5B33C4", fontWeight: "800" },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  formArabic: {
    fontSize: 22,
    color: "#1a1a1a",
    fontWeight: "700",
    textAlign: "right",
    writingDirection: "rtl",
    flex: 1,
    marginRight: 10,
  },
  note: {
    marginTop: 6,
    color: "#777",
    fontWeight: "600",
    backgroundColor: "#F0EBFF",
    padding: 12,
    borderRadius: 14,
  },
});
