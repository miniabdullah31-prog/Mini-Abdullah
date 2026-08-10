import React, { useCallback } from "react";
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
  Linking,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import GradCardDecor from "./GradCardDecor";
import HeaderSpark from "./HeaderSparkStar";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import { ISLAMIC_SHORTS, ShortClip } from "../data/islamicShorts";

type Props = { goBack: () => void };

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
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => openOnYouTube(item)}
                style={styles.cardWrapper}
              >
                <LinearGradient
                  colors={item.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <GradCardDecor />
                  {item.cover ? (
                    <Image source={item.cover} style={styles.cover} />
                  ) : (
                    <View style={styles.coverFallback} />
                  )}
                  <View style={styles.playOverlay}>
                    <View style={styles.playCircle}>
                      <Ionicons name="logo-youtube" size={22} color="#FF0000" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },
  cardCol: {
    width: "48%",
    marginBottom: 18,
  },
  cardWrapper: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 5,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  coverFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.12)",
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
  },
});
