import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Easing,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import BackButton from "../BackButton";
import { useFeatureBackHandler } from "../../hooks/useFeatureBackHandler";
import {
  MAX_WRONG_ATTEMPTS,
  QuizLang,
  QUIZ_UI,
  shuffle,
  starsFromWrongAttempts,
} from "../../data/quizGames";
import {
  buildLevel1Challenges,
  LEVEL1_STAR_MAX,
  WUDU_STEPS,
  WUDU_UI,
  WuduChallenge,
  WuduStep,
  wuduStepTitle,
} from "../../data/wuduMission";
import { bumpPlayCount, getPlayCount } from "../../services/quizPlayStore";
import { playUiSound } from "../../services/soundService";
import { useClaimGameReward } from "../../hooks/useClaimGameReward";
import {
  FailOverlay,
  LevelClearModal,
  openFailSoon,
  StarRow,
} from "./QuizShared";

type Props = { onExitToHub: () => void };

type Phase = "intro" | "challenge" | "order";

const WuduMissionGame: React.FC<Props> = ({ onExitToHub }) => {
  const [uiLang, setUiLang] = useState<"en" | "ur">("en");
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<Phase>("intro");
  const [challenges, setChallenges] = useState<WuduChallenge[]>([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [orderTarget, setOrderTarget] = useState(1);
  const [orderOptions, setOrderOptions] = useState<WuduStep[]>([]);
  const [wrong, setWrong] = useState(0);
  const [clearOpen, setClearOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const [challengeResultOpen, setChallengeResultOpen] = useState(false);
  const [stars, setStars] = useState(LEVEL1_STAR_MAX);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [revealCount, setRevealCount] = useState(0);
  const wrongRef = useRef(0);
  const starsRef = useRef(LEVEL1_STAR_MAX);
  const lockedRef = useRef(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const starPopAnim = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(1)).current;

  const ui = WUDU_UI[uiLang];
  const quizUi = QUIZ_UI[uiLang === "ur" ? "ur" : "en"];
  const triesLeft = Math.max(0, MAX_WRONG_ATTEMPTS - wrong);
  useClaimGameReward("wudumission", level, clearOpen);
  const challenge = challenges[challengeIndex];

  const setupOrderRound = useCallback(() => {
    setOrderTarget(1);
    setOrderOptions(shuffle([...WUDU_STEPS]));
    setWrong(0);
    wrongRef.current = 0;
    setFlash(null);
    lockedRef.current = false;
  }, []);

  const startLevel = useCallback(
    async (lvl: number, countPlay = true, showIntro = true) => {
      lockedRef.current = false;
      setClearOpen(false);
      setFailOpen(false);
      setChallengeResultOpen(false);
      setFlash(null);
      setPickedId(null);
      setLevel(lvl);
      if (countPlay) {
        await bumpPlayCount("wudumission", lvl);
      }

      if (lvl === 1) {
        setChallenges(buildLevel1Challenges());
        setChallengeIndex(0);
        starsRef.current = LEVEL1_STAR_MAX;
        setStars(LEVEL1_STAR_MAX);
        setWrong(0);
        wrongRef.current = 0;
        setPhase(showIntro ? "intro" : "challenge");
      } else {
        setPhase("order");
        setupOrderRound();
      }
    },
    [setupOrderRound],
  );

  useEffect(() => {
    getPlayCount("wudumission", 1).then(() => startLevel(1));
  }, [startLevel]);

  const goBackStep = useCallback((): boolean => {
    lockedRef.current = false;
    setFlash(null);
    setPickedId(null);

    if (challengeResultOpen) {
      setChallengeResultOpen(false);
      return true;
    }
    if (clearOpen) {
      setClearOpen(false);
      return true;
    }
    if (failOpen) {
      setFailOpen(false);
      return true;
    }
    if (phase === "challenge" && challengeIndex > 0) {
      setChallengeIndex((i) => i - 1);
      return true;
    }
    if (phase === "challenge") {
      setPhase("intro");
      setChallengeIndex(0);
      return true;
    }
    if (phase === "order" && orderTarget > 1) {
      setOrderTarget((t) => t - 1);
      return true;
    }
    if (phase === "order") {
      setLevel(1);
      if (challenges.length > 0) {
        setPhase("challenge");
        setChallengeIndex(challenges.length - 1);
      } else {
        setPhase("intro");
      }
      return true;
    }
    return false;
  }, [
    challengeResultOpen,
    clearOpen,
    failOpen,
    phase,
    challengeIndex,
    orderTarget,
    challenges.length,
  ]);

  const onBack = useCallback(() => {
    if (!goBackStep()) {
      onExitToHub();
    }
  }, [goBackStep, onExitToHub]);

  useFeatureBackHandler(
    useCallback(() => {
      onBack();
      return true;
    }, [onBack]),
    [onBack],
  );

  useEffect(() => {
    if (triesLeft === 0 && phase === "order" && !clearOpen && !failOpen) {
      openFailSoon(setFailOpen);
    }
  }, [triesLeft, phase, clearOpen, failOpen]);

  useEffect(() => {
    shakeAnim.setValue(0);
    successScale.setValue(1);
    if (phase !== "challenge" || challenge?.type !== "spotMistake") {
      setRevealCount(99);
      return;
    }
    lockedRef.current = true;
    setRevealCount(0);
    const timers = challenge.options.map((_, i) =>
      setTimeout(() => {
        setRevealCount(i + 1);
        if (i + 1 >= challenge.options.length) {
          lockedRef.current = false;
        }
      }, 420 * (i + 1)),
    );
    return () => {
      timers.forEach(clearTimeout);
      lockedRef.current = false;
    };
  }, [phase, challengeIndex, challenge, shakeAnim, successScale]);

  const playShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const playStarLoss = () => {
    starPopAnim.setValue(1.28);
    Animated.spring(starPopAnim, {
      toValue: 1,
      friction: 4,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const playSuccess = () => {
    successScale.setValue(0.88);
    Animated.spring(successScale, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const onOrderPick = (step: WuduStep) => {
    if (phase !== "order" || clearOpen || failOpen || flash || lockedRef.current) {
      return;
    }

    if (step.id === orderTarget) {
      setFlash("ok");
      setTimeout(() => {
        setFlash(null);
        if (orderTarget >= WUDU_STEPS.length) {
          lockedRef.current = true;
          setStars(starsFromWrongAttempts(wrongRef.current));
          playUiSound("gameWin");
          setClearOpen(true);
        } else {
          playUiSound("wudu");
          setOrderTarget((t) => t + 1);
          setOrderOptions(shuffle([...WUDU_STEPS]));
        }
      }, 400);
      return;
    }

    playUiSound("wrong");
    setFlash("bad");
    wrongRef.current += 1;
    setWrong(wrongRef.current);
    setTimeout(() => setFlash(null), 400);
  };

  const finishChallenge = () => {
    lockedRef.current = true;
    setStars(starsRef.current);
    playUiSound("success");
    setChallengeResultOpen(true);
  };

  const onChallengePick = (step: WuduStep) => {
    if (
      phase !== "challenge" ||
      !challenge ||
      challengeResultOpen ||
      flash ||
      lockedRef.current
    ) {
      return;
    }
    if (
      challenge.type === "spotMistake" &&
      revealCount < challenge.options.length
    ) {
      return;
    }

    if (step.id === challenge.correctId) {
      lockedRef.current = true;
      setPickedId(step.id);
      setFlash("ok");
      playSuccess();
      playUiSound("wudu");
      setTimeout(() => {
        setFlash(null);
        setPickedId(null);
        if (challengeIndex + 1 >= challenges.length) {
          finishChallenge();
        } else {
          setChallengeIndex((i) => i + 1);
          lockedRef.current = false;
        }
      }, 620);
      return;
    }

    lockedRef.current = true;
    setPickedId(step.id);
    setFlash("bad");
    playUiSound("wrong");
    playShake();
    wrongRef.current += 1;
    setWrong(wrongRef.current);
    if (starsRef.current > 0) {
      starsRef.current -= 1;
      setStars(starsRef.current);
      playStarLoss();
    }
    setTimeout(() => {
      setFlash(null);
      setPickedId(null);
      lockedRef.current = false;
    }, 520);
  };

  const title = (step: WuduStep) => wuduStepTitle(step, uiLang);
  const previousStep = challenge?.previousStepId
    ? WUDU_STEPS.find((s) => s.id === challenge.previousStepId)
    : undefined;

  const headerSub = useMemo(() => {
    if (phase === "order") {
      return `${ui.orderMode} · ${quizUi.level} ${level}`;
    }
    return `${ui.challengeMode} · ${quizUi.level} 1`;
  }, [phase, ui.orderMode, ui.challengeMode, quizUi.level, level]);

  const resultCopy =
    stars >= LEVEL1_STAR_MAX
      ? { title: ui.excellentTitle, msg: ui.excellentMsg, master: true }
      : stars === 2
        ? { title: ui.goodTitle, msg: ui.goodMsg, master: false }
        : { title: ui.practiceTitle, msg: ui.practiceMsg, master: false };

  const shakeX = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-11, 11],
  });

  const abdullahMood =
    flash === "ok" ? ui.nice : flash === "bad" ? ui.thinkAgain : null;

  const renderActionCard = (
    step: WuduStep,
    opts?: { large?: boolean },
  ) => {
    const selected = pickedId === step.id;
    const isOk = flash === "ok" && selected;
    const isBad = flash === "bad" && selected;
    return (
      <TouchableOpacity
        key={step.id}
        style={[
          styles.actionCard,
          opts?.large ? styles.actionCardLarge : styles.actionCardGrid,
          isOk && styles.chipOk,
          isBad && styles.chipBad,
        ]}
        activeOpacity={0.85}
        onPress={() => onChallengePick(step)}
        disabled={!!flash}
      >
        <Text style={styles.actionEmoji}>{step.emoji}</Text>
        <Text style={styles.actionTitle} numberOfLines={2}>
          {title(step)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={onBack} />
      <ImageBackground
        source={require("../../homeAssets/cyanCard.jpg")}
        style={styles.header}
        imageStyle={{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <Text style={styles.headerTitle}>
          {phase === "order" ? ui.missionTitle : ui.challengeTitle}
        </Text>
        <Text style={styles.headerSub}>{headerSub}</Text>
      </ImageBackground>

      <View style={styles.langRow}>
        {(["en", "ur"] as const).map((l) => (
          <TouchableOpacity
            key={l}
            style={[styles.langChip, uiLang === l && styles.langChipActive]}
            onPress={() => setUiLang(l)}
          >
            <Text
              style={[
                styles.langChipText,
                uiLang === l && styles.langChipTextActive,
              ]}
            >
              {l === "en" ? "English" : "Urdu"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {phase === "intro" && (
        <ScrollView
          contentContainerStyle={styles.introBody}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../assets/miniAbdullah.png")}
            style={styles.introAbdullah}
          />
          <Text style={styles.introHook}>{ui.challengeHook}</Text>
          <Text style={styles.triesHud}>Tries: {triesLeft}</Text>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {
              lockedRef.current = false;
              setPhase("challenge");
            }}
            activeOpacity={0.88}
          >
            <Text style={styles.nextBtnText}>{ui.startChallenge}</Text>
            <Ionicons name="play" size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      )}

      {phase === "challenge" && challenge && (
        <ScrollView
          contentContainerStyle={styles.challengeBody}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hudRow}>
            <View style={styles.progressBlock}>
              <Text style={styles.progressLabel}>
                {ui.step} {challengeIndex + 1} / {challenges.length}
              </Text>
              <View style={styles.progressDots}>
                {challenges.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.progressDot,
                      i < challengeIndex && styles.progressDotDone,
                      i === challengeIndex && styles.progressDotNow,
                    ]}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.triesHud}>Tries: {triesLeft}</Text>
          </View>

          <View style={styles.abdullahRow}>
            <Image
              source={require("../../assets/miniAbdullah.png")}
              style={styles.abdullahImg}
            />
            <View
              style={[
                styles.speechBubble,
                flash === "ok" && styles.speechOk,
                flash === "bad" && styles.speechBad,
              ]}
            >
              <Text style={styles.speechText}>
                {abdullahMood ??
                  (challenge.type === "spotMistake"
                    ? revealCount < challenge.options.length
                      ? ui.watchSequence
                      : ui.findMistake
                    : challenge.type === "quickChoice"
                      ? ui.quickChoice
                      : challenge.previousStepId
                        ? ui.whatsNext
                        : ui.howWeStart)}
              </Text>
            </View>
          </View>

          {challenge.type !== "spotMistake" && previousStep && (
            <View style={styles.justDidChip}>
              <Text style={styles.justDidLabel}>{ui.justDid}</Text>
              <Text style={styles.justDidValue}>
                {previousStep.emoji} {title(previousStep)}
              </Text>
            </View>
          )}

          <Animated.View
            style={{
              transform: [{ translateX: shakeX }, { scale: successScale }],
            }}
          >
            {challenge.type === "spotMistake" && (
              <View style={styles.sequenceRow}>
                {challenge.options.map((step, i) => {
                  const shown = i < revealCount;
                  const selected = pickedId === step.id;
                  return (
                    <React.Fragment key={`${step.id}-${i}`}>
                      {i > 0 && <Text style={styles.sequenceArrow}>→</Text>}
                      {shown ? (
                        <TouchableOpacity
                          style={[
                            styles.sequenceCard,
                            flash === "ok" && selected && styles.chipOk,
                            flash === "bad" && selected && styles.chipBad,
                          ]}
                          activeOpacity={0.85}
                          onPress={() => onChallengePick(step)}
                          disabled={
                            !!flash || revealCount < challenge.options.length
                          }
                        >
                          <Text style={styles.sequenceEmoji}>{step.emoji}</Text>
                          <Text style={styles.sequenceTitle} numberOfLines={2}>
                            {title(step)}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.sequencePlaceholder} />
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            )}

            {challenge.type === "quickChoice" && (
              <View style={styles.quickRow}>
                {challenge.options.map((step) => renderActionCard(step, { large: true }))}
              </View>
            )}

            {challenge.type === "whatsNext" && (
              <View style={styles.choiceGrid}>
                {challenge.options.map((step) => renderActionCard(step))}
              </View>
            )}
          </Animated.View>
        </ScrollView>
      )}

      {phase === "order" && (
        <View style={styles.orderBody}>
          <Text style={styles.orderHint}>{ui.tapNext}</Text>
          <Text style={styles.orderTarget}>
            {ui.step} {orderTarget} {ui.of} {WUDU_STEPS.length}
          </Text>
          <Text style={styles.triesText}>Tries: {triesLeft}</Text>

          <View style={styles.orderGrid}>
            {orderOptions.map((step) => (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.orderChip,
                  flash === "ok" && step.id === orderTarget && styles.chipOk,
                  flash === "bad" && styles.chipBad,
                ]}
                activeOpacity={0.85}
                onPress={() => onOrderPick(step)}
              >
                <Text style={styles.orderEmoji}>{step.emoji}</Text>
                <Text style={styles.orderChipText} numberOfLines={2}>
                  {title(step)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {challengeResultOpen && (
        <View style={styles.overlay} pointerEvents="auto">
          <View style={styles.resultCard}>
            <Text style={styles.modalTitle}>{resultCopy.title}</Text>
            {resultCopy.master && (
              <Text style={styles.masterBadge}>{ui.masterBadge}</Text>
            )}
            <StarRow stars={stars} maxStars={LEVEL1_STAR_MAX} />
            <Text style={styles.modalSub}>{resultCopy.msg}</Text>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => startLevel(1, false, false)}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>{ui.tryAgain}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={() => {
                setChallengeResultOpen(false);
                lockedRef.current = false;
                startLevel(2);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.btnGhostText}>{ui.continue}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <LevelClearModal
        visible={clearOpen}
        lang={uiLang as QuizLang}
        stars={stars}
        isLastLevel={level === 2}
        onNext={() => {
          setClearOpen(false);
          lockedRef.current = false;
          if (level === 2) {
            onExitToHub();
            return;
          }
          startLevel(2);
        }}
        onCancel={() => {
          setClearOpen(false);
          lockedRef.current = false;
        }}
      />

      <FailOverlay
        visible={failOpen}
        lang={uiLang as QuizLang}
        onRetry={() => {
          setFailOpen(false);
          lockedRef.current = false;
          setupOrderRound();
        }}
        onBack={onExitToHub}
      />
    </SafeAreaView>
  );
};

export default WuduMissionGame;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E0F2FE" },
  header: {
    paddingTop: 68,
    paddingBottom: 22,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
  },
  headerSub: {
    color: "#E0F2FE",
    marginTop: 6,
    fontWeight: "700",
  },
  langRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  langChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  langChipActive: {
    backgroundColor: "#0284C7",
    borderColor: "#0284C7",
  },
  langChipText: { fontWeight: "700", color: "#0369A1" },
  langChipTextActive: { color: "#fff" },
  introBody: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: "center",
    paddingTop: 12,
  },
  introAbdullah: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
  introHook: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "900",
    color: "#0C4A6E",
    textAlign: "center",
    lineHeight: 32,
  },
  challengeBody: {
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  hudRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  progressBlock: { flex: 1 },
  progressLabel: {
    color: "#0284C7",
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 6,
  },
  progressDots: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#BAE6FD",
  },
  progressDotDone: { backgroundColor: "#0284C7" },
  progressDotNow: {
    backgroundColor: "#F59E0B",
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: -2,
  },
  starBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  triesHud: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4B2AA8",
    marginVertical: 10,
    textAlign: "center",
  },
  abdullahRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 12,
    gap: 10,
  },
  abdullahImg: {
    width: 72,
    height: 72,
    resizeMode: "contain",
  },
  speechBubble: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    borderWidth: 2,
    borderColor: "#7DD3FC",
  },
  speechOk: { borderColor: "#22C55E", backgroundColor: "#F0FDF4" },
  speechBad: { borderColor: "#F87171", backgroundColor: "#FEF2F2" },
  speechText: {
    color: "#0C4A6E",
    fontWeight: "800",
    fontSize: 16,
    lineHeight: 22,
  },
  justDidChip: {
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#BAE6FD",
    marginBottom: 14,
    alignItems: "center",
  },
  justDidLabel: {
    color: "#0284C7",
    fontWeight: "800",
    fontSize: 11,
    textTransform: "uppercase",
  },
  justDidValue: {
    color: "#0C4A6E",
    fontWeight: "900",
    fontSize: 15,
    marginTop: 2,
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  quickRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#7DD3FC",
    minHeight: 118,
    elevation: 3,
  },
  actionCardGrid: {
    width: "46%",
  },
  actionCardLarge: {
    flex: 1,
    minHeight: 160,
    paddingVertical: 24,
  },
  actionEmoji: { fontSize: 36 },
  actionTitle: {
    marginTop: 8,
    fontWeight: "900",
    color: "#0C4A6E",
    textAlign: "center",
    fontSize: 15,
  },
  sequenceRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
  },
  sequenceArrow: {
    fontSize: 18,
    color: "#0284C7",
    fontWeight: "900",
    marginHorizontal: 4,
    alignSelf: "center",
  },
  sequenceCard: {
    flex: 1,
    minHeight: 118,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#7DD3FC",
    elevation: 3,
  },
  sequencePlaceholder: {
    flex: 1,
    minHeight: 118,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#BAE6FD",
    borderStyle: "dashed",
    backgroundColor: "#F0F9FF",
  },
  sequenceEmoji: { fontSize: 30 },
  sequenceTitle: {
    marginTop: 6,
    fontWeight: "800",
    color: "#0C4A6E",
    textAlign: "center",
    fontSize: 12,
  },
  nextBtn: {
    marginTop: 22,
    backgroundColor: "#0284C7",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
  },
  nextBtnText: { color: "#fff", fontWeight: "900", fontSize: 17 },
  orderBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  orderHint: {
    textAlign: "center",
    color: "#0369A1",
    fontWeight: "800",
    fontSize: 16,
  },
  orderTarget: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 20,
    fontWeight: "900",
    color: "#0C4A6E",
  },
  triesText: {
    textAlign: "center",
    marginTop: 6,
    color: "#64748B",
    fontWeight: "700",
  },
  orderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
    justifyContent: "center",
  },
  orderChip: {
    width: "46%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#BAE6FD",
    minHeight: 96,
    justifyContent: "center",
  },
  chipOk: { borderColor: "#22C55E", backgroundColor: "#F0FDF4" },
  chipBad: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  orderEmoji: { fontSize: 28 },
  orderChipText: {
    marginTop: 6,
    fontWeight: "800",
    color: "#0C4A6E",
    textAlign: "center",
    fontSize: 13,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.62)",
    justifyContent: "center",
    alignItems: "center",
    padding: 22,
    zIndex: 9999,
    elevation: 9999,
  },
  resultCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    elevation: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0C4A6E",
    textAlign: "center",
  },
  masterBadge: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "900",
    color: "#B45309",
    textAlign: "center",
  },
  modalSub: {
    marginTop: 4,
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 6,
  },
  btn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  btnPrimary: { backgroundColor: "#0284C7" },
  btnPrimaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btnGhost: { backgroundColor: "#E0F2FE" },
  btnGhostText: { color: "#0369A1", fontWeight: "800", fontSize: 16 },
});
