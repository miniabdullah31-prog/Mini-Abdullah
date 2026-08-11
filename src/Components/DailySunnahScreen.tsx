import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import GradCardDecor from "./GradCardDecor";
import HeaderSpark from "./HeaderSparkStar";
import { DAILY_SUNNAHS, DailySunnah } from "../data/dailySunnahs";
import { speakArabicFemale, stopSpeaking } from "../services/quranTts";

type Props = { goBack: () => void };
type LangMode = "ur" | "en";

const DailySunnahScreen: React.FC<Props> = ({ goBack }) => {
  const [selected, setSelected] = useState<DailySunnah | null>(null);
  const [lang, setLang] = useState<LangMode>("en");

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (selected) {
    const isUrdu = lang === "ur";

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
        <BackButton
          onPress={() => {
            stopSpeaking();
            setLang("en");
            setSelected(null);
          }}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <ImageBackground
            source={require("../homeAssets/Quotebg.jpg")}
            style={styles.header}
            imageStyle={styles.headerRadius}
          >
            <View style={styles.titleRow}>
              <Text style={styles.titleEn}>{selected.title}</Text>
              <Text style={styles.titleUr}>{selected.titleUrdu}</Text>
            </View>
          </ImageBackground>

          <View style={styles.langRow}>
            {(["ur", "en"] as LangMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.langChip, lang === mode && styles.langChipActive]}
                onPress={() => setLang(mode)}
              >
                <Text
                  style={[
                    styles.langChipText,
                    lang === mode && styles.langChipTextActive,
                  ]}
                >
                  {mode === "ur" ? "Urdu" : "English"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.detailCard}>
            {!!selected.arabic && (
              <View style={styles.arabicBox}>
                <View style={styles.arabicRow}>
                  <TouchableOpacity
                    style={styles.audioBtn}
                    onPress={() => speakArabicFemale(selected.arabic || "")}
                  >
                    <Ionicons name="volume-high" size={16} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.arabic}>{selected.arabic}</Text>
                </View>
              </View>
            )}

            <Text style={[styles.heading, isUrdu && styles.headingUr]}>
              {isUrdu ? "معنی" : "Meaning"}
            </Text>
            <Text style={isUrdu ? styles.bodyUr : styles.bodyEn}>
              {isUrdu ? selected.meaningUrdu : selected.meaningEn}
            </Text>

            <Text style={[styles.heading, isUrdu && styles.headingUr]}>
              {isUrdu ? "کیسے کریں" : "How to Practice"}
            </Text>
            <Text style={isUrdu ? styles.bodyUr : styles.bodyEn}>
              {isUrdu ? selected.howUrdu : selected.howEn}
            </Text>

            <View style={styles.prophetBox}>
              <Text style={[styles.prophetHeading, isUrdu && styles.headingUr]}>
                {isUrdu ? "نبی ﷺ کی مثال" : "From Our Prophet ﷺ"}
              </Text>
              <Text style={isUrdu ? styles.prophetUr : styles.prophetEn}>
                {isUrdu ? selected.prophetUrdu : selected.prophetEn}
              </Text>
            </View>

            <Text style={[styles.heading, isUrdu && styles.headingUr]}>
              {isUrdu ? "فائدہ" : "Benefit"}
            </Text>
            <Text style={isUrdu ? styles.bodyUr : styles.bodyEn}>
              {isUrdu ? selected.benefitUrdu : selected.benefitEn}
            </Text>

            <Text style={[styles.heading, isUrdu && styles.headingUr]}>
              {isUrdu ? "ٹپ" : "Tip"}
            </Text>
            <Text style={isUrdu ? styles.bodyUr : styles.bodyEn}>
              {isUrdu ? selected.tipUrdu : selected.tipEn}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
      <BackButton onPress={goBack} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require("../homeAssets/Quotebg.jpg")}
          style={styles.header}
          imageStyle={styles.headerRadius}
        >
          <Text style={styles.headerTitle}>Daily Sunnah</Text>
          <Text style={styles.headerSub}>
            Everyday Prophet ﷺ habits · Offline
          </Text>
          <HeaderSpark />
        </ImageBackground>

        <Text style={styles.sectionTitle}>Today's Habits</Text>

        <View style={styles.cardsContainer}>
          {DAILY_SUNNAHS.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.cardWrapper}
              onPress={() => {
                setLang("en");
                setSelected(item);
              }}
            >
              <LinearGradient
                colors={item.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <GradCardDecor />
                <View style={styles.iconCircle}>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                </View>
                <View style={styles.cardTextCol}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitleEn}>
                      {item.id}. {item.title}
                    </Text>
                    <Text style={styles.cardTitleUr}>{item.titleUrdu}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFFCC" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DailySunnahScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  header: {
    paddingTop: 70,
    paddingBottom: 36,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerRadius: { borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
  },
  headerSub: {
    color: "#EAE2FF",
    fontSize: 15,
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  titleRow: {
    width: "100%",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  titleEn: { color: "#fff", fontSize: 22, fontWeight: "800", flex: 1 },
  titleUr: {
    color: "#EAE2FF",
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#35158B",
    marginTop: 24,
    marginLeft: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
  },
  card: {
    minHeight: 88,
    borderRadius: 20,
    paddingVertical: 20,
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
  cardTextCol: { flex: 1 },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitleEn: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    flex: 1,
  },
  cardTitleUr: {
    color: "#F3EEFF",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
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
  detailCard: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    elevation: 3,
  },
  arabicBox: {
    backgroundColor: "#FAF8FF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  arabicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  audioBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5B33C4",
    alignItems: "center",
    justifyContent: "center",
  },
  arabic: {
    flex: 1,
    fontSize: 24,
    color: "#1a1a1a",
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "700",
  },
  heading: {
    marginTop: 14,
    marginBottom: 8,
    color: "#4B2AA8",
    fontWeight: "800",
    fontSize: 18,
  },
  headingUr: { textAlign: "right", writingDirection: "rtl" },
  bodyEn: { color: "#333", fontSize: 16, lineHeight: 26, fontWeight: "600" },
  bodyUr: {
    color: "#333",
    fontSize: 17,
    lineHeight: 30,
    fontWeight: "600",
    textAlign: "right",
    writingDirection: "rtl",
  },
  prophetBox: {
    marginTop: 16,
    backgroundColor: "#F4F0FF",
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#5B33C4",
  },
  prophetHeading: {
    color: "#5B33C4",
    fontWeight: "800",
    fontSize: 17,
    marginBottom: 8,
  },
  prophetEn: {
    color: "#3A2A6B",
    fontSize: 15,
    lineHeight: 25,
    fontWeight: "600",
    fontStyle: "italic",
  },
  prophetUr: {
    color: "#3A2A6B",
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "600",
    textAlign: "right",
    writingDirection: "rtl",
  },
});
