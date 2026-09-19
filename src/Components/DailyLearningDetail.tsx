import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ImageBackground,
  Platform,
} from "react-native";
import BackButton from "./BackButton";
import SmoothPressable from "./SmoothPressable";
import HeaderSpark from "./HeaderSparkStar";
import { DailyLearningContent } from "../services/dailyContentService";
import { useFeatureBackHandler } from "../hooks/useFeatureBackHandler";

export type DailyLearningKind = "word" | "dua" | "quest";

type Props = {
  kind: DailyLearningKind;
  content: DailyLearningContent;
  onBack: () => void;
  questClaimed: boolean;
  questClaiming: boolean;
  onCollectQuest: () => void;
};

const META: Record<
  DailyLearningKind,
  { title: string; subtitle: string; emoji: string }
> = {
  word: {
    title: "Word of the Day",
    subtitle: "Today's Islamic word",
    emoji: "🌟",
  },
  dua: {
    title: "Dua of the Day",
    subtitle: "Today's beautiful dua",
    emoji: "🤲",
  },
  quest: {
    title: "Kindness Quest",
    subtitle: "Today's good-deed challenge",
    emoji: "💗",
  },
};

const DailyLearningDetail: React.FC<Props> = ({
  kind,
  content,
  onBack,
  questClaimed,
  questClaiming,
  onCollectQuest,
}) => {
  const meta = META[kind];

  useFeatureBackHandler(
    useCallback(() => {
      onBack();
      return true;
    }, [onBack]),
    [onBack],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B33C4" />
      <BackButton onPress={onBack} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <ImageBackground
          source={require("../homeAssets/Quotebg.jpg")}
          style={styles.header}
          imageStyle={styles.headerRadius}
        >
          <Text style={styles.headerEmoji}>{meta.emoji}</Text>
          <Text style={styles.headerTitle}>{meta.title}</Text>
          <Text style={styles.headerSub}>{meta.subtitle}</Text>
          <HeaderSpark />
        </ImageBackground>

        <View style={styles.card}>
          {kind === "word" ? (
            <>
              <Text style={styles.kicker}>Today's word</Text>
              <Text style={styles.wordHero}>{content.word}</Text>
              {!!content.wordMeaning && (
                <>
                  <Text style={styles.sectionLabel}>Meaning</Text>
                  <Text style={styles.body}>{content.wordMeaning}</Text>
                </>
              )}
              {!!content.wordExample && (
                <View style={styles.exampleBox}>
                  <Text style={styles.sectionLabel}>Example</Text>
                  <Text style={styles.exampleBody}>{content.wordExample}</Text>
                </View>
              )}
            </>
          ) : null}

          {kind === "dua" ? (
            <>
              <Text style={styles.kicker}>Today's dua</Text>
              <View style={styles.arabicBox}>
                <Text style={styles.arabic}>{content.dua}</Text>
              </View>
              {!!content.duaMeaning && (
                <>
                  <Text style={styles.sectionLabel}>Translation</Text>
                  <Text style={styles.body}>{content.duaMeaning}</Text>
                </>
              )}
            </>
          ) : null}

          {kind === "quest" ? (
            <>
              <Text style={styles.kicker}>Today's quest</Text>
              <Text style={styles.questTitle}>{content.questTitle}</Text>
              <Text style={styles.body}>{content.questDescription}</Text>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardBadge}>+{content.rewardXP} XP</Text>
                <Text style={styles.rewardBadgeCoins}>
                  +{content.rewardCoins} coins
                </Text>
              </View>
              <SmoothPressable
                radius={18}
                onPress={onCollectQuest}
                style={[
                  styles.collectBtn,
                  questClaimed && styles.collectBtnDone,
                ]}
              >
                <Text style={styles.collectText}>
                  {questClaimed
                    ? "Collected today ✓"
                    : questClaiming
                      ? "Collecting…"
                      : `I did this · +${content.rewardCoins} coins`}
                </Text>
              </SmoothPressable>
            </>
          ) : null}

          {!!content.date && (
            <Text style={styles.dateHint}>For {content.date}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DailyLearningDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  scroll: { paddingBottom: 40 },
  header: {
    paddingTop: 78,
    paddingBottom: 36,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerRadius: { borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerEmoji: { fontSize: 28, marginBottom: 6 },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
  },
  headerSub: {
    marginTop: 6,
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    textAlign: "center",
  },
  card: {
    marginTop: -12,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E8E0FF",
  },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6C4DF7",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 8,
  },
  wordHero: {
    fontSize: 40,
    fontWeight: "900",
    color: "#4B2AA8",
    textAlign: "center",
    marginBottom: 16,
  },
  arabicBox: {
    backgroundColor: "#FAF8FF",
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  arabic: {
    fontSize: 28,
    lineHeight: 48,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "right",
    writingDirection: "rtl",
    fontFamily: Platform.select({
      ios: "Geeza Pro",
      android: "NotoNaskhArabic",
      default: undefined,
    }),
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: "800",
    color: "#4B2AA8",
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: "#334155",
    fontWeight: "600",
  },
  exampleBox: {
    marginTop: 16,
    backgroundColor: "#F4F0FF",
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#6C4DF7",
  },
  exampleBody: {
    fontSize: 15,
    lineHeight: 24,
    color: "#3A2A6B",
    fontWeight: "600",
    fontStyle: "italic",
  },
  questTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#DB2777",
    textAlign: "center",
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    justifyContent: "center",
  },
  rewardBadge: {
    backgroundColor: "#EDE9FE",
    color: "#6C4DF7",
    fontWeight: "800",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  rewardBadgeCoins: {
    backgroundColor: "#FEF3C7",
    color: "#B45309",
    fontWeight: "800",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  collectBtn: {
    marginTop: 20,
    backgroundColor: "#F472B6",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  collectBtnDone: {
    backgroundColor: "#0F9B8E",
  },
  collectText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  dateHint: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
});
