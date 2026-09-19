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
  MEANING_L1,
  MEANING_L2,
  QuizLang,
  QUIZ_UI,
  pickRoundWords,
  shuffle,
  starsFromWrongAttempts,
  WordTriple,
} from "../../data/quizGames";
import { bumpPlayCount, getPlayCount } from "../../services/quizPlayStore";
import { playUiSound } from "../../services/soundService";
import { useClaimGameReward } from "../../hooks/useClaimGameReward";
import {
  LevelClearModal,
  QuizLangChips,
  FailOverlay,
  openFailSoon,
} from "./QuizShared";

type Props = { onExitToHub: () => void };
type AnswerLang = "ur" | "en";

type Question = {
  arabic: string;
  correct: string;
  options: string[];
};

const MeaningGame: React.FC<Props> = ({ onExitToHub }) => {
  const [uiLang, setUiLang] = useState<QuizLang>("en");
  const [answerLang, setAnswerLang] = useState<AnswerLang>("en");
  const [level, setLevel] = useState(1);
  const [wrong, setWrong] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [clearOpen, setClearOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const wrongRef = useRef(0);
  const lockedRef = useRef(false);

  const ui = QUIZ_UI[uiLang];
  const q = questions[index];
  const triesLeft = Math.max(0, MAX_WRONG_ATTEMPTS - wrong);
  useClaimGameReward("meaning", level, clearOpen);

  const buildQuestions = (round: WordTriple[], pool: WordTriple[], ans: AnswerLang) => {
    return round.map((item) => {
      const correct = ans === "ur" ? item.ur : item.en;
      const distractors = shuffle(
        pool
          .filter((p) => p.ar !== item.ar)
          .map((p) => (ans === "ur" ? p.ur : p.en)),
      )
        .filter((t) => t !== correct)
        .slice(0, 3);
      const options = shuffle([correct, ...distractors]);
      return { arabic: item.ar, correct, options };
    });
  };

  const startLevel = useCallback(async (lvl: number, ans: AnswerLang, countPlay = true) => {
    lockedRef.current = false;
    const pool = lvl === 1 ? MEANING_L1 : MEANING_L2;
    const plays = await getPlayCount("meaning", lvl);
    const round = pickRoundWords(pool, countPlay ? plays : Math.max(0, plays - 1));
    if (countPlay) await bumpPlayCount("meaning", lvl);
    setQuestions(buildQuestions(round, pool, ans));
    setIndex(0);
    setWrong(0);
    wrongRef.current = 0;
    setFlash(null);
    setClearOpen(false);
    setFailOpen(false);
    setLevel(lvl);
  }, []);

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
      startLevel(level - 1, answerLang, false);
      return true;
    }
    return false;
  }, [clearOpen, failOpen, index, level, answerLang, startLevel]);

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

  const onPick = (opt: string) => {
    if (!q || clearOpen || failOpen || flash || lockedRef.current) return;
    if (opt === q.correct) {
      setFlash("ok");
      setTimeout(() => {
        setFlash(null);
        if (index + 1 >= questions.length) {
          lockedRef.current = true;
          const s = starsFromWrongAttempts(wrongRef.current);
          setStars(s);
          playUiSound("gameWin");
          setClearOpen(true);
        } else {
          playUiSound("success");
          setIndex((i) => i + 1);
        }
      }, 450);
    } else {
      playUiSound("wrong");
      setFlash("bad");
      if (wrongRef.current >= MAX_WRONG_ATTEMPTS) return;
      const next = wrongRef.current + 1;
      wrongRef.current = next;
      setWrong(next);
      setTimeout(() => {
        setFlash(null);
        if (next >= MAX_WRONG_ATTEMPTS) {
          lockedRef.current = true;
          openFailSoon(setFailOpen);
        }
      }, 450);
    }
  };

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
          <Text style={styles.title}>{ui.meaningGame}</Text>
          <Text style={styles.sub}>
            {ui.level} {level} · {index + 1}/{Math.max(questions.length, 1)} ·{" "}
            {ui.attemptsLeft}: {triesLeft}
          </Text>
        </ImageBackground>

        <QuizLangChips
          lang={answerLang}
          onChange={onAnswerLang}
          modes={["ur", "en"]}
        />

        <Text style={styles.hint}>{ui.meaningHint}</Text>

        {q ? (
          <View style={styles.promptBox}>
            <Text style={styles.arabic}>{q.arabic}</Text>
            <View style={styles.options}>
              {q.options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  disabled={!!flash || failOpen || clearOpen}
                  style={[
                    styles.option,
                    flash === "ok" &&
                      opt === q.correct &&
                      styles.optionOk,
                    flash === "bad" &&
                      opt !== q.correct &&
                      styles.optionIdle,
                  ]}
                  onPress={() => onPick(opt)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      answerLang === "ur" && styles.rtl,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
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

export default MeaningGame;

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
  sub: { color: "#EAE2FF", marginTop: 6, fontWeight: "700", textAlign: "center" },
  hint: {
    marginTop: 14,
    marginHorizontal: 16,
    color: "#4B2AA8",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
  promptBox: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    elevation: 3,
  },
  arabic: {
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    color: "#2E1A6B",
    marginVertical: 18,
    writingDirection: "rtl",
    lineHeight: 56,
  },
  options: { gap: 10 },
  option: {
    backgroundColor: "#F5F2FF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: "#E6DEFF",
  },
  optionOk: {
    backgroundColor: "rgba(46,180,120,0.3)",
    borderColor: "#2EB478",
  },
  optionIdle: { opacity: 0.7 },
  optionText: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: 17,
    color: "#333",
  },
  rtl: { writingDirection: "rtl" },
});
