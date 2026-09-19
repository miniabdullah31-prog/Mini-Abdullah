import React, { useEffect } from "react";
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
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import { QAIDA_LESSONS } from "../data/nooraniQaida";
import { speakArabicFemale, stopSpeaking } from "../services/quranTts";

type Props = { goBack: () => void };

const NooraniQaidaScreen: React.FC<Props> = ({ goBack }) => {
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
      <BackButton
        onPress={() => {
          stopSpeaking();
          goBack();
        }}
      />
      <ImageBackground
        source={require("../homeAssets/Quotebg.jpg")}
        style={styles.header}
        imageStyle={styles.headerRadius}
      >
        <Text style={styles.headerTitle}>Noorani Qaida</Text>
        <Text style={styles.headerSub}>All letters on one page · Tap play</Text>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {QAIDA_LESSONS.map((item) => (
          <View key={item.id} style={styles.letterCard}>
            <View style={styles.topRow}>
              <Text style={styles.letterArabic}>{item.arabic}</Text>
              <TouchableOpacity
                style={styles.audioBtn}
                onPress={() => speakArabicFemale(item.arabic)}
              >
                <Ionicons name="volume-high" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.nameRow}>
              <Text style={styles.nameEn}>{item.title}</Text>
              <Text style={styles.nameUr}>{item.titleUrdu}</Text>
            </View>

            <Text style={styles.translit}>{item.transliteration}</Text>
            <Text style={styles.meaning}>{item.meaning}</Text>
            <Text style={styles.meaningUr}>{item.meaningUrdu}</Text>
            <Text style={styles.tip}>Tip: {item.tip}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NooraniQaidaScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  header: { paddingTop: 70, paddingBottom: 26, alignItems: "center" },
  headerRadius: { borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTitle: { color: "#fff", fontSize: 30, fontWeight: "bold" },
  headerSub: { color: "#EAE2FF", marginTop: 8, fontWeight: "600" },
  body: { padding: 16, paddingBottom: 40 },
  letterCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  letterArabic: {
    fontSize: 42,
    color: "#35158B",
    fontWeight: "700",
  },
  audioBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5B33C4",
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  nameEn: { color: "#5B33C4", fontWeight: "800", fontSize: 16 },
  nameUr: { color: "#5B33C4", fontWeight: "800", fontSize: 16 },
  translit: { color: "#777", fontWeight: "600", marginBottom: 8 },
  meaning: { color: "#333", fontSize: 14, lineHeight: 21, marginBottom: 6 },
  meaningUr: {
    color: "#444",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 8,
  },
  tip: {
    color: "#5B33C4",
    fontWeight: "600",
    fontSize: 13,
    backgroundColor: "#F0EBFF",
    padding: 10,
    borderRadius: 14,
    overflow: "hidden",
  },
});
