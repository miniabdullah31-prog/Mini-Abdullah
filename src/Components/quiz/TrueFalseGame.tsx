import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import BackButton from "../BackButton";
import { useFeatureBackHandler } from "../../hooks/useFeatureBackHandler";
import {
  MAX_WRONG_ATTEMPTS,
  pickTrueFalseRound,
  QuizLang,
  QUIZ_UI,
  starsFromWrongAttempts,
  TRUE_FALSE_L1,
  TRUE_FALSE_L2,
  TrueFalseItem,
} from "../../data/quizGames";
import { bumpPlayCount, getPlayCount } from "../../services/quizPlayStore";
import {
  LevelClearModal,
  QuizLangChips,
  FailOverlay,
  openFailSoon,
} from "./QuizShared";

type Props = { onExitToHub: () => void };

const TrueFalseGame: React.FC<Props> = ({ onExitToHub }) => {
  const [uiLang, setUiLang] = useState<QuizLang>("en");
  const [level, setLevel] = useState(1);
  const [wrong, setWrong] = useState(0);
  const [items, setItems] = useState<TrueFalseItem[]>([]);
  const [index, setIndex] = useState(0);
  const [clearOpen, setClearOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const wrongRef = useRef(0);
  const lockedRef = useRef(false);

  const ui = QUIZ_UI[uiLang];
  const item = items[index];
  const triesLeft = Math.max(0, MAX_WRONG_ATTEMPTS - wrong);

  const startLevel = useCallback(async (lvl: number, countPlay = true) => {
    lockedRef.current = false;
    const pool = lvl === 1 ? TRUE_FALSE_L1 : TRUE_FALSE_L2;
    const plays = await getPlayCount("truefalse", lvl);
    const round = pickTrueFalseRound(
      pool,
      countPlay ? plays : Math.max(0, plays - 1),
    );
    if (countPlay) {
      await bumpPlayCount("truefalse", lvl);
    }
    setItems(round);
    setIndex(0);
    setWrong(0);
    wrongRef.current = 0;
    setFlash(null);
    setClearOpen(false);
    setFailOpen(false);
    setLevel(lvl);
  }, []);

  useEffect(() => {
    startLevel(1);
  }, [startLevel]);

  useEffect(() => {
    if (triesLeft === 0 && !clearOpen && !failOpen) {
      openFailSoon(setFailOpen);
    }
  }, [triesLeft, clearOpen, failOpen]);

  const goBackStep = useCallback((): boolean => {
    lockedRef.current = false;
    setFlash(null);
    if (clearOpen) {
      setClearOpen(false);
      return true;
    }
    if (failOpen) {
      setFailOpen(false);
      return true;
    }
    if (index > 0) {
      setIndex((i) => i - 1);
      return true;
    }
    if (level > 1) {
      startLevel(level - 1, false);
      return true;
    }
    return false;
  }, [clearOpen, failOpen, index, level, startLevel]);

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

  const onPick = (choice: boolean) => {
    if (!item || clearOpen || failOpen || flash || lockedRef.current) {
      return;
    }

    if (choice === item.answer) {
      setFlash("ok");
      setTimeout(() => {
        setFlash(null);
        if (index + 1 >= items.length) {
          lockedRef.current = true;
          const s = starsFromWrongAttempts(wrongRef.current);
          setStars(s);
          setClearOpen(true);
        } else {
          setIndex((i) => i + 1);
        }
      }, 450);
      return;
    }

    setFlash("bad");
    wrongRef.current += 1;
    setWrong(wrongRef.current);
    setTimeout(() => setFlash(null), 450);
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={onBack} />
      <ImageBackground
        source={require("../../homeAssets/Quotebg.jpg")}
        style={styles.header}
        imageStyle={{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <Text style={styles.headerTitle}>True or False</Text>
        <Text style={styles.headerSub}>
          {ui.level} {level} · {index + 1}/{items.length || 5}
        </Text>
      </ImageBackground>

      <View style={styles.body}>
        <QuizLangChips lang={uiLang} onChange={setUiLang} modes={["en", "ur"]} />

        <View style={styles.attemptsRow}>
          <Text style={styles.attemptsText}>
            {ui.attemptsLeft}: {triesLeft}
          </Text>
        </View>

        {item && (
          <View
            style={[
              styles.statementCard,
              flash === "ok" && styles.flashOk,
              flash === "bad" && styles.flashBad,
            ]}
          >
            <Text style={styles.statementText}>{item.statement}</Text>
          </View>
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.choiceBtn, styles.trueBtn]}
            activeOpacity={0.85}
            onPress={() => onPick(true)}
          >
            <Text style={styles.choiceEmoji}>✓</Text>
            <Text style={styles.choiceLabel}>True</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.choiceBtn, styles.falseBtn]}
            activeOpacity={0.85}
            onPress={() => onPick(false)}
          >
            <Text style={styles.choiceEmoji}>✗</Text>
            <Text style={styles.choiceLabel}>False</Text>
          </TouchableOpacity>
        </View>
      </View>

      <LevelClearModal
        visible={clearOpen}
        lang={uiLang}
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
        lang={uiLang}
        onRetry={() => {
          setFailOpen(false);
          lockedRef.current = false;
          startLevel(level, false);
        }}
        onBack={() => {
          setFailOpen(false);
          onExitToHub();
        }}
      />
    </SafeAreaView>
  );
};

export default TrueFalseGame;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFBEB" },
  header: {
    paddingTop: 68,
    paddingBottom: 24,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
  },
  headerSub: {
    color: "#FEF3C7",
    marginTop: 6,
    fontWeight: "700",
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  attemptsRow: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  attemptsText: {
    color: "#92400E",
    fontWeight: "800",
    fontSize: 14,
  },
  statementCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    minHeight: 140,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FDE68A",
    elevation: 3,
  },
  flashOk: {
    borderColor: "#22C55E",
    backgroundColor: "#F0FDF4",
  },
  flashBad: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  statementText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#1F2937",
    fontWeight: "700",
    textAlign: "center",
  },
  btnRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 28,
  },
  choiceBtn: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 22,
    alignItems: "center",
    elevation: 4,
  },
  trueBtn: {
    backgroundColor: "#22C55E",
  },
  falseBtn: {
    backgroundColor: "#EF4444",
  },
  choiceEmoji: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "900",
  },
  choiceLabel: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
    marginTop: 4,
  },
});
