import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import BackButton from "../BackButton";
import { useFeatureBackHandler } from "../../hooks/useFeatureBackHandler";
import {
  GRID_SIZE,
  MAX_WRONG_ATTEMPTS,
  QuizLang,
  QUIZ_UI,
  WORD_SEARCH_L1,
  WORD_SEARCH_L2,
  fillerAlphabet,
  pickRoundWords,
  starsFromWrongAttempts,
  wordForLang,
  WordTriple,
} from "../../data/quizGames";
import { bumpPlayCount, getPlayCount } from "../../services/quizPlayStore";
import {
  LevelClearModal,
  QuizLangChips,
  FailOverlay,
  openFailSoon,
} from "./QuizShared";

type Props = {
  onExitToHub: () => void;
};

type Cell = { r: number; c: number };

type Placed = {
  word: string;
  cells: Cell[];
};

function cellsOnLine(a: Cell, b: Cell): Cell[] | null {
  if (a.r === b.r) {
    const step = a.c <= b.c ? 1 : -1;
    const out: Cell[] = [];
    for (let c = a.c; c !== b.c + step; c += step) out.push({ r: a.r, c });
    return out;
  }
  if (a.c === b.c) {
    const step = a.r <= b.r ? 1 : -1;
    const out: Cell[] = [];
    for (let r = a.r; r !== b.r + step; r += step) out.push({ r, c: a.c });
    return out;
  }
  // diagonal (level 2 friendly)
  if (Math.abs(a.r - b.r) === Math.abs(a.c - b.c)) {
    const rStep = a.r <= b.r ? 1 : -1;
    const cStep = a.c <= b.c ? 1 : -1;
    const out: Cell[] = [];
    let r = a.r;
    let c = a.c;
    while (true) {
      out.push({ r, c });
      if (r === b.r && c === b.c) break;
      r += rStep;
      c += cStep;
    }
    return out;
  }
  return null;
}

function cellKey(c: Cell) {
  return `${c.r},${c.c}`;
}

function buildGrid(
  words: string[],
  lang: QuizLang,
  allowDiagonal: boolean,
): { grid: string[][]; placed: Placed[] } {
  const size = GRID_SIZE;
  const grid: (string | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
  const placed: Placed[] = [];
  const dirs = allowDiagonal
    ? [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
      ]
    : [
        [0, 1],
        [1, 0],
      ];

  const sorted = [...words].sort((a, b) => b.length - a.length);

  for (const raw of sorted) {
    const word = lang === "en" ? raw.toUpperCase() : raw;
    const letters = Array.from(word);
    let ok = false;
    for (let attempt = 0; attempt < 80 && !ok; attempt++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const maxR = dr === 0 ? size - 1 : size - letters.length;
      const maxC = dc === 0 ? size - 1 : dc > 0 ? size - letters.length : size - 1;
      const minC = dc < 0 ? letters.length - 1 : 0;
      if (maxR < 0 || maxC < minC) continue;
      const r0 = Math.floor(Math.random() * (maxR + 1));
      const c0 =
        minC + Math.floor(Math.random() * (maxC - minC + 1));
      const cells: Cell[] = [];
      let fits = true;
      for (let i = 0; i < letters.length; i++) {
        const r = r0 + dr * i;
        const c = c0 + dc * i;
        if (r < 0 || c < 0 || r >= size || c >= size) {
          fits = false;
          break;
        }
        const cur = grid[r][c];
        if (cur && cur !== letters[i]) {
          fits = false;
          break;
        }
        cells.push({ r, c });
      }
      if (!fits) continue;
      cells.forEach((cell, i) => {
        grid[cell.r][cell.c] = letters[i];
      });
      placed.push({ word, cells });
      ok = true;
    }
  }

  const fill = fillerAlphabet(lang);
  const out: string[][] = grid.map((row) =>
    row.map((ch) => ch || fill[Math.floor(Math.random() * fill.length)]),
  );
  return { grid: out, placed };
}

const WordSearchGame: React.FC<Props> = ({ onExitToHub }) => {
  const [lang, setLang] = useState<QuizLang>("en");
  const [level, setLevel] = useState(1);
  const [session, setSession] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [selecting, setSelecting] = useState<Cell[]>([]);
  const [clearOpen, setClearOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [targets, setTargets] = useState<WordTriple[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [boardW, setBoardW] = useState(0);
  const startRef = useRef<Cell | null>(null);
  const selectingRef = useRef<Cell[]>([]);
  const foundRef = useRef<string[]>([]);
  const wrongRef = useRef(0);
  const lockedRef = useRef(false);
  const selectKeyRef = useRef("");
  const targetWordsRef = useRef<string[]>([]);
  const gridRef = useRef<string[][]>([]);
  const placedRef = useRef<Placed[]>([]);

  const ui = QUIZ_UI[lang === "ar" ? "en" : lang];
  const uiLang: QuizLang = lang === "ar" ? "en" : lang;
  const cellSize = boardW > 0 ? boardW / GRID_SIZE : 36;
  const triesLeft = Math.max(0, MAX_WRONG_ATTEMPTS - wrong);

  const startLevel = useCallback(
    async (lvl: number, language: QuizLang, countPlay = true) => {
      lockedRef.current = false;
      const pool = lvl === 1 ? WORD_SEARCH_L1 : WORD_SEARCH_L2;
      const plays = await getPlayCount("wordsearch", lvl);
      const round = pickRoundWords(pool, countPlay ? plays : Math.max(0, plays - 1));
      if (countPlay) await bumpPlayCount("wordsearch", lvl);
      const words = round.map((w) => wordForLang(w, language));
      const built = buildGrid(words, language, lvl === 2);
      setTargets(round);
      setGrid(built.grid);
      gridRef.current = built.grid;
      setPlaced(built.placed);
      placedRef.current = built.placed;
      setFound([]);
      foundRef.current = [];
      setFoundCells(new Set());
      setSelecting([]);
      selectingRef.current = [];
      selectKeyRef.current = "";
      setWrong(0);
      wrongRef.current = 0;
      targetWordsRef.current = words;
      setClearOpen(false);
      setFailOpen(false);
      setLevel(lvl);
      setSession((s) => s + 1);
    },
    [],
  );

  useEffect(() => {
    startLevel(1, lang);
  }, []);

  // Safety: if attempts hit 0 but modal never opened (gesture race), force it
  useEffect(() => {
    if (triesLeft === 0 && !clearOpen && !failOpen) {
      openFailSoon(setFailOpen);
    }
  }, [triesLeft, clearOpen, failOpen]);

  const goBackStep = useCallback((): boolean => {
    lockedRef.current = false;
    if (clearOpen) {
      setClearOpen(false);
      return true;
    }
    if (failOpen) {
      setFailOpen(false);
      return true;
    }
    if (selecting.length > 0) {
      startRef.current = null;
      selectingRef.current = [];
      selectKeyRef.current = "";
      setSelecting([]);
      return true;
    }
    if (found.length > 0) {
      const last = found[found.length - 1];
      const nextFound = found.slice(0, -1);
      foundRef.current = nextFound;
      setFound(nextFound);
      const placedMatch = placedRef.current.find(
        (p) =>
          p.word === last || p.word.toUpperCase() === last.toUpperCase(),
      );
      if (placedMatch) {
        setFoundCells((prev) => {
          const next = new Set(prev);
          placedMatch.cells.forEach((c) => next.delete(cellKey(c)));
          return next;
        });
      }
      return true;
    }
    if (level > 1) {
      startLevel(level - 1, lang, false);
      return true;
    }
    return false;
  }, [clearOpen, failOpen, selecting.length, found, level, lang, startLevel]);

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

  const onLangChange = (l: QuizLang) => {
    setLang(l);
    startLevel(level, l);
  };

  const targetWords = useMemo(
    () => targets.map((w) => wordForLang(w, lang === "en" ? "en" : lang)),
    [targets, lang],
  );

  useEffect(() => {
    targetWordsRef.current = targetWords;
  }, [targetWords]);

  const pointToCell = (x: number, y: number): Cell | null => {
    if (boardW <= 0) return null;
    const c = Math.floor(x / cellSize);
    const r = Math.floor(y / cellSize);
    if (r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE) return null;
    return { r, c };
  };

  const finishSelection = () => {
    const cells = selectingRef.current;
    startRef.current = null;
    setSelecting([]);
    selectingRef.current = [];
    if (lockedRef.current) return;
    if (cells.length < 2) return;

    const g = gridRef.current;
    const letters = cells.map((cell) => g[cell.r][cell.c]).join("");
    const reverse = [...cells]
      .reverse()
      .map((cell) => g[cell.r][cell.c])
      .join("");

    const currentFound = foundRef.current;
    const targetsNow = targetWordsRef.current;
    const match = targetsNow.find(
      (w) =>
        !currentFound.includes(w) &&
        (w === letters ||
          w === reverse ||
          w.toUpperCase() === letters ||
          w.toUpperCase() === reverse),
    );

    if (match) {
      const placedMatch = placedRef.current.find(
        (p) =>
          p.word === match ||
          p.word.toUpperCase() === match.toUpperCase(),
      );
      const nextFound = [...currentFound, match];
      foundRef.current = nextFound;
      setFound(nextFound);
      if (placedMatch) {
        setFoundCells((prev) => {
          const n = new Set(prev);
          placedMatch.cells.forEach((c) => n.add(cellKey(c)));
          return n;
        });
      } else {
        setFoundCells((prev) => {
          const n = new Set(prev);
          cells.forEach((c) => n.add(cellKey(c)));
          return n;
        });
      }
      if (nextFound.length >= targetsNow.length) {
        lockedRef.current = true;
        const s = starsFromWrongAttempts(wrongRef.current);
        setStars(s);
        setClearOpen(true);
      }
      return;
    }

    if (wrongRef.current >= MAX_WRONG_ATTEMPTS) {
      lockedRef.current = true;
      openFailSoon(setFailOpen);
      return;
    }

    const nextWrong = wrongRef.current + 1;
    wrongRef.current = nextWrong;
    setWrong(nextWrong);
    if (nextWrong >= MAX_WRONG_ATTEMPTS) {
      lockedRef.current = true;
      openFailSoon(setFailOpen);
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !lockedRef.current,
        onMoveShouldSetPanResponder: () => !lockedRef.current,
        onPanResponderGrant: (evt) => {
          if (lockedRef.current) return;
          const { locationX, locationY } = evt.nativeEvent;
          const cell = pointToCell(locationX, locationY);
          if (!cell) return;
          startRef.current = cell;
          selectingRef.current = [cell];
          selectKeyRef.current = cellKey(cell);
          setSelecting([cell]);
        },
        onPanResponderMove: (evt) => {
          if (lockedRef.current) return;
          const start = startRef.current;
          if (!start) return;
          const { locationX, locationY } = evt.nativeEvent;
          const end = pointToCell(locationX, locationY);
          if (!end) return;
          const line = cellsOnLine(start, end);
          if (!line) return;
          const key = line.map(cellKey).join("|");
          if (key === selectKeyRef.current) return;
          selectKeyRef.current = key;
          selectingRef.current = line;
          setSelecting(line);
        },
        onPanResponderRelease: () => finishSelection(),
        onPanResponderTerminate: () => finishSelection(),
      }),
    [boardW, cellSize],
  );

  const selectingSet = useMemo(
    () => new Set(selecting.map(cellKey)),
    [selecting],
  );

  const onBoardLayout = (e: LayoutChangeEvent) => {
    setBoardW(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.root}>
    <SafeAreaView style={styles.container}>
      <View style={styles.flex}>
      <ImageBackground
        source={require("../../homeAssets/Quotebg.jpg")}
        style={styles.header}
        imageStyle={styles.headerRadius}
      >
        <BackButton onPress={onBack} />
        <Text style={styles.title}>{ui.wordSearch}</Text>
        <Text style={styles.sub}>
          {ui.level} {level} · {ui.attemptsLeft}: {triesLeft}
        </Text>
      </ImageBackground>

      <QuizLangChips lang={lang} onChange={onLangChange} />

      <Text style={styles.findLabel}>{ui.findWords}</Text>
      <View style={styles.wordChips}>
        {targetWords.map((w) => (
          <View
            key={w}
            style={[
              styles.wordChip,
              found.includes(w) && styles.wordChipFound,
            ]}
          >
            <Text
              style={[
                styles.wordChipText,
                found.includes(w) && styles.wordChipTextFound,
                lang !== "en" && styles.rtl,
              ]}
            >
              {w}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={styles.boardWrap}
        onLayout={onBoardLayout}
        pointerEvents={triesLeft === 0 || clearOpen || failOpen ? "none" : "auto"}
        {...panResponder.panHandlers}
      >
        {grid.map((row, r) => (
          <View key={`r${r}-${session}`} style={styles.row}>
            {row.map((ch, c) => {
              const key = cellKey({ r, c });
              const isSel = selectingSet.has(key);
              const isFound = foundCells.has(key);
              return (
                <View
                  key={key}
                  style={[
                    styles.cell,
                    { width: cellSize, height: cellSize },
                    isFound && styles.cellFound,
                    isSel && styles.cellSelecting,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      lang !== "en" && { fontSize: cellSize * 0.38 },
                    ]}
                  >
                    {ch}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
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
          startLevel(2, lang);
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
          startLevel(level, lang, false);
        }}
        onBack={() => {
          setFailOpen(false);
          onExitToHub();
        }}
      />
    </View>
  );
};

export default WordSearchGame;

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
  sub: { color: "#EAE2FF", marginTop: 6, fontWeight: "700" },
  findLabel: {
    marginTop: 14,
    marginHorizontal: 16,
    color: "#4B2AA8",
    fontWeight: "800",
    fontSize: 16,
  },
  wordChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  wordChip: {
    backgroundColor: "#EEE8FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  wordChipFound: { backgroundColor: "#C8F0D8" },
  wordChipText: { color: "#4B2AA8", fontWeight: "700", fontSize: 14 },
  wordChipTextFound: { color: "#1B7A45", textDecorationLine: "line-through" },
  rtl: { writingDirection: "rtl" },
  boardWrap: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 6,
    elevation: 3,
    alignSelf: "stretch",
  },
  row: { flexDirection: "row" },
  cell: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  cellSelecting: { backgroundColor: "rgba(108,77,247,0.35)" },
  cellFound: { backgroundColor: "rgba(46,180,120,0.35)" },
  cellText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
  },
});
