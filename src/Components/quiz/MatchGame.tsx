import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import BackButton from "../BackButton";
import { useFeatureBackHandler } from "../../hooks/useFeatureBackHandler";
import {
  MAX_WRONG_ATTEMPTS,
  MATCH_L1,
  MATCH_L2,
  QuizLang,
  QUIZ_UI,
  pickRoundWords,
  shuffle,
  starsFromWrongAttempts,
  WordTriple,
} from "../../data/quizGames";
import { bumpPlayCount, getPlayCount } from "../../services/quizPlayStore";
import {
  LevelClearModal,
  QuizLangChips,
  FailOverlay,
  openFailSoon,
} from "./QuizShared";

type Props = { onExitToHub: () => void };
type AnswerLang = "ur" | "en";

type PairItem = {
  id: string;
  side: "ar" | "ans";
  label: string;
  wordKey: string;
};

const MatchGame: React.FC<Props> = ({ onExitToHub }) => {
  const [uiLang, setUiLang] = useState<QuizLang>("en");
  const [answerLang, setAnswerLang] = useState<AnswerLang>("en");
  const [level, setLevel] = useState(1);
  const [wrong, setWrong] = useState(0);
  const [left, setLeft] = useState<PairItem[]>([]);
  const [right, setRight] = useState<PairItem[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [matchHistory, setMatchHistory] = useState<string[]>([]);
  const [selected, setSelected] = useState<PairItem | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [flashBad, setFlashBad] = useState<string | null>(null);
  const wrongRef = useRef(0);
  const lockedRef = useRef(false);
  const matchedCountRef = useRef(0);
  const totalRef = useRef(0);

  const ui = QUIZ_UI[uiLang];
  const triesLeft = Math.max(0, MAX_WRONG_ATTEMPTS - wrong);

  const buildBoard = (round: WordTriple[], ans: AnswerLang) => {
    const arItems: PairItem[] = round.map((w, i) => ({
      id: `ar-${i}-${w.ar}`,
      side: "ar",
      label: w.ar,
      wordKey: w.ar,
    }));
    const ansItems: PairItem[] = round.map((w, i) => ({
      id: `ans-${i}-${w.ar}`,
      side: "ans",
      label: ans === "ur" ? w.ur : w.en,
      wordKey: w.ar,
    }));
    setLeft(shuffle(arItems));
    setRight(shuffle(ansItems));
    setMatched(new Set());
    setMatchHistory([]);
    matchedCountRef.current = 0;
    totalRef.current = round.length;
    setSelected(null);
    setFlashBad(null);
  };

  const startLevel = useCallback(
    async (lvl: number, ans: AnswerLang, countPlay = true) => {
      lockedRef.current = false;
      const pool = lvl === 1 ? MATCH_L1 : MATCH_L2;
      const plays = await getPlayCount("match", lvl);
      const round = pickRoundWords(
        pool,
        countPlay ? plays : Math.max(0, plays - 1),
      );
      if (countPlay) await bumpPlayCount("match", lvl);
      buildBoard(round, ans);
      setWrong(0);
      wrongRef.current = 0;
      setClearOpen(false);
      setFailOpen(false);
      setLevel(lvl);
    },
    [],
  );

  useEffect(() => {
    startLevel(1, answerLang);
  }, []);

  useEffect(() => {
    if (triesLeft === 0 && !clearOpen && !failOpen) {
      openFailSoon(setFailOpen);
    }
  }, [triesLeft, clearOpen, failOpen]);

  const goBackStep = useCallback((): boolean => {
    lockedRef.current = false;
    setFlashBad(null);
    if (clearOpen) {
      setClearOpen(false);
      return true;
    }
    if (failOpen) {
      setFailOpen(false);
      return true;
    }
    if (selected) {
      setSelected(null);
      return true;
    }
    if (matchHistory.length > 0) {
      const last = matchHistory[matchHistory.length - 1];
      setMatchHistory((h) => h.slice(0, -1));
      setMatched((prev) => {
        const next = new Set(prev);
        next.delete(last);
        return next;
      });
      matchedCountRef.current = Math.max(0, matchedCountRef.current - 1);
      return true;
    }
    if (level > 1) {
      startLevel(level - 1, answerLang, false);
      return true;
    }
    return false;
  }, [
    clearOpen,
    failOpen,
    selected,
    matchHistory,
    level,
    answerLang,
    startLevel,
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

  const onAnswerLang = (l: QuizLang) => {
    if (l === "ar") return;
    setAnswerLang(l);
    setUiLang(l);
    startLevel(level, l);
  };

  const markMatch = (wordKey: string) => {
    setMatched((prev) => {
      const next = new Set(prev);
      next.add(wordKey);
      return next;
    });
    matchedCountRef.current += 1;
    setMatchHistory((h) => [...h, wordKey]);
    setSelected(null);
    if (matchedCountRef.current >= totalRef.current) {
      lockedRef.current = true;
      const s = starsFromWrongAttempts(wrongRef.current);
      setStars(s);
      setClearOpen(true);
    }
  };

  const onTap = (item: PairItem) => {
    if (
      lockedRef.current ||
      clearOpen ||
      failOpen ||
      matched.has(item.wordKey) ||
      flashBad
    ) {
      return;
    }

    if (!selected) {
      setSelected(item);
      return;
    }

    if (selected.id === item.id) {
      setSelected(null);
      return;
    }

    if (selected.side === item.side) {
      setSelected(item);
      return;
    }

    if (selected.wordKey === item.wordKey) {
      markMatch(item.wordKey);
      return;
    }

    setFlashBad(item.id);
    if (wrongRef.current >= MAX_WRONG_ATTEMPTS) return;
    const next = wrongRef.current + 1;
    wrongRef.current = next;
    setWrong(next);
    setTimeout(() => {
      setFlashBad(null);
      setSelected(null);
      if (next >= MAX_WRONG_ATTEMPTS) {
        lockedRef.current = true;
        openFailSoon(setFailOpen);
      }
    }, 450);
  };

  const renderCol = (items: PairItem[]) =>
    items.map((item) => {
      const isDone = matched.has(item.wordKey);
      const isSel = selected?.id === item.id;
      const isBad = flashBad === item.id;
      return (
        <TouchableOpacity
          key={item.id}
          disabled={isDone || !!flashBad || failOpen || clearOpen}
          style={[
            styles.chip,
            isDone && styles.chipDone,
            isSel && styles.chipSelected,
            isBad && styles.chipBad,
          ]}
          onPress={() => onTap(item)}
        >
          <Text
            style={[
              styles.chipText,
              item.side === "ar" && styles.arText,
              answerLang === "ur" && item.side === "ans" && styles.rtl,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    });

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container}>
        <View style={styles.flex}>
          <BackButton onPress={onBack} />
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <ImageBackground
              source={require("../../homeAssets/Quotebg.jpg")}
              style={styles.header}
              imageStyle={styles.headerRadius}
            >
              <Text style={styles.title}>{ui.matchGame}</Text>
              <Text style={styles.sub}>
                {ui.level} {level} · {matched.size}/{Math.max(totalRef.current, 1)} ·{" "}
                {ui.attemptsLeft}: {triesLeft}
              </Text>
            </ImageBackground>

            <QuizLangChips
              lang={answerLang}
              onChange={onAnswerLang}
              modes={["ur", "en"]}
            />

            <Text style={styles.hint}>{ui.matchHint}</Text>

            <View style={styles.board}>
              <View style={styles.col}>{renderCol(left)}</View>
              <View style={styles.col}>{renderCol(right)}</View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

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
          startLevel(2, answerLang);
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
          startLevel(level, answerLang, false);
        }}
        onBack={() => {
          setFailOpen(false);
          onExitToHub();
        }}
      />
    </View>
  );
};

export default MatchGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  flex: { flex: 1 },
  header: {
    paddingTop: 70,
    paddingBottom: 28,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerRadius: { borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 6 },
  sub: {
    color: "#EAE2FF",
    marginTop: 6,
    fontWeight: "700",
    textAlign: "center",
  },
  hint: {
    marginTop: 14,
    marginHorizontal: 16,
    color: "#4B2AA8",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
  board: {
    marginTop: 16,
    marginHorizontal: 12,
    flexDirection: "row",
    gap: 10,
  },
  col: { flex: 1, gap: 10 },
  chip: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "#E6DEFF",
    minHeight: 64,
    justifyContent: "center",
    elevation: 2,
  },
  chipSelected: {
    borderColor: "#5B33C4",
    backgroundColor: "#F5F2FF",
  },
  chipDone: {
    backgroundColor: "rgba(46,180,120,0.25)",
    borderColor: "#2EB478",
    opacity: 0.85,
  },
  chipBad: {
    backgroundColor: "rgba(220,80,80,0.2)",
    borderColor: "#DC5050",
  },
  chipText: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
    color: "#333",
  },
  arText: {
    fontSize: 22,
    color: "#2E1A6B",
    writingDirection: "rtl",
  },
  rtl: { writingDirection: "rtl" },
});
