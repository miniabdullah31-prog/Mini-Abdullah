/**
 * Tajweed colors aligned to a printed color-coded Mushaf (stroke colors on glyphs).
 * Class names come only from Quran.com `text_uthmani_tajweed` markup — do not invent rules.
 */

/** Printed-Mushaf-style palette: colors apply to letter strokes, not backgrounds. */
export const TAJWEED_CLASS_COLORS: Record<string, string> = {
  ham_wasl: "#A0A0A0",
  laam_shamsiyah: "#A0A0A0",
  slnt: "#A0A0A0",
  madda_normal: "#E11D8F",
  madda_permissible: "#E11D8F",
  madda_necessary: "#C2185B",
  madda_obligatory: "#C2185B",
  madda_obligatory_monconnected: "#C2185B",
  madda_obligatory_mconnected: "#C2185B",
  qalaqah: "#1E88E5",
  qlq: "#1E88E5",
  ghunnah: "#D32F2F",
  idgham_wo_ghunnah: "#2E7D32",
  idgham_ghunnah: "#2E7D32",
  idgham_shafawi: "#00897B",
  iqlab: "#00838F",
  ikhafa: "#43A047",
  ikhafa_shafawi: "#43A047",
  end: "#6B7280",
};

export const DEFAULT_ARABIC_COLOR = "#1a1a1a";

export type TajweedSegment = {
  text: string;
  className?: string;
  color: string;
};

function escapeHtmlText(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Display-only: Quranic sukun U+06E1 (ۡ) instead of generic Arabic sukun U+0652 (ْ).
 * Does not touch other Uthmani marks (e.g. U+06DF ۟).
 */
export function applyQuranicSukun(text: string): string {
  if (!text) return text;
  return text.replace(/\u0652/g, "\u06E1");
}

/**
 * Replace innermost tajweed/span tags until none remain.
 * Required because Quran.com markup nests tags; a naive non-greedy regex
 * leaves raw English like `tajweed class=slnt` visible in the WebView.
 */
function mapInnermostTajweedTags(
  markup: string,
  mapLeaf: (className: string, text: string) => string,
): string {
  let html = markup;
  const leafRe =
    /<(tajweed|span)\s+class=([a-zA-Z0-9_]+)>([^<]*)<\/\1>/gi;
  let guard = 0;
  while (leafRe.test(html) && guard < 200) {
    leafRe.lastIndex = 0;
    html = html.replace(leafRe, (_m, _tag, className: string, text: string) =>
      mapLeaf(className, text),
    );
    guard += 1;
  }
  // Strip any leftover broken tajweed/span shells (should be rare).
  // Keep closing </span> — otherwise colored spans never close and
  // hasTajweed detection falls back to plain black Text.
  html = html.replace(/<\/?tajweed\b[^>]*>/gi, "");
  html = html.replace(/<\/?span\b[^>]*>/gi, (m) => {
    if (/^<\/span>/i.test(m)) return m;
    if (/class=["']?ayah-end["']?/i.test(m) || /\sstyle=/i.test(m)) return m;
    return "";
  });
  // Catch any unmarked Arabic left outside tags (idempotent on already-converted leaves).
  return applyQuranicSukun(html);
}

/**
 * Parse Quran.com tajweed HTML into colored segments (nested-safe).
 */
export function parseTajweedMarkup(markup: string): TajweedSegment[] {
  if (!markup || !markup.trim()) return [];

  // Flatten nested tags to leaf spans first, then segment.
  const flatHtml = tajweedMarkupToHtmlFragment(markup);
  const segments: TajweedSegment[] = [];
  const re =
    /<span class="ayah-end">([^<]*)<\/span>|<span style="color:([^"]+)">([^<]*)<\/span>|([^<]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(flatHtml)) !== null) {
    if (match[1] != null) {
      segments.push({
        text: match[1],
        className: "end",
        color: TAJWEED_CLASS_COLORS.end,
      });
      continue;
    }
    if (match[2] != null && match[3] != null) {
      const color = match[2];
      const className =
        Object.keys(TAJWEED_CLASS_COLORS).find(
          (k) => TAJWEED_CLASS_COLORS[k] === color,
        ) || undefined;
      segments.push({ text: match[3], className, color });
      continue;
    }
    if (match[4]) {
      segments.push({ text: match[4], color: DEFAULT_ARABIC_COLOR });
    }
  }
  return segments;
}

/**
 * Build colored HTML fragment from official tajweed markup (nested-safe).
 */
export function tajweedMarkupToHtmlFragment(markup: string): string {
  if (!markup || !markup.trim()) return "";

  return mapInnermostTajweedTags(markup, (className, text) => {
    const t = applyQuranicSukun(text);
    if (className === "end") {
      return `<span class="ayah-end">${escapeHtmlText(t)}</span>`;
    }
    const color = TAJWEED_CLASS_COLORS[className] || DEFAULT_ARABIC_COLOR;
    return `<span style="color:${color}">${escapeHtmlText(t)}</span>`;
  });
}

/**
 * Full HTML document for WebView.
 */
export function buildTajweedHtmlDocument(
  markup: string,
  opts?: {
    fontSize?: number;
    lineHeight?: number;
    color?: string;
    endsRuku?: boolean;
    ayahNumber?: number;
  },
): string {
  const fontSize = opts?.fontSize ?? 28;
  const lineHeight = opts?.lineHeight ?? 1.85;
  const color = opts?.color ?? DEFAULT_ARABIC_COLOR;
  let body = tajweedMarkupToHtmlFragment(markup);

  const hasEnd = /class=["']?ayah-end["']?/.test(body);
  if (!hasEnd && opts?.ayahNumber != null && opts.ayahNumber > 0) {
    const eastern = toEasternDigits(opts.ayahNumber);
    body += `<span class="ayah-end">${eastern}</span>`;
  }
  if (opts?.endsRuku) {
    body += `<span class="ruku-mark" aria-label="Ruku">ع</span>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }
  body {
    color: ${color};
    background: #ffffff;
    font-size: ${fontSize}px;
    line-height: ${Math.max(lineHeight, 1.95)};
    font-weight: 500;
    direction: rtl;
    text-align: right;
    font-family: "Noto Naskh Arabic", "Noto Sans Arabic", "Traditional Arabic",
      "Arabic Typesetting", "Segoe UI Historic", serif;
    font-feature-settings: "liga" 1, "calt" 1, "kern" 1, "mark" 1, "mkmk" 1;
    -webkit-font-smoothing: antialiased;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    -webkit-text-size-adjust: 100%;
    padding-top: 0.12em;
    padding-bottom: 0.08em;
  }
  #ayah {
    margin: 0;
    padding: 0;
  }
  #ayah span {
    background: transparent !important;
  }
  .ayah-end {
    display: inline-block;
    box-sizing: border-box;
    min-width: 1.15em;
    height: 1.15em;
    padding: 0 0.12em;
    margin: 0 0.12em 0 0.2em;
    line-height: 1.1em;
    font-size: 0.52em;
    font-weight: 600;
    color: #2c2c2c !important;
    text-align: center;
    vertical-align: middle;
    border: 1.4px solid #5a5a5a;
    border-radius: 50%;
  }
  .ruku-mark {
    display: inline-block;
    margin: 0 0.28em 0 0.08em;
    font-size: 0.58em;
    line-height: 1;
    color: #7a6a58 !important;
    vertical-align: middle;
    font-weight: 600;
    opacity: 0.9;
  }
</style>
</head>
<body>
<div id="ayah">${body}</div>
<script>
  (function () {
    var last = 0;
    function sendHeight() {
      var el = document.getElementById("ayah");
      if (!el) return;
      var h = Math.ceil(
        Math.max(
          el.getBoundingClientRect().height,
          el.offsetHeight,
          el.scrollHeight
        )
      );
      if (window.ReactNativeWebView && h > 0 && Math.abs(h - last) >= 1) {
        last = h;
        window.ReactNativeWebView.postMessage(String(h));
      }
    }
    sendHeight();
    requestAnimationFrame(function () {
      sendHeight();
      requestAnimationFrame(sendHeight);
    });
    setTimeout(sendHeight, 50);
    setTimeout(sendHeight, 150);
    setTimeout(sendHeight, 350);
    if (window.ResizeObserver) {
      new ResizeObserver(sendHeight).observe(document.getElementById("ayah"));
    }
  })();
</script>
</body>
</html>`;
}

function toEasternDigits(n: number): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n)
    .split("")
    .map((d) => map[Number(d)] ?? d)
    .join("");
}
