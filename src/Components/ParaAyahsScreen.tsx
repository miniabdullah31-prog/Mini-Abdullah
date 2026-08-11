import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import { JUZ_LIST } from "../data/juzMeta";
import {
  getJuzAyahs,
  QuranAyah,
  TranslationLang,
} from "../services/quranService";
import { speakArabicFemale, stopSpeaking } from "../services/quranTts";

type Props = {
  juzNumber: number;
  goBack: () => void;
};

const ParaAyahsScreen: React.FC<Props> = ({ juzNumber, goBack }) => {
  const juzMeta = JUZ_LIST.find((j) => j.number === juzNumber);

  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [translationLang, setTranslationLang] =
    useState<TranslationLang>("off");
  const [playingId, setPlayingId] = useState<number | null>(null);

  const loadJuz = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getJuzAyahs(juzNumber);
      setAyahs(data);
    } catch (e: any) {
      setError(e?.message || "Could not load this para.");
    } finally {
      setLoading(false);
    }
  }, [juzNumber]);

  useEffect(() => {
    loadJuz();
    return () => {
      stopSpeaking();
    };
  }, [loadJuz]);

  const handlePlay = async (ayah: QuranAyah) => {
    if (playingId === ayah.id) {
      stopSpeaking();
      setPlayingId(null);
      return;
    }
    setPlayingId(ayah.id);
    await speakArabicFemale(ayah.arabic);
  };

  const renderAyah = ({ item }: { item: QuranAyah }) => {
    const translation =
      translationLang === "en"
        ? item.translationEn
        : translationLang === "ur"
          ? item.translationUr
          : "";

    return (
      <View style={styles.ayahCard}>
        <View style={styles.ayahTop}>
          <View style={styles.ayahBadge}>
            <Text style={styles.ayahBadgeText}>{item.verseKey}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.audioBtn,
              playingId === item.id && styles.audioBtnActive,
            ]}
            onPress={() => handlePlay(item)}
          >
            <Ionicons
              name={playingId === item.id ? "stop" : "play"}
              size={16}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.arabicText}>{item.arabic}</Text>

        {translationLang !== "off" && !!translation && (
          <Text
            style={[
              styles.ayahTranslation,
              translationLang === "ur" && styles.ayahTranslationUr,
            ]}
          >
            {translation}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />

      <ImageBackground
        source={require("../homeAssets/Quotebg.jpg")}
        style={styles.header}
        imageStyle={styles.headerRadius}
      >
        <BackButton
          onPress={() => {
            stopSpeaking();
            goBack();
          }}
        />
        <Text style={styles.headerTitle}>Para {juzNumber}</Text>
        <Text style={styles.headerArabic}>{juzMeta?.nameArabic || ""}</Text>
        <Text style={styles.headerSubtitle}>
          {juzMeta?.name || ""} · {juzMeta?.range || ""}
        </Text>
      </ImageBackground>

      <View style={styles.langRow}>
        {(["off", "ur", "en"] as TranslationLang[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.langChip,
              translationLang === mode && styles.langChipActive,
            ]}
            onPress={() => setTranslationLang(mode)}
          >
            <Text
              style={[
                styles.langChipText,
                translationLang === mode && styles.langChipTextActive,
              ]}
            >
              {mode === "off" ? "Arabic" : mode === "ur" ? "Urdu" : "English"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#5B33C4" />
          <Text style={styles.loaderText}>Opening para...</Text>
        </View>
      )}

      {!loading && error ? (
        <View style={styles.loaderBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadJuz}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!loading && !error && (
        <FlatList
          data={ayahs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderAyah}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default ParaAyahsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  header: {
    paddingTop: 70,
    paddingBottom: 24,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerRadius: { borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTitle: { color: "#fff", fontSize: 30, fontWeight: "bold" },
  headerArabic: { color: "#fff", fontSize: 26, marginTop: 6, fontWeight: "700" },
  headerSubtitle: {
    color: "#EAE2FF",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  langRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
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
  loaderBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loaderText: { marginTop: 12, color: "#666", fontSize: 15, fontWeight: "600" },
  errorText: { color: "#C0392B", textAlign: "center", marginBottom: 16 },
  retryBtn: {
    backgroundColor: "#5B33C4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },
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
    marginBottom: 12,
  },
  ayahBadge: {
    backgroundColor: "#5B33C4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
  arabicText: {
    fontSize: 26,
    lineHeight: 44,
    color: "#1a1a1a",
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
  },
  ayahTranslation: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 24,
    color: "#444",
    textAlign: "left",
  },
  ayahTranslationUr: {
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 16,
    lineHeight: 28,
  },
});
