/**
 * Minimal Arabic letter reshaper for React Native colored spans.
 * Converts letters to Unicode presentation forms in logical order so nested
 * <Text> nodes still look naturally shaped — without inserting ZWJ.
 * Non-connecting letters (ا د ذ ر ز و …) stay naturally non-connecting.
 */

type Forms = {
  isolated: string;
  final: string;
  initial?: string;
  medial?: string;
};

/** Letters that do not connect to the following letter. */
const NON_CONNECTING = new Set([
  "\u0627", // ا
  "\u0622", // آ
  "\u0623", // أ
  "\u0625", // إ
  "\u0629", // ة
  "\u062F", // د
  "\u0630", // ذ
  "\u0631", // ر
  "\u0632", // ز
  "\u0648", // و
  "\u0624", // ؤ
  "\u0621", // ء
  "\u0671", // ٱ alef wasla
  "\u0670", // ٰ dagger alef (mark, handled separately)
  "\u06D5", // ە
  "\u06C0", // ۀ
  "\u06C1", // ہ
  "\u06C2", // ۂ
  "\u06C3", // ۃ
  "\u0629", // ة
]);

/**
 * Common Arabic / Quranic letter → presentation forms.
 * Only letters that participate in joining need initial/medial.
 */
const FORM_MAP: Record<string, Forms> = {
  "\u0621": { isolated: "\uFE80", final: "\uFE80" }, // ء
  "\u0622": { isolated: "\uFE81", final: "\uFE82" }, // آ
  "\u0623": { isolated: "\uFE83", final: "\uFE84" }, // أ
  "\u0624": { isolated: "\uFE85", final: "\uFE86" }, // ؤ
  "\u0625": { isolated: "\uFE87", final: "\uFE88" }, // إ
  "\u0626": {
    isolated: "\uFE89",
    final: "\uFE8A",
    initial: "\uFE8B",
    medial: "\uFE8C",
  }, // ئ
  "\u0627": { isolated: "\uFE8D", final: "\uFE8E" }, // ا
  "\u0628": {
    isolated: "\uFE8F",
    final: "\uFE90",
    initial: "\uFE91",
    medial: "\uFE92",
  }, // ب
  "\u0629": { isolated: "\uFE93", final: "\uFE94" }, // ة
  "\u062A": {
    isolated: "\uFE95",
    final: "\uFE96",
    initial: "\uFE97",
    medial: "\uFE98",
  }, // ت
  "\u062B": {
    isolated: "\uFE99",
    final: "\uFE9A",
    initial: "\uFE9B",
    medial: "\uFE9C",
  }, // ث
  "\u062C": {
    isolated: "\uFE9D",
    final: "\uFE9E",
    initial: "\uFE9F",
    medial: "\uFEA0",
  }, // ج
  "\u062D": {
    isolated: "\uFEA1",
    final: "\uFEA2",
    initial: "\uFEA3",
    medial: "\uFEA4",
  }, // ح
  "\u062E": {
    isolated: "\uFEA5",
    final: "\uFEA6",
    initial: "\uFEA7",
    medial: "\uFEA8",
  }, // خ
  "\u062F": { isolated: "\uFEA9", final: "\uFEAA" }, // د
  "\u0630": { isolated: "\uFEAB", final: "\uFEAC" }, // ذ
  "\u0631": { isolated: "\uFEAD", final: "\uFEAE" }, // ر
  "\u0632": { isolated: "\uFEAF", final: "\uFEB0" }, // ز
  "\u0633": {
    isolated: "\uFEB1",
    final: "\uFEB2",
    initial: "\uFEB3",
    medial: "\uFEB4",
  }, // س
  "\u0634": {
    isolated: "\uFEB5",
    final: "\uFEB6",
    initial: "\uFEB7",
    medial: "\uFEB8",
  }, // ش
  "\u0635": {
    isolated: "\uFEB9",
    final: "\uFEBA",
    initial: "\uFEBB",
    medial: "\uFEBC",
  }, // ص
  "\u0636": {
    isolated: "\uFEBD",
    final: "\uFEBE",
    initial: "\uFEBF",
    medial: "\uFEC0",
  }, // ض
  "\u0637": {
    isolated: "\uFEC1",
    final: "\uFEC2",
    initial: "\uFEC3",
    medial: "\uFEC4",
  }, // ط
  "\u0638": {
    isolated: "\uFEC5",
    final: "\uFEC6",
    initial: "\uFEC7",
    medial: "\uFEC8",
  }, // ظ
  "\u0639": {
    isolated: "\uFEC9",
    final: "\uFECA",
    initial: "\uFECB",
    medial: "\uFECC",
  }, // ع
  "\u063A": {
    isolated: "\uFECD",
    final: "\uFECE",
    initial: "\uFECF",
    medial: "\uFED0",
  }, // غ
  "\u0641": {
    isolated: "\uFED1",
    final: "\uFED2",
    initial: "\uFED3",
    medial: "\uFED4",
  }, // ف
  "\u0642": {
    isolated: "\uFED5",
    final: "\uFED6",
    initial: "\uFED7",
    medial: "\uFED8",
  }, // ق
  "\u0643": {
    isolated: "\uFED9",
    final: "\uFEDA",
    initial: "\uFEDB",
    medial: "\uFEDC",
  }, // ك
  "\u0644": {
    isolated: "\uFEDD",
    final: "\uFEDE",
    initial: "\uFEDF",
    medial: "\uFEE0",
  }, // ل
  "\u0645": {
    isolated: "\uFEE1",
    final: "\uFEE2",
    initial: "\uFEE3",
    medial: "\uFEE4",
  }, // م
  "\u0646": {
    isolated: "\uFEE5",
    final: "\uFEE6",
    initial: "\uFEE7",
    medial: "\uFEE8",
  }, // ن
  "\u0647": {
    isolated: "\uFEE9",
    final: "\uFEEA",
    initial: "\uFEEB",
    medial: "\uFEEC",
  }, // ه
  "\u0648": { isolated: "\uFEED", final: "\uFEEE" }, // و
  "\u0649": { isolated: "\uFEEF", final: "\uFEF0" }, // ى
  "\u064A": {
    isolated: "\uFEF1",
    final: "\uFEF2",
    initial: "\uFEF3",
    medial: "\uFEF4",
  }, // ي
  "\u0671": { isolated: "\uFB50", final: "\uFB51" }, // ٱ
  "\u067E": {
    isolated: "\uFB56",
    final: "\uFB57",
    initial: "\uFB58",
    medial: "\uFB59",
  }, // پ
  "\u0686": {
    isolated: "\uFB7A",
    final: "\uFB7B",
    initial: "\uFB7C",
    medial: "\uFB7D",
  }, // چ
  "\u06A9": {
    isolated: "\uFB8E",
    final: "\uFB8F",
    initial: "\uFB90",
    medial: "\uFB91",
  }, // ک
  "\u06AF": {
    isolated: "\uFB92",
    final: "\uFB93",
    initial: "\uFB94",
    medial: "\uFB95",
  }, // گ
  "\u06CC": {
    isolated: "\uFBFC",
    final: "\uFBFD",
    initial: "\uFBFE",
    medial: "\uFBFF",
  }, // ی
};

function isMark(ch: string): boolean {
  const code = ch.codePointAt(0) || 0;
  return (
    (code >= 0x064b && code <= 0x065f) ||
    code === 0x0670 ||
    (code >= 0x06d6 && code <= 0x06ed) ||
    (code >= 0x08d3 && code <= 0x08ff)
  );
}

function isLetter(ch: string): boolean {
  return !!FORM_MAP[ch] || /[\u0621-\u064A\u0671-\u06D3]/.test(ch);
}

function connectsToNext(ch: string): boolean {
  if (!isLetter(ch)) return false;
  if (NON_CONNECTING.has(ch)) return false;
  const forms = FORM_MAP[ch];
  // Must have initial/medial to connect forward
  return !!(forms?.initial || forms?.medial);
}

function pickForm(
  ch: string,
  connectsFromPrev: boolean,
  connectsToFollowing: boolean,
): string {
  const forms = FORM_MAP[ch];
  if (!forms) return ch;

  if (connectsFromPrev && connectsToFollowing && forms.medial) {
    return forms.medial;
  }
  if (connectsFromPrev && forms.final) {
    return forms.final;
  }
  if (connectsToFollowing && forms.initial) {
    return forms.initial;
  }
  return forms.isolated;
}

/**
 * Reshape Arabic letters to presentation forms in logical order.
 * Marks / spaces / digits / unknown chars are preserved as-is.
 * Does not insert ZWJ and does not reverse the string.
 */
export function reshapeArabicLogical(input: string): string {
  if (!input) return input;

  const chars = [...input];
  const letterIndexes: number[] = [];
  for (let i = 0; i < chars.length; i += 1) {
    if (isLetter(chars[i]) && !isMark(chars[i])) {
      letterIndexes.push(i);
    }
  }

  if (!letterIndexes.length) return input;

  const out = chars.slice();
  for (let li = 0; li < letterIndexes.length; li += 1) {
    const idx = letterIndexes[li];
    const ch = chars[idx];
    const prevLetter =
      li > 0 ? chars[letterIndexes[li - 1]] : null;
    const nextLetter =
      li < letterIndexes.length - 1 ? chars[letterIndexes[li + 1]] : null;

    const connectsFromPrev = !!(prevLetter && connectsToNext(prevLetter));
    const connectsToFollowing = !!(nextLetter && connectsToNext(ch));

    out[idx] = pickForm(ch, connectsFromPrev, connectsToFollowing);
  }

  return out.join("");
}

/**
 * Apply reshape to a full string, then redistribute by original
 * segment code-point lengths (marks stay aligned with letters).
 */
export function reshapeSegmentTexts(texts: string[]): string[] {
  if (!texts.length) return texts;
  const lengths = texts.map((t) => [...t].length);
  const reshaped = [...reshapeArabicLogical(texts.join(""))];
  const result: string[] = [];
  let cursor = 0;
  for (const len of lengths) {
    result.push(reshaped.slice(cursor, cursor + len).join(""));
    cursor += len;
  }
  return result;
}
