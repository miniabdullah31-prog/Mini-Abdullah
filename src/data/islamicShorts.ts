import { ImageSourcePropType } from "react-native";

/**
 * Islamic Shorts — cards open in YouTube (app or browser) via youtubeUrl.
 *
 * Cover mapping (src/assets/shorts/ → short):
 * - prophet musa.png              → Miracle of Prophet Musa (AS)
 * - hazrt younas.png              → Prophet Yunus (AS) inside the whale
 * - hazrt ibrahim.png             → Prophet Ibrahim (AS) and the fire
 * - daily good deed.png           → Daily good deed: a smile is sadaqah
 * - helping parents at home.png   → Helping parents at home is worship
 * - hzrt muhammad.png             → Seerah of Prophet Muhammad ﷺ
 * - honesty.png                   → Honesty in daily work
 * - hazrt nuh.png                 → Prophet Nuh (AS) and the ark
 * - hazrt yousaf.png              → Prophet Yusuf (AS)
 * (no cover image)                → Removing harm from the path is charity
 */

export type ShortClip = {
  id: number;
  /** Shown under the card */
  caption: string;
  /** YouTube watch / shorts URL opened via Linking */
  youtubeUrl: string;
  /** Cover image on the card — optional thumbnail */
  cover: ImageSourcePropType | null;
  /** Soft gradient when cover is missing */
  colors: [string, string];
};

export const ISLAMIC_SHORTS: ShortClip[] = [
  {
    id: 1,
    caption:
      "Miracle of Prophet Musa (AS) — when the sea split by Allah's command. A reminder that with tawakkul, even the impossible becomes easy.",
    youtubeUrl: "https://www.youtube.com/watch?v=dlA_UuwzL54",
    cover: require("../assets/shorts/prophet musa.png"),
    colors: ["#1F8A70", "#3CB89A"],
  },
  {
    id: 2,
    caption:
      "Prophet Yunus (AS) inside the whale — darkness turned into light through sincere istighfar. Never lose hope in Allah's mercy.",
    youtubeUrl: "https://www.youtube.com/watch?v=c2I-MdrBkUY",
    cover: require("../assets/shorts/hazrt younas.png"),
    colors: ["#2E6BFF", "#5AA0FF"],
  },
  {
    id: 3,
    caption:
      "Prophet Ibrahim (AS) and the fire — when you choose Allah over fear, He makes the fire cool and safe for you.",
    youtubeUrl: "https://www.youtube.com/watch?v=lZu173pTldI",
    cover: require("../assets/shorts/hazrt ibrahim.png"),
    colors: ["#C45C2A", "#E08A4F"],
  },
  {
    id: 4,
    caption:
      "Daily good deed: a smile is sadaqah. Small kindness in ordinary moments earns reward with Allah.",
    youtubeUrl: "https://www.youtube.com/watch?v=1FNiEmrI4b4",
    cover: require("../assets/shorts/daily good deed.png"),
    colors: ["#0F9B8E", "#34D1BF"],
  },
  {
    id: 5,
    caption:
      "Helping parents at home is worship. Everyday chores done with love become hasanat.",
    youtubeUrl: "https://www.youtube.com/watch?v=6crISCrrzzY",
    cover: require("../assets/shorts/helping parents at home.png"),
    colors: ["#7B2FF7", "#5B33C4"],
  },
  {
    id: 6,
    caption:
      "Seerah of Prophet Muhammad ﷺ — his kindness to children, neighbours, and even those who hurt him.",
    youtubeUrl: "https://www.youtube.com/watch?v=MCGdv56bQBM",
    cover: require("../assets/shorts/hzrt muhammad.png"),
    colors: ["#B06AB3", "#7B3FA0"],
  },
  {
    id: 7,
    caption:
      "Honesty in daily work — the Prophet ﷺ taught that truthful trade brings barakah. Earn halal, speak truth.",
    youtubeUrl: "https://www.youtube.com/watch?v=4rWoKBecS0Y",
    cover: require("../assets/shorts/honesty.png"),
    colors: ["#1F8A70", "#2E6BFF"],
  },
  {
    id: 8,
    caption:
      "Prophet Nuh (AS) and the ark — patience for years, then Allah's help. Keep doing good even when few listen.",
    youtubeUrl: "https://www.youtube.com/watch?v=d2D6WuKlymM",
    cover: require("../assets/shorts/hazrt nuh.png"),
    colors: ["#C45C2A", "#7B2FF7"],
  },
  {
    id: 9,
    caption:
      "Removing harm from the path is charity. In daily life, clean a mess, help someone cross — simple naiki.",
    youtubeUrl: "https://www.youtube.com/watch?v=_CD74FyUwDk",
    cover: null,
    colors: ["#2E6BFF", "#0F9B8E"],
  },
  {
    id: 10,
    caption:
      "Prophet Yusuf (AS) — sabr through trials, then honour from Allah. Beautiful patience is never wasted.",
    youtubeUrl: "https://www.youtube.com/watch?v=gadnINKEibU",
    cover: require("../assets/shorts/hazrt yousaf.png"),
    colors: ["#5B33C4", "#B06AB3"],
  },
];
