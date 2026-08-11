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
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import { TAJWEED_RULES } from "../data/tajweed";
import { speakArabic, stopSpeaking } from "../services/quranTts";

type Props = { goBack: () => void };

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TajweedScreen: React.FC<Props> = ({ goBack }) => {
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const toggle = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
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
        <Text style={styles.headerTitle}>Tajweed</Text>
        <Text style={styles.headerSub}>Simple rules · Tap a card</Text>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {TAJWEED_RULES.map((item) => {
          const open = openId === item.id;
          return (
            <View key={item.id} style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => toggle(item.id)}
                style={styles.cardHead}
              >
                <View style={styles.headTexts}>
                  <Text style={styles.headEn}>{item.title}</Text>
                  <Text style={styles.headUr}>{item.titleUrdu}</Text>
                </View>
                <Ionicons
                  name={open ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#5B33C4"
                />
              </TouchableOpacity>

              {open && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoEn}>{item.summary}</Text>
                  <Text style={styles.infoUr}>{item.summaryUrdu}</Text>

                  {item.points.map((p, i) => (
                    <Text key={i} style={styles.point}>
                      • {p}
                    </Text>
                  ))}

                  <View style={styles.exampleRow}>
                    <Text style={styles.example}>{item.example}</Text>
                    <TouchableOpacity
                      style={styles.audioBtn}
                      onPress={() => speakArabic(item.example)}
                    >
                      <Ionicons name="volume-high" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.note}>{item.exampleNote}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TajweedScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  header: { paddingTop: 70, paddingBottom: 26, alignItems: "center" },
  headerRadius: { borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTitle: { color: "#fff", fontSize: 30, fontWeight: "bold" },
  headerSub: { color: "#EAE2FF", marginTop: 8, fontWeight: "600" },
  body: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 12,
    elevation: 3,
    overflow: "hidden",
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  headTexts: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headEn: { color: "#35158B", fontWeight: "800", fontSize: 15, flex: 1 },
  headUr: {
    color: "#5B33C4",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "right",
    flex: 1,
  },
  infoBox: {
    borderTopWidth: 1,
    borderTopColor: "#F0EBFF",
    padding: 16,
    backgroundColor: "#FAF8FF",
  },
  infoEn: { color: "#333", fontSize: 14, lineHeight: 22, marginBottom: 8 },
  infoUr: {
    color: "#444",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 12,
  },
  point: { color: "#333", fontSize: 14, lineHeight: 22, marginBottom: 6 },
  exampleRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  example: {
    flex: 1,
    color: "#35158B",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 28,
  },
  audioBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5B33C4",
    alignItems: "center",
    justifyContent: "center",
  },
  note: { marginTop: 8, color: "#777", fontSize: 12, fontWeight: "600" },
});
