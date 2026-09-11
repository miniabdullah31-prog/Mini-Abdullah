import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  TextInput,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";
import Video, { VideoRef } from "react-native-video";
import BackButton from "./BackButton";
import SmoothPressable from "./SmoothPressable";
import GradCardDecor from "./GradCardDecor";
import HeaderSpark from "./HeaderSparkStar";
import { DUAS, DuaItem } from "../data/duas";
import { playDuaAudio, stopDuaAudio } from "../services/duaAudio";
import { useFeatureBackHandler } from "../hooks/useFeatureBackHandler";

type Props = { goBack: () => void };
type LangMode = "ar" | "ur" | "en";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

const VIDEO_CARD_HEIGHT = 180;
const VIDEO_OVERLAY_HEADER = 56;
const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 0;
const VIDEO_PLAYER_HEIGHT =
  SCREEN_HEIGHT - STATUS_BAR_HEIGHT - VIDEO_OVERLAY_HEADER - 24;

/** RN 0.85 + Android: resolve bundled mp4 to a file URI for reliable decode. */
function resolveVideoSource(video: number) {
  const resolved = Image.resolveAssetSource(video);
  if (!resolved?.uri) return video;

  let uri = resolved.uri;
  if (
    Platform.OS === "android" &&
    !uri.startsWith("http") &&
    !uri.startsWith("file://") &&
    !uri.startsWith("asset:/")
  ) {
    uri = `file://${uri}`;
  }
  return { uri };
}

/** First-frame preview on the card (paused, muted). */
function DuaVideoThumbnail({ video }: { video: number }) {
  return (
    <Video
      source={resolveVideoSource(video)}
      style={styles.videoThumb}
      paused
      muted
      repeat={false}
      resizeMode="cover"
      controls={false}
      disableFocus
      playInBackground={false}
      posterResizeMode="cover"
      {...(Platform.OS === "android" ? { useTextureView: true } : {})}
    />
  );
}

const DuasScreen: React.FC<Props> = ({ goBack }) => {
  const [search, setSearch] = useState("");
  const [selectedDua, setSelectedDua] = useState<DuaItem | null>(null);
  const [lang, setLang] = useState<LangMode>("ar");
  const [speaking, setSpeaking] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const videoRef = useRef<VideoRef>(null);

  useEffect(() => {
    return () => {
      stopDuaAudio();
    };
  }, []);

  const closeVideo = useCallback(() => {
    setVideoVisible(false);
  }, []);

  const filteredDuas = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DUAS;
    return DUAS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.titleUrdu.includes(search.trim()) ||
        item.arabic.includes(search.trim()),
    );
  }, [search]);

  const handlePlayAudio = async () => {
    if (!selectedDua) return;
    if (speaking) {
      stopDuaAudio();
      setSpeaking(false);
      return;
    }
    const ok = await playDuaAudio(selectedDua.audio);
    setSpeaking(ok);
    if (ok) {
      // UI stop-icon window; user can tap again to stop anytime
      setTimeout(() => setSpeaking(false), 15000);
    }
  };

  const openVideo = () => {
    if (!selectedDua?.video) return;
    stopDuaAudio();
    setSpeaking(false);
    setVideoVisible(true);
  };

  const closeDetail = useCallback(() => {
    stopDuaAudio();
    setSpeaking(false);
    closeVideo();
    setLang("ar");
    setSelectedDua(null);
  }, [closeVideo]);

  useFeatureBackHandler(
    useCallback(() => {
      if (videoVisible) {
        closeVideo();
        return true;
      }
      if (selectedDua) {
        closeDetail();
        return true;
      }
      return false;
    }, [videoVisible, selectedDua, closeDetail]),
    [videoVisible, selectedDua, closeDetail],
  );

  /* ---------------- DETAIL ---------------- */
  if (selectedDua) {
    const showMeaning = lang !== "ar";
    const translation =
      lang === "ur" ? selectedDua.translationUrdu : selectedDua.translation;
    const tafseer =
      lang === "ur" ? selectedDua.tafseerUrdu : selectedDua.tafseerEng;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
        <BackButton
          onPress={closeDetail}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <ImageBackground
            source={require("../homeAssets/Quotebg.jpg")}
            style={styles.detailHeader}
            imageStyle={styles.headerRadius}
          >
            <View style={styles.detailTitleRow}>
              <Text style={styles.detailTitleEn}>{selectedDua.title}</Text>
              <Text style={styles.detailTitleUr}>{selectedDua.titleUrdu}</Text>
            </View>
          </ImageBackground>

          <View style={styles.langRow}>
            {(["ar", "ur", "en"] as LangMode[]).map((mode) => (
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
                  {mode === "ar" ? "Arabic" : mode === "ur" ? "Urdu" : "English"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.detailCard}>
            <View style={styles.arabicTop}>
              <Text style={styles.sectionLabel}>Dua</Text>
              <TouchableOpacity
                style={[styles.audioBtn, speaking && styles.audioBtnActive]}
                onPress={handlePlayAudio}
              >
                <Ionicons
                  name={speaking ? "stop" : "volume-high"}
                  size={16}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.arabicText}>{selectedDua.arabic}</Text>

            {showMeaning && (
              <View style={styles.meaningBox}>
                <Text style={styles.sectionLabel}>
                  {lang === "ur" ? "ترجمہ و تفسیر" : "Translation & Tafseer"}
                </Text>
                <Text
                  style={[
                    styles.translationText,
                    lang === "ur" && styles.urduText,
                  ]}
                >
                  {translation}
                </Text>
                <View style={styles.divider} />
                <Text
                  style={[
                    styles.tafseerText,
                    lang === "ur" && styles.urduText,
                  ]}
                >
                  {tafseer}
                </Text>
              </View>
            )}

            <Text style={[styles.sectionLabel, { marginTop: 18 }]}>Video</Text>
            {selectedDua.video ? (
              <TouchableOpacity
                style={styles.videoCard}
                activeOpacity={0.88}
                onPress={openVideo}
              >
                <View style={styles.videoCardFrame}>
                  <LinearGradient
                    colors={selectedDua.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.videoThumbFallback}
                  />
                  <DuaVideoThumbnail video={selectedDua.video} />
                  <View style={styles.videoThumbDim} />
                  <View style={styles.videoThumbContent}>
                    <View style={styles.playCircle}>
                      <Ionicons name="play" size={28} color="#5B33C4" />
                    </View>
                    <Text style={styles.videoTitle}>Watch explanation</Text>
                    <Text style={styles.videoSub}>{selectedDua.caption}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.comingSoonCard}>
                <Ionicons name="videocam-outline" size={28} color="#9A8BC7" />
                <Text style={styles.comingSoonTitle}>Video coming soon</Text>
                <Text style={styles.comingSoonSub}>
                  AI lesson for this dua will appear here.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Full-screen overlay — RN 0.85 Modal breaks Android video surface */}
        {videoVisible && selectedDua.video ? (
          <View style={styles.videoOverlay}>
            <SafeAreaView style={styles.videoOverlaySafeTop}>
              <View style={styles.videoModalHeader}>
                <Text style={styles.videoModalTitle}>{selectedDua.title}</Text>
                <TouchableOpacity
                  style={styles.videoCloseBtn}
                  onPress={closeVideo}
                  accessibilityLabel="Close video"
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
            <Video
              key={`dua-player-${selectedDua.id}`}
              ref={videoRef}
              source={resolveVideoSource(selectedDua.video)}
              style={{
                width: SCREEN_WIDTH,
                height: VIDEO_PLAYER_HEIGHT,
              }}
              controls
              resizeMode="contain"
              muted={false}
              volume={1.0}
              paused={false}
              ignoreSilentSwitch="ignore"
              mixWithOthers="mix"
              playInBackground={false}
              playWhenInactive
              shutterColor="transparent"
              bufferConfig={{
                minBufferMs: 1500,
                maxBufferMs: 8000,
                bufferForPlaybackMs: 250,
                bufferForPlaybackAfterRebufferMs: 500,
              }}
              {...(Platform.OS === "android"
                ? { useTextureView: true }
                : {})}
              onEnd={closeVideo}
            />
          </View>
        ) : null}
      </SafeAreaView>
    );
  }

  /* ---------------- LIST ---------------- */
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
          <Text style={styles.headerTitle}>Daily Duas</Text>
          <Text style={styles.headerSubtitle}>
            Remember Allah in every moment
          </Text>
          <HeaderSpark />
        </ImageBackground>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search duas..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Choose a Dua</Text>

        <View style={styles.cardsContainer}>
          {filteredDuas.map((item) => (
            <SmoothPressable
              key={item.id}
              radius={20}
              style={styles.cardWrapper}
              onPress={() => {
                setLang("ar");
                setSelectedDua(item);
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
                  <Ionicons name={item.icon} size={24} color="#fff" />
                </View>
                <View style={styles.cardTextCol}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitleEn}>{item.title}</Text>
                    <Text style={styles.cardTitleUr}>{item.titleUrdu}</Text>
                  </View>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {item.caption}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFFCC" />
              </LinearGradient>
            </SmoothPressable>
          ))}

          {filteredDuas.length === 0 && (
            <Text style={styles.noResultText}>No results found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DuasScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB", position: "relative" },
  header: {
    paddingTop: 70,
    paddingBottom: 36,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  detailHeader: {
    paddingTop: 70,
    paddingBottom: 28,
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
  },
  detailTitleRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  detailTitleEn: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    flex: 1,
  },
  detailTitleUr: {
    color: "#EAE2FF",
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
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
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#35158B",
    marginTop: 28,
    marginLeft: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 14,
  },
  cardWrapper: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
    position: "relative",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextCol: { flex: 1 },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardTitleEn: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  cardTitleUr: {
    color: "#F3EEFF",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#F3EEFF",
    marginTop: 4,
    fontWeight: "600",
  },
  noResultText: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
    marginTop: 20,
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
  detailCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 22,
    padding: 16,
    elevation: 3,
  },
  arabicTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionLabel: {
    color: "#5B33C4",
    fontWeight: "800",
    fontSize: 14,
  },
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
    lineHeight: 46,
    color: "#1a1a1a",
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "700",
  },
  meaningBox: {
    marginTop: 18,
    backgroundColor: "#FAF8FF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EDE7FF",
  },
  translationText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    color: "#333",
    fontWeight: "600",
  },
  tafseerText: {
    fontSize: 14,
    lineHeight: 23,
    color: "#555",
  },
  urduText: {
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 16,
    lineHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: "#E6DEFF",
    marginVertical: 12,
  },
  videoCard: {
    marginTop: 10,
    borderRadius: 18,
    overflow: "hidden",
  },
  videoCardFrame: {
    width: "100%",
    height: VIDEO_CARD_HEIGHT,
    position: "relative",
    backgroundColor: "#1a1a1a",
  },
  videoThumbFallback: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: VIDEO_CARD_HEIGHT,
  },
  videoThumb: {
    width: "100%",
    height: VIDEO_CARD_HEIGHT,
    backgroundColor: "#1a1a1a",
  },
  videoThumbDim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  videoThumbContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  videoTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  videoSub: {
    color: "#F3EEFF",
    marginTop: 4,
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  comingSoonCard: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: "#FAF8FF",
    borderWidth: 1,
    borderColor: "#E6DEFF",
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  comingSoonTitle: {
    color: "#5B33C4",
    fontWeight: "800",
    fontSize: 15,
    marginTop: 8,
  },
  comingSoonSub: {
    color: "#777",
    marginTop: 4,
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
    zIndex: 9999,
    elevation: 9999,
  },
  videoOverlaySafeTop: {
    backgroundColor: "#1a1a1a",
  },
  videoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: VIDEO_OVERLAY_HEADER,
  },
  videoModalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
    marginRight: 12,
  },
  videoCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
