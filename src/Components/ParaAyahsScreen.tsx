import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import TajweedText from "./TajweedText";
import TajweedGuideTrigger from "./TajweedGuideTrigger";
import { JUZ_LIST } from "../data/juzMeta";
import { SURAH_LIST } from "../data/surahMeta";
import {
  getJuzAyahs,
  getSurahAyahs,
  QuranAyah,
  TranslationLang,
} from "../services/quranService";
import {
  playQuranRecitation,
  stopQuranRecitation,
} from "../services/quranRecitationAudio";
import { useFeatureBackHandler } from "../hooks/useFeatureBackHandler";

type Props = {
  mode?: "para" | "surah";
  juzNumber?: number;
  surahNumber?: number;
  goBack: () => void;
};

/**
 * No visible Back button (hardware Back via useFeatureBackHandler only).
 *
 * Banner (picture + heading) scrolls away normally.
 * Language + Tajweed stay as a compact top navbar once the picture is off-screen;
 * when the user scrolls back up and the picture returns, the inline (normal) layout resumes.
 */
const ParaAyahsScreen: React.FC<Props> = ({
  mode = "para",
  juzNumber,
  surahNumber,
  goBack,
}) => {
  const isSurah = mode === "surah";
  const juzMeta =
    !isSurah && juzNumber != null
      ? JUZ_LIST.find((j) => j.number === juzNumber)
      : undefined;
  const surahMeta =
    isSurah && surahNumber != null
      ? SURAH_LIST.find((s) => s.number === surahNumber)
      : undefined;

  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [translationLang, setTranslationLang] =
    useState<TranslationLang>("off");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [bannerH, setBannerH] = useState(0);
  const [controlsH, setControlsH] = useState(0);
  const [controlsPinned, setControlsPinned] = useState(false);
  const pinnedRef = useRef(false);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isSurah) {
        if (!surahNumber) throw new Error("Invalid surah.");
        setAyahs(await getSurahAyahs(surahNumber));
      } else {
        if (!juzNumber) throw new Error("Invalid para.");
        setAyahs(await getJuzAyahs(juzNumber));
      }
    } catch (e: any) {
      setError(
        e?.message ||
          (isSurah ? "Could not load this surah." : "Could not load this para."),
      );
    } finally {
      setLoading(false);
    }
  }, [isSurah, juzNumber, surahNumber]);

  useEffect(() => {
    loadContent();
    return () => {
      stopQuranRecitation();
    };
  }, [loadContent]);

  useFeatureBackHandler(
    useCallback(() => {
      stopQuranRecitation();
      goBack();
      return true;
    }, [goBack]),
    [goBack],
  );

  const handlePlay = (ayah: QuranAyah) => {
    if (playingId === ayah.id) {
      stopQuranRecitation();
      setPlayingId(null);
      return;
    }

    const started = playQuranRecitation(ayah.audioUrl, {
      onFinished: () => {
        setPlayingId((current) => (current === ayah.id ? null : current));
      },
    });

    if (started) {
      setPlayingId(ayah.id);
    } else {
      setPlayingId(null);
    }
  };

  const headerTitle = isSurah
    ? surahMeta?.name || `Surah ${surahNumber}`
    : `Para ${juzNumber}`;
  const headerArabic = isSurah
    ? surahMeta?.nameArabic || ""
    : juzMeta?.nameArabic || "";
  const headerSubtitle = isSurah
    ? [
        surahMeta ? `Surah ${surahMeta.number}` : null,
        surahMeta?.revelation,
        surahMeta ? `${surahMeta.ayahCount} ayahs` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : `${juzMeta?.name || ""} · ${juzMeta?.range || ""}`;

  const onBannerLayout = (e: LayoutChangeEvent) => {
    setBannerH(e.nativeEvent.layout.height);
  };

  const onControlsLayout = (e: LayoutChangeEvent) => {
    setControlsH(e.nativeEvent.layout.height);
  };

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      // Pin once the banner has fully scrolled away.
      const shouldPin = bannerH > 0 && y >= bannerH - 1;
      if (shouldPin !== pinnedRef.current) {
        pinnedRef.current = shouldPin;
        setControlsPinned(shouldPin);
      }
    },
    [bannerH],
  );

  const langControls = (opts: { onLayout?: (e: LayoutChangeEvent) => void }) => (
    <View
      style={styles.navbarInner}
      onLayout={opts.onLayout}
      collapsable={false}
    >
      <View style={styles.langRow}>
        {(["off", "ur", "en"] as TranslationLang[]).map((modeChip) => (
          <TouchableOpacity
            key={modeChip}
            style={[
              styles.langChip,
              translationLang === modeChip && styles.langChipActive,
            ]}
            onPress={() => setTranslationLang(modeChip)}
          >
            <Text
              style={[
                styles.langChipText,
                translationLang === modeChip && styles.langChipTextActive,
              ]}
            >
              {modeChip === "off"
                ? "Arabic"
                : modeChip === "ur"
                  ? "Urdu"
                  : "English"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TajweedGuideTrigger translationLang={translationLang} />
    </View>
  );

  const listHeader = useMemo(
    () => (
      <View>
        <ImageBackground
          source={require("../homeAssets/Quotebg.jpg")}
          style={styles.header}
          imageStyle={styles.headerRadius}
          onLayout={onBannerLayout}
        >
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          {!!headerArabic && (
            <Text style={styles.headerArabic}>{headerArabic}</Text>
          )}
          <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
        </ImageBackground>

        {/* Inline controls: visible while picture is on screen; invisible spacer when pinned. */}
        <View
          style={[
            styles.inlineControls,
            controlsPinned && styles.inlineControlsHidden,
          ]}
          pointerEvents={controlsPinned ? "none" : "auto"}
        >
          {langControls({ onLayout: onControlsLayout })}
        </View>
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [controlsPinned, headerArabic, headerSubtitle, headerTitle, translationLang],
  );

  const renderItem = ({ item }: ListRenderItemInfo<QuranAyah>) => {
    const translation =
      translationLang === "en"
        ? item.translationEn
        : translationLang === "ur"
          ? item.translationUr
          : "";

    const showSurahStart = !isSurah && item.ayahNumber === 1;
    const surahNameArabic =
      SURAH_LIST.find((s) => s.number === item.surah)?.nameArabic || "";

    return (
      <View style={styles.ayahWrap}>
        {showSurahStart && !!surahNameArabic ? (
          <View style={styles.surahStart}>
            <Text style={styles.surahStartText}>{surahNameArabic}</Text>
          </View>
        ) : null}

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

          <TajweedText
            arabic={item.arabic}
            arabicTajweed={item.arabicTajweed}
            endsRuku={item.endsRuku}
            ayahNumber={item.ayahNumber}
            style={styles.arabicText}
          />

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
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={controlsPinned ? "dark-content" : "light-content"}
        backgroundColor={controlsPinned ? "#F6F7FB" : "#5B33C4"}
      />

      {/* Fixed compact navbar — only while picture is scrolled away. */}
      {controlsPinned ? (
        <View style={styles.fixedNavbar} pointerEvents="box-none">
          {langControls({})}
        </View>
      ) : null}

      {loading && (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#5B33C4" />
          <Text style={styles.loaderText}>
            {isSurah ? "Opening surah..." : "Opening para..."}
          </Text>
        </View>
      )}

      {!loading && error ? (
        <View style={styles.loaderBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadContent}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!loading && !error && (
        <FlatList
          style={styles.list}
          data={ayahs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.listContent,
            // Keep ayahs below the fixed bar when pinned (inline spacer is opacity-0).
            controlsPinned && controlsH > 0
              ? { paddingTop: 0 }
              : null,
          ]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={9}
          updateCellsBatchingPeriod={50}
        />
      )}
    </View>
  );
};

export default ParaAyahsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  list: { flex: 1 },
  /** Absolute top bar — same compact inset as inline controls, flush under status bar. */
  fixedNavbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    elevation: 6,
    backgroundColor: "#F6F7FB",
    paddingTop: StatusBar.currentHeight ?? 28,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E6DEFF",
  },
  inlineControls: {
    backgroundColor: "#F6F7FB",
    paddingTop: 6,
    paddingBottom: 2,
  },
  inlineControlsHidden: {
    opacity: 0,
  },
  navbarInner: {
    backgroundColor: "#F6F7FB",
    paddingBottom: 2,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerRadius: { borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
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
    paddingTop: 2,
    paddingBottom: 0,
  },
  langChip: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 9,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6DEFF",
  },
  langChipActive: { backgroundColor: "#5B33C4", borderColor: "#5B33C4" },
  langChipText: { color: "#5B33C4", fontWeight: "700", fontSize: 13 },
  langChipTextActive: { color: "#fff" },
  loaderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loaderText: { marginTop: 12, color: "#666", fontSize: 15, fontWeight: "600" },
  errorText: { color: "#C0392B", textAlign: "center", marginBottom: 16 },
  retryBtn: {
    backgroundColor: "#5B33C4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  listContent: { paddingBottom: 40 },
  ayahWrap: { paddingHorizontal: 16, paddingTop: 8 },
  surahStart: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#F0EAFB",
    borderWidth: 1,
    borderColor: "#D9CFF5",
  },
  surahStartText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3A2080",
    textAlign: "center",
    writingDirection: "rtl",
  },
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
    lineHeight: 48,
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
