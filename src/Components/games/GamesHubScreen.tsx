import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  StatusBar,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "../BackButton";
import SmoothPressable from "../SmoothPressable";
import HeaderSpark from "../HeaderSparkStar";
import GameLauncher from "./GameLauncher";
import { playUiSound } from "../../services/soundService";
import {
  filterGames,
  GameId,
  getHubStats,
  HUB_COPY,
} from "../../data/gameRegistry";

type Props = { goBack: () => void };

const GamesHubScreen: React.FC<Props> = ({ goBack }) => {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [search, setSearch] = useState("");
  const stats = getHubStats();

  const filtered = useMemo(() => filterGames(search), [search]);

  if (activeGame) {
    return (
      <GameLauncher gameId={activeGame} onExitToHub={() => setActiveGame(null)} />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
      <BackButton onPress={goBack} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        <ImageBackground
          source={require("../../homeAssets/Quotebg.jpg")}
          style={styles.header}
          imageStyle={styles.headerRadius}
        >
          <View style={styles.trophyRow}>
            <Text style={styles.trophy}>🎮</Text>
            <Text style={styles.title}>{HUB_COPY.title}</Text>
            <Text style={styles.trophy}>⭐</Text>
          </View>
          <Text style={styles.subtitle}>{HUB_COPY.subtitle}</Text>
          <HeaderSpark />
          <View style={styles.headerPills}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{stats.gameCount} Games</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{stats.totalLevels} Levels</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{stats.maxStars} Stars</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#777" />
          <TextInput
            style={styles.searchInput}
            placeholder={HUB_COPY.searchPlaceholder}
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tipBanner}>
          <Text style={styles.tipEmoji}>🏆</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>{HUB_COPY.tipTitle}</Text>
            <Text style={styles.tipBody}>{HUB_COPY.tipBody}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{HUB_COPY.sectionTitle}</Text>

        <View style={styles.cards}>
          {filtered.map((item, index) => (
            <SmoothPressable
              key={item.id}
              radius={26}
              style={styles.cardWrap}
              onPress={() => {
                playUiSound("tap");
                setActiveGame(item.id);
              }}
            >
              <LinearGradient
                colors={item.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Text style={[styles.deco, styles.deco1]}>{item.deco[0]}</Text>
                <Text style={[styles.deco, styles.deco2]}>{item.deco[1]}</Text>
                <Text style={[styles.deco, styles.deco3]}>{item.deco[2]}</Text>
                <View style={[styles.blob, styles.blobA]} />
                <View style={[styles.blob, styles.blobB]} />

                <View style={styles.cardTop}>
                  <View style={styles.iconBubble}>
                    <Ionicons name={item.icon as any} size={28} color="#4B2AA8" />
                  </View>
                  <View style={styles.badge}>
                    <Ionicons name="layers" size={12} color="#4B2AA8" />
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.subtitle}</Text>
                <Text style={[styles.funLine, { color: item.accent }]}>
                  {item.funLine}
                </Text>

                <View style={styles.cardBottom}>
                  <View style={styles.playBtn}>
                    <Ionicons name="play" size={16} color="#4B2AA8" />
                    <Text style={styles.playText}>Play now</Text>
                  </View>
                  <View style={styles.rankDot}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                </View>
              </LinearGradient>
            </SmoothPressable>
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>{HUB_COPY.emptyTitle}</Text>
              <Text style={styles.emptyHint}>{HUB_COPY.emptyHint}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GamesHubScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F0FF" },
  header: {
    paddingTop: 70,
    paddingBottom: 32,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerRadius: { borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  trophyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  trophy: { fontSize: 26 },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#EAE2FF",
    fontSize: 15,
    marginTop: 8,
    fontWeight: "700",
  },
  headerPills: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  pill: {
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  pillText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  searchContainer: {
    marginTop: 18,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8E0FF",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 12,
    fontWeight: "600",
  },
  tipBanner: {
    marginTop: 14,
    marginHorizontal: 20,
    backgroundColor: "#FFF7E6",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#FFE0A3",
  },
  tipEmoji: { fontSize: 28 },
  tipTitle: { color: "#9A6700", fontWeight: "900", fontSize: 14 },
  tipBody: {
    color: "#7A5A10",
    fontWeight: "600",
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#35158B",
    marginTop: 22,
    marginLeft: 22,
  },
  cards: { paddingHorizontal: 20, paddingTop: 14 },
  cardWrap: {
    marginBottom: 16,
    borderRadius: 26,
    overflow: "hidden",
  },
  card: {
    borderRadius: 26,
    padding: 18,
    minHeight: 168,
    overflow: "hidden",
  },
  deco: {
    position: "absolute",
    opacity: 0.35,
    fontSize: 22,
  },
  deco1: { top: 14, right: 54 },
  deco2: { top: 48, right: 18, fontSize: 18 },
  deco3: { bottom: 22, right: 28, fontSize: 20 },
  blob: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
  },
  blobA: { width: 90, height: 90, top: -20, right: -16 },
  blobB: { width: 60, height: 60, bottom: -10, left: -12 },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: "#4B2AA8", fontWeight: "800", fontSize: 12 },
  cardTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  cardSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
    lineHeight: 20,
  },
  funLine: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
  },
  cardBottom: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  playText: { color: "#4B2AA8", fontWeight: "900", fontSize: 14 },
  rankDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  rankText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 22,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "800",
    color: "#4B2AA8",
  },
  emptyHint: { marginTop: 4, color: "#888", fontWeight: "600" },
});
