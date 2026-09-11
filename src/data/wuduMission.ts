/** Wudu Mission — step data for kids */

import { shuffle } from "./quizGames";

export type WuduStep = {
  id: number;
  emoji: string;
  titleEn: string;
  titleUr: string;
  detailEn: string;
  detailUr: string;
  /** Mini Abdullah style line */
  kidLineEn: string;
  kidLineUr: string;
};

export const WUDU_STEPS: WuduStep[] = [
  {
    id: 1,
    emoji: "💭",
    titleEn: "Niyyah (Intention)",
    titleUr: "نیت",
    detailEn: "Make intention in your heart to do wudu for Allah.",
    detailUr: "دل میں اللہ کی رضا کے لیے وضو کی نیت کریں۔",
    kidLineEn: "First, say in your heart: I am doing wudu to become clean for Allah!",
    kidLineUr: "Pehle dil mein socho: main Allah ke liye wudu kar raha hoon!",
  },
  {
    id: 2,
    emoji: "🤲",
    titleEn: "Wash Hands",
    titleUr: "ہاتھ دھونا",
    detailEn: "Wash both hands up to the wrists three times.",
    detailUr: "دونوں ہاتھ کلائیوں تک تین مرتبہ دھوئیں۔",
    kidLineEn: "Wash your hands three times — in between fingers too!",
    kidLineUr: "Hath teen bar dho — ungliyon ke beech bhi!",
  },
  {
    id: 3,
    emoji: "💧",
    titleEn: "Rinse Mouth",
    titleUr: "کلی کرنا",
    detailEn: "Take water in your mouth, swirl and spit out — three times.",
    detailUr: "منہ میں پانی لے کر کلی کریں اور تھوک دیں — تین بار۔",
    kidLineEn: "Take water, swirl in mouth, spit out. Do it three times!",
    kidLineUr: "Pani mun mein lo, ghumao, thook do. Teen bar!",
  },
  {
    id: 4,
    emoji: "👃",
    titleEn: "Rinse Nose",
    titleUr: "ناک دھونا",
    detailEn: "Sniff water into the nose and blow out — three times.",
    detailUr: "ناک میں پانی چڑھائیں اور باہر نکالیں — تین بار۔",
    kidLineEn: "Gently sniff water in your nose, then blow out. Three times!",
    kidLineUr: "Naak mein halka pani, phir bahar. Teen bar!",
  },
  {
    id: 5,
    emoji: "😊",
    titleEn: "Wash Face",
    titleUr: "منہ دھونا",
    detailEn: "Wash the whole face from hairline to chin, ear to ear — three times.",
    detailUr: "پورا چہرہ ماتھے سے ٹھوڑی اور کان سے کان تک تین بار دھوئیں۔",
    kidLineEn: "Wash your whole face three times — don't miss the chin!",
    kidLineUr: "Pura chehra teen bar dho — thodi bhi na chhuto!",
  },
  {
    id: 6,
    emoji: "💪",
    titleEn: "Wash Arms",
    titleUr: "بازو دھونا",
    detailEn: "Wash right arm then left arm up to the elbows — three times each.",
    detailUr: "دائیں بازو پھر بائیں بازو کہنیوں تک تین بار دھوئیں۔",
    kidLineEn: "Right arm first, then left — up to elbows, three times each!",
    kidLineUr: "Pehle dayan bazu, phir bayan — thatni tak, teen bar!",
  },
  {
    id: 7,
    emoji: "🧢",
    titleEn: "Wipe Head (Masah)",
    titleUr: "سر کا مسح",
    detailEn: "Wet hands and wipe over the head once from front to back.",
    detailUr: "گیلے ہاتھوں سے سر کا ایک بار مسح کریں۔",
    kidLineEn: "Wet your hands and wipe your head once — front to back!",
    kidLineUr: "Geela hath se sar ek bar poncho — agay se peechay!",
  },
  {
    id: 8,
    emoji: "🦶",
    titleEn: "Wash Feet",
    titleUr: "پاؤں دھونا",
    detailEn: "Wash right foot then left foot up to the ankles — three times each.",
    detailUr: "دائیں پاؤں پھر بائیں پاؤں ٹخنوں تک تین بار دھوئیں۔",
    kidLineEn: "Wash feet up to ankles — right first, then left, three times!",
    kidLineUr: "Paon takhne tak dho — pehle dayan, phir bayan, teen bar!",
  },
];

export const LEVEL1_STAR_MAX = 3;

export type WuduChallengeType = "whatsNext" | "spotMistake" | "quickChoice";

export type WuduChallenge = {
  type: WuduChallengeType;
  /** The wudu step this round is testing (1–8). */
  targetStepId: number;
  /** Cards the child can tap. */
  options: WuduStep[];
  /**
   * whatsNext / quickChoice: correct step id.
   * spotMistake: id of the incorrect card in the sequence.
   */
  correctId: number;
  /** Previous step in the real sequence, if any. */
  previousStepId: number | null;
  /** spotMistake only: which option index is the error. */
  mistakeIndex?: number;
};

/** Controlled mix so every play has all 3 challenge types without repeating one style. */
const TYPE_FOR_STEP: Record<number, WuduChallengeType> = {
  1: "whatsNext",
  2: "quickChoice",
  3: "whatsNext",
  4: "spotMistake",
  5: "quickChoice",
  6: "whatsNext",
  7: "spotMistake",
  8: "whatsNext",
};

/**
 * Tempting mix-ups (skip-ahead / common kid mistakes) — not random easy opposites.
 */
const QUICK_CHOICE_WRONG: Record<number, number> = {
  1: 8,
  2: 5,
  3: 5,
  4: 6,
  5: 7,
  6: 8,
  7: 8,
  8: 2,
};

function stepById(id: number): WuduStep {
  const found = WUDU_STEPS.find((s) => s.id === id);
  if (!found) {
    return WUDU_STEPS[0];
  }
  return found;
}

function pickChallengingDistractors(
  correctId: number,
  count: number,
): WuduStep[] {
  const used = new Set<number>([correctId]);
  const picks: WuduStep[] = [];

  const tryAdd = (id: number) => {
    if (picks.length >= count) {
      return;
    }
    if (id < 1 || id > WUDU_STEPS.length || used.has(id)) {
      return;
    }
    used.add(id);
    picks.push(stepById(id));
  };

  tryAdd(correctId + 1);
  tryAdd(correctId - 1);
  tryAdd(correctId + 2);
  tryAdd(8);
  tryAdd(1);
  tryAdd(5);
  tryAdd(7);

  for (const step of shuffle(WUDU_STEPS.filter((s) => !used.has(s.id)))) {
    if (picks.length >= count) {
      break;
    }
    used.add(step.id);
    picks.push(step);
  }

  return picks;
}

function buildWhatsNext(targetId: number): WuduChallenge {
  const correct = stepById(targetId);
  const distractors =
    targetId === 1
      ? [stepById(8), stepById(5), stepById(7)]
      : pickChallengingDistractors(targetId, 3);

  return {
    type: "whatsNext",
    targetStepId: targetId,
    options: shuffle([correct, ...distractors.slice(0, 3)]),
    correctId: targetId,
    previousStepId: targetId === 1 ? null : targetId - 1,
  };
}

function buildQuickChoice(targetId: number): WuduChallenge {
  const correct = stepById(targetId);
  const wrongId = QUICK_CHOICE_WRONG[targetId] ?? Math.min(targetId + 1, 8);
  const wrong = stepById(wrongId === targetId ? (targetId === 8 ? 2 : targetId + 1) : wrongId);

  return {
    type: "quickChoice",
    targetStepId: targetId,
    options: shuffle([correct, wrong]),
    correctId: targetId,
    previousStepId: targetId === 1 ? null : targetId - 1,
  };
}

function buildSpotMistake(targetId: number): WuduChallenge {
  const prev1 = targetId > 1 ? targetId - 1 : 1;
  const prev2 = targetId > 2 ? targetId - 2 : prev1 === 1 ? 2 : 1;
  let wrongId = targetId + 1 <= WUDU_STEPS.length ? targetId + 1 : 1;
  if (wrongId === prev1 || wrongId === prev2 || wrongId === targetId) {
    const fallback = WUDU_STEPS.find(
      (s) => s.id !== prev1 && s.id !== prev2 && s.id !== targetId,
    );
    wrongId = fallback ? fallback.id : 8;
  }

  const sequence = [stepById(prev2), stepById(prev1), stepById(wrongId)];

  return {
    type: "spotMistake",
    targetStepId: targetId,
    options: sequence,
    correctId: wrongId,
    previousStepId: prev1,
    mistakeIndex: 2,
  };
}

/** Fresh Level 1 round — option order randomizes each attempt. */
export function buildLevel1Challenges(): WuduChallenge[] {
  return WUDU_STEPS.map((step) => {
    const type = TYPE_FOR_STEP[step.id] ?? "whatsNext";
    if (type === "quickChoice") {
      return buildQuickChoice(step.id);
    }
    if (type === "spotMistake") {
      return buildSpotMistake(step.id);
    }
    return buildWhatsNext(step.id);
  });
}

export function wuduStepTitle(step: WuduStep, lang: "en" | "ur"): string {
  return lang === "ur" ? step.titleUr : step.titleEn;
}

export const WUDU_UI = {
  en: {
    missionTitle: "Wudu Mission",
    challengeTitle: "Wudu Challenge",
    challengeHook: "Can You Complete Wudu Correctly?",
    startChallenge: "Start Challenge",
    challengeMode: "Knowledge Challenge",
    orderMode: "Put steps in order!",
    step: "Step",
    of: "of",
    next: "Next step",
    startMission: "Start mission!",
    tapNext: "Tap the NEXT wudu step",
    whatsNext: "What comes next?",
    howWeStart: "How does Wudu begin?",
    justDid: "Just done",
    findMistake: "Can you find the mistake?",
    watchSequence: "Watch this Wudu...",
    quickChoice: "Which one is next?",
    afterThis: "After this",
    nice: "Yes!",
    thinkAgain: "Hmm, try again!",
    excellentTitle: "Excellent!",
    excellentMsg: "You know your Wudu really well! 🌟",
    masterBadge: "Wudu Master! 🏆",
    goodTitle: "Great effort!",
    goodMsg: "You made a few mistakes. Want to try again and earn 3 stars?",
    practiceTitle: "Almost there!",
    practiceMsg: "Let's practice your Wudu steps and try the challenge again.",
    tryAgain: "Try Again",
    continue: "Continue",
    correct: "Great!",
    wrong: "Oops! Wrong order",
    doneOrder: "Wudu mission complete!",
    attemptsLeft: "Tries left",
    backHub: "Back to games",
  },
  ur: {
    missionTitle: "وضو مشن",
    challengeTitle: "وضو چیلنج",
    challengeHook: "کیا تم صحیح وضو مکمل کر سکتے ہو؟",
    startChallenge: "چیلنج شروع کرو",
    challengeMode: "علم کا چیلنج",
    orderMode: "ترتیب صحیح لگاؤ!",
    step: "قدم",
    of: "میں سے",
    next: "اگلا قدم",
    startMission: "مشن شروع!",
    tapNext: "اگلا وضو قدم چنو",
    whatsNext: "اب اگلا کیا ہے؟",
    howWeStart: "وضو کیسے شروع ہوتا ہے؟",
    justDid: "ابھی یہ ہوا",
    findMistake: "غلطی ڈھونڈو!",
    watchSequence: "یہ وضو دیکھو...",
    quickChoice: "اگلا کون سا ہے؟",
    afterThis: "اس کے بعد",
    nice: "شاباش!",
    thinkAgain: "سوچو، پھر کوشش!",
    excellentTitle: "لاجواب!",
    excellentMsg: "تم وضو بہت اچھے سے جانتے ہو! 🌟",
    masterBadge: "وضو ماسٹر! 🏆",
    goodTitle: "اچھی کوشش!",
    goodMsg: "کچھ غلطیاں ہوئیں۔ ۳ ستارے کے لیے دوبارہ کھیلو؟",
    practiceTitle: "بس پہنچ ہی گئے!",
    practiceMsg: "وضو کے قدم یاد کرو اور چیلنج دوبارہ کرو۔",
    tryAgain: "دوبارہ کھیلو",
    continue: "آگے بڑھو",
    correct: "شاباش!",
    wrong: "غلط ترتیب!",
    doneOrder: "وضو مشن مکمل!",
    attemptsLeft: "مواقع باقی",
    backHub: "گیمز پر واپس",
  },
};
