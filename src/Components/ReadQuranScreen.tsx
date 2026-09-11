import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  StatusBar,
  TextInput,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import SmoothPressable from "./SmoothPressable";
import GradCardDecor from "./GradCardDecor";
import HeaderSpark from "./HeaderSparkStar";
import { JUZ_LIST } from "../data/juzMeta";

type Props = {
  goBack: () => void;
  onOpenJuz: (juzNumber: number) => void;
};

const CARD_GRADIENTS = [
  ["#5B33C4", "#7B5CFF"],
  ["#1F8A70", "#3CB89A"],
  ["#2E6BFF", "#5AA0FF"],
  ["#C45C2A", "#E08A4F"],
  ["#8E2DE2", "#4A00E0"],
  ["#0F9B8E", "#34D1BF"],
];

const ReadQuranScreen: React.FC<Props> = ({ goBack, onOpenJuz }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return JUZ_LIST;
    }

    return JUZ_LIST.filter(
      (juz) =>
        String(juz.number).includes(q) ||
        juz.name.toLowerCase().includes(q) ||
        juz.nameArabic.includes(searchQuery.trim()) ||
        juz.range.toLowerCase().includes(q) ||
        `para ${juz.number}`.includes(q) ||
        `juz ${juz.number}`.includes(q),
    );
  }, [searchQuery]);

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
          <Image
            source={require("../homeAssets/quran.png")}
            style={styles.headerImage}
          />

          <Text style={styles.headerTitle}>Read Quran</Text>
          <Text style={styles.headerSubtitle}>
            30 Paras · Offline text · female voice
          </Text>
          <HeaderSpark />
        </ImageBackground>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={22}
            color="#777"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search para number or name..."
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

        <Text style={styles.sectionTitle}>All 30 Paras</Text>

        <View style={styles.cardsContainer}>
          {filtered.map((juz) => {
            const colors =
              CARD_GRADIENTS[(juz.number - 1) % CARD_GRADIENTS.length];

            return (
              <SmoothPressable
                key={juz.number}
                radius={20}
                style={styles.cardWrapper}
                onPress={() => onOpenJuz(juz.number)}
              >
                <LinearGradient
                  colors={colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <GradCardDecor />
                  <View style={styles.cardTopRow}>
                    <View style={styles.paraBadge}>
                      <Text style={styles.paraBadgeText}>Para {juz.number}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={22} color="#fff" />
                  </View>

                  <Text style={styles.cardArabic}>{juz.nameArabic}</Text>
                  <Text style={styles.cardTitle}>{juz.name}</Text>
                  <Text style={styles.cardSubtitle}>{juz.range}</Text>
                </LinearGradient>
              </SmoothPressable>
            );
          })}

          {filtered.length === 0 && (
            <Text style={styles.noResultText}>No para found 🔍</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReadQuranScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  header: {
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: "center",
  },
  headerImage: {
    width: 130,
    height: 130,
    resizeMode: "contain",
    marginTop: 30,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 10,
  },
  headerSubtitle: {
    color: "#EAE2FF",
    fontSize: 16,
    marginTop: 10,
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#35158B",
    marginTop: 28,
    marginLeft: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 16,
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 28,
    overflow: "hidden",
  },
  card: {
    borderRadius: 28,
    padding: 20,
    overflow: "hidden",
    position: "relative",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  paraBadge: {
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paraBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  cardArabic: {
    color: "#fff",
    fontSize: 28,
    textAlign: "right",
    fontWeight: "700",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#F3EEFF",
    marginTop: 6,
    fontWeight: "600",
  },
  noResultText: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
    marginTop: 20,
  },
});
