import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ImageBackground,
  StatusBar,
  Linking,
  Alert,
  Dimensions,
  ListRenderItem,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import GradCardDecor from "./GradCardDecor";
import HeaderSpark from "./HeaderSparkStar";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "./BackButton";
import SmoothPressable from "./SmoothPressable";
import RemoteImage from "./RemoteImage";
import { ISLAMIC_SHORTS, ShortClip } from "../data/islamicShorts";
import {
  fetchMediaByCategory,
  indexMediaByLocalId,
  RemoteMedia,
} from "../services/mediaService";
import { API_BASE_URL } from "../config/api";

type Props = { goBack: () => void };

/** 2-col grid: pad 20*2, ~4% gap between columns → consistent thumb size */
const SCREEN_W = Dimensions.get("window").width;
const GRID_PAD = 20;
const COL_GAP = Math.max(12, Math.round(SCREEN_W * 0.04));
const CARD_W = (SCREEN_W - GRID_PAD * 2 - COL_GAP) / 2;
/** Portrait short-style thumb (4:5) — child-friendly, uniform across covers + gradients */
const CARD_H = Math.round(CARD_W * 1.25);

const StoriesScreen: React.FC<Props> = ({ goBack }) => {
  const [remoteById, setRemoteById] = useState<Record<number, RemoteMedia>>({});
  const [apiFailed, setApiFailed] = useState(false);
  const screenOpenedAt = useRef(Date.now());
  const loggedTotal = useRef(false);

  useEffect(() => {
    let active = true;
    fetchMediaByCategory("stories")
      .then((items) => {
        if (__DEV__) {
          const thumbs = items.map((item) => item.thumbnailUrl);
          const usingFullPng = thumbs.some((url) => /\.png(\?|$)/i.test(url));
          console.log(
            "[stories-perf] media mapped",
            API_BASE_URL,
            "count=" + items.length,
            usingFullPng ? "WARN-thumbnail-is-full-png" : "thumbs-ok",
            thumbs.join(" | "),
          );
        }
        if (active) {
          setApiFailed(false);
          setRemoteById(indexMediaByLocalId(items));
        }
      })
      .catch((err: unknown) => {
        if (__DEV__) {
          const message = err instanceof Error ? err.message : String(err);
          console.log("[stories-perf] api-failed fallback-local", API_BASE_URL, message);
        }
        if (active) setApiFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const openOnYouTube = useCallback(async (item: ShortClip) => {
    const url = item.youtubeUrl?.trim();
    if (!url || !url.startsWith("https://")) {
      Alert.alert("Unavailable", "No YouTube link for this short yet.");
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Could not open", "Unable to open YouTube for this short.");
    }
  }, []);

  const onThumbLoaded = useCallback(() => {
    if (!__DEV__ || loggedTotal.current) return;
    loggedTotal.current = true;
    console.log(
      "[stories-perf] first-thumbnail-ready",
      Date.now() - screenOpenedAt.current + "ms",
    );
  }, []);

  const renderItem: ListRenderItem<ShortClip> = useCallback(
    ({ item }) => {
      const remote = remoteById[item.id];
      const thumbUri = remote?.thumbnailUrl || null;
      const hasCover = Boolean(item.cover || thumbUri);
      return (
        <View style={styles.cardCol}>
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
              {!item.cover && !thumbUri && <GradCardDecor />}
              {hasCover ? (
                <RemoteImage
                  remoteUri={thumbUri}
                  localSource={item.cover}
                  preferLocal={apiFailed}
                  style={styles.cover}
                  resizeMode="cover"
                  onLoad={onThumbLoaded}
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
      );
    },
    [apiFailed, onThumbLoaded, openOnYouTube, remoteById],
  );

  const listHeader = useMemo(
    () => (
      <>
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
      </>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
      <BackButton onPress={goBack} />
      <FlatList
        data={ISLAMIC_SHORTS}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
};

export default StoriesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  listContent: { paddingBottom: 40 },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: GRID_PAD,
  },
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
    marginBottom: 14,
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
    ...StyleSheet.absoluteFill,
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
