/**
 * Games hub catalog — nayi game add karne ke liye:
 * 1) Yahan GAME_REGISTRY mein entry add karo (enabled: true)
 * 2) Component banao src/Components/quiz/ ya games/
 * 3) GameLauncher.tsx mein component map karo
 * 4) quizPlayStore KNOWN_GAMES auto-update (GAME_IDS se)
 * 5) Agar vocabulary chahiye → quizGames.ts
 */

export type GameId = "wordsearch" | "match" | "meaning" | "truefalse" | "wudumission";

export type GameCategory = "words" | "quiz" | "memory";

export type GameMeta = {
  id: GameId;
  title: string;
  subtitle: string;
  funLine: string;
  colors: [string, string, string];
  icon: string;
  badge: string;
  deco: [string, string, string];
  accent: string;
  category: GameCategory;
  keywords: string[];
  levels: number;
  enabled: boolean;
};

export const GAME_REGISTRY: GameMeta[] = [
  {
    id: "wordsearch",
    title: "Word Search",
    subtitle: "Find hidden words in the grid",
    funLine: "Slide · find · win stars!",
    colors: ["#8B5CF6", "#6D28D9", "#4C1D95"],
    icon: "grid",
    badge: "2 Levels",
    deco: ["★", "✦", "🌙"],
    accent: "#FDE68A",
    category: "words",
    keywords: ["word", "search", "grid", "find", "alphabet"],
    levels: 2,
    enabled: true,
  },
  {
    id: "match",
    title: "Match Meaning",
    subtitle: "Join Arabic with Urdu or English",
    funLine: "Tap pairs · learn fast!",
    colors: ["#14B8A6", "#0D9488", "#0F766E"],
    icon: "git-compare",
    badge: "2 Levels",
    deco: ["✦", "💚", "★"],
    accent: "#A7F3D0",
    category: "words",
    keywords: ["match", "pair", "arabic", "urdu", "meaning"],
    levels: 2,
    enabled: true,
  },
  {
    id: "meaning",
    title: "Pick Meaning",
    subtitle: "Choose the right meaning",
    funLine: "4 choices · be smart!",
    colors: ["#3B82F6", "#2563EB", "#1D4ED8"],
    icon: "bulb",
    badge: "2 Levels",
    deco: ["💡", "★", "✦"],
    accent: "#BFDBFE",
    category: "words",
    keywords: ["meaning", "pick", "quiz", "choice"],
    levels: 2,
    enabled: true,
  },
  {
    id: "truefalse",
    title: "True or False",
    subtitle: "Islamic facts — sahi ya galat?",
    funLine: "Tap true · tap false · learn!",
    colors: ["#F59E0B", "#D97706", "#B45309"],
    icon: "checkmark-circle",
    badge: "2 Levels",
    deco: ["✓", "✗", "⭐"],
    accent: "#FEF3C7",
    category: "quiz",
    keywords: ["true", "false", "fact", "islam", "quiz"],
    levels: 2,
    enabled: true,
  },
  {
    id: "wudumission",
    title: "Wudu Mission",
    subtitle: "Prove you know the wudu steps",
    funLine: "Challenge · earn 3 stars!",
    colors: ["#0EA5E9", "#0284C7", "#0369A1"],
    icon: "water",
    badge: "2 Levels",
    deco: ["💧", "🤲", "✨"],
    accent: "#BAE6FD",
    category: "quiz",
    keywords: ["wudu", "wuzu", "ablution", "clean", "salah", "steps"],
    levels: 2,
    enabled: true,
  },
];

export const GAME_IDS = GAME_REGISTRY.filter((g) => g.enabled).map(
  (g) => g.id,
) as GameId[];

export function getEnabledGames(): GameMeta[] {
  return GAME_REGISTRY.filter((g) => g.enabled);
}

export function getGameMeta(id: GameId): GameMeta | undefined {
  return GAME_REGISTRY.find((g) => g.id === id && g.enabled);
}

export function filterGames(query: string): GameMeta[] {
  const q = query.trim().toLowerCase();
  const pool = getEnabledGames();
  if (!q) {
    return pool;
  }
  return pool.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.subtitle.toLowerCase().includes(q) ||
      g.funLine.toLowerCase().includes(q) ||
      g.id.includes(q) ||
      g.keywords.some((k) => k.includes(q)),
  );
}

export function getHubStats() {
  const games = getEnabledGames();
  const totalLevels = games.reduce((sum, g) => sum + g.levels, 0);
  return {
    gameCount: games.length,
    totalLevels,
    maxStars: 5,
  };
}

export const HUB_COPY = {
  title: "Islamic Games",
  subtitle: "Play · learn · collect stars",
  tipTitle: "Kids play tip",
  tipBody: "Clear levels with fewer mistakes to earn more stars!",
  sectionTitle: "Choose your adventure",
  searchPlaceholder: "Search games... Wudu, Word, True/False",
  emptyTitle: "No game found",
  emptyHint: "Try another search word",
};
