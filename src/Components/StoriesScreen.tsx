import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  Image,
  StatusBar,
  Linking,
  Alert,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import GradCardDecor from "./GradCardDecor";
import HeaderSpark from "./HeaderSparkStar";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import SmoothPressable from "./SmoothPressable";
import { ISLAMIC_SHORTS, ShortClip } from "../data/islamicShorts";

type Props = { goBack: () => void };

/** 2-col grid: pad 20*2, ~4% gap between columns → consistent thumb size */
const SCREEN_W = Dimensions.get("window").width;
const GRID_PAD = 20;
const COL_GAP = Math.max(12, Math.round(SCREEN_W * 0.04));
const CARD_W = (SCREEN_W - GRID_PAD * 2 - COL_GAP) / 2;
/** Portrait short-style thumb (4:5) — child-friendly, uniform across covers + gradients */
const CARD_H = Math.round(CARD_W * 1.25);

const StoriesScreen: React.FC<Props> = ({ goBack }) => {
  const openOnYouTube = useCallback(async (item: ShortClip) => {
    const url = item.youtubeUrl?.trim();
    if (!url || !url.startsWith("https://")) {
      Alert.alert("Unavailable", "No YouTube link for this short yet.");
      return;
    }
    try {
      // Do not gate on Linking.canOpenURL — Android often returns false for https
      // even when openURL succeeds (false negative).
      await Linking.openURL(url);
    } catch {
      Alert.alert("Could not open", "Unable to open YouTube for this short.");
    }
  }, []);

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
          <Text style={styles.headerTitle}>Islamic Shorts</Text>
          <Text style={styles.headerSubtitle}>
            Prophets · Seerah · opens in YouTube
          </Text>
          <HeaderSpark />
        </ImageBackground>

        <Text style={styles.sectionTitle}>Watch</Text>

        <View style={styles.grid}>
          {ISLAMIC_SHORTS.map((item) => (
            <View key={item.id} style={styles.cardCol}>
              <SmoothPressable
                radius={22}
                onPress={() => openOnYouTube(item)}
                style={styles.cardWrapper}
              >
                <LinearGradient
                  colors={item.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  {!item.cover && <GradCardDecor />}
                  {item.cover ? (
                    <Image
                      source={item.cover}
                      style={styles.cover}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View style={styles.playOverlay} pointerEvents="none">
                    <View style={styles.playCircle}>
                      <Ionicons name="logo-youtube" size={22} color="#FF0000" />
                    </View>
                  </View>
                </LinearGradient>
              </SmoothPressable>

              <Text style={styles.listCaption} numberOfLines={2}>
                {item.caption}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StoriesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  header: {
    paddingTop: 70,
    paddingBottom: 36,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerRadius: { borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
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
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#35158B",
    marginTop: 24,
    marginLeft: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: GRID_PAD,
    paddingTop: 14,
    paddingBottom: 40,
  },
  cardCol: {
    width: CARD_W,
    marginBottom: 18,
  },
  cardWrapper: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#E8E0FF",
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cover: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CARD_W,
    height: CARD_H,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  listCaption: {
    marginTop: 8,
    fontSize: 12,
    color: "#35158B",
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 16,
    paddingHorizontal: 4,
    minHeight: 32,
  },
});
