import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Text,
  StyleSheet,
  TextStyle,
  StyleProp,
  View,
  StyleSheet as RNStyleSheet,
  Dimensions,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import {
  DEFAULT_ARABIC_COLOR,
  applyQuranicSukun,
  buildTajweedHtmlDocument,
  parseTajweedMarkup,
} from "../services/tajweedColors";

type Props = {
  arabic: string;
  arabicTajweed?: string;
  style?: StyleProp<TextStyle>;
  endsRuku?: boolean;
  ayahNumber?: number;
};

function estimateContentHeight(
  markup: string,
  fontSize: number,
  lineHeightPx: number,
  extraMarks: boolean,
): number {
  const plainLen = parseTajweedMarkup(markup).reduce(
    (n, seg) => n + seg.text.length,
    0,
  );
  const contentWidth = Math.max(
    200,
    Dimensions.get("window").width - 64,
  );
  const charsPerLine = Math.max(10, Math.floor(contentWidth / (fontSize * 0.62)));
  const lines = Math.max(1, Math.ceil(Math.max(plainLen, 1) / charsPerLine));
  return Math.ceil(lines * lineHeightPx + (extraMarks ? 4 : 2));
}

/**
 * Color-coded Tajweed ayah matching a printed Mushaf look (WebView).
 */
const TajweedText: React.FC<Props> = ({
  arabic,
  arabicTajweed,
  style,
  endsRuku,
  ayahNumber,
}) => {
  const flat = RNStyleSheet.flatten(style) || {};
  const fontSize =
    typeof flat.fontSize === "number" ? flat.fontSize : styles.base.fontSize;
  const lineHeightPx =
    typeof flat.lineHeight === "number"
      ? flat.lineHeight
      : styles.base.lineHeight;
  const textColor =
    typeof flat.color === "string" ? flat.color : DEFAULT_ARABIC_COLOR;

  const hasTajweed = useMemo(() => {
    const raw = arabicTajweed || "";
    if (!raw.trim()) return false;
    // Prefer WebView path whenever official tajweed markup exists.
    if (/<tajweed\b/i.test(raw)) return true;
    const segments = parseTajweedMarkup(raw);
    return segments.some((seg) => !!seg.className);
  }, [arabicTajweed]);

  const estimatedHeight = useMemo(() => {
    if (!arabicTajweed) return Math.ceil(lineHeightPx * 1.25);
    return estimateContentHeight(
      arabicTajweed,
      fontSize,
      lineHeightPx,
      !!endsRuku,
    );
  }, [arabicTajweed, fontSize, lineHeightPx, endsRuku]);

  const html = useMemo(() => {
    if (!hasTajweed || !arabicTajweed) return "";
    return buildTajweedHtmlDocument(arabicTajweed, {
      fontSize,
      lineHeight: lineHeightPx / fontSize,
      color: textColor,
      endsRuku: !!endsRuku,
      ayahNumber,
    });
  }, [
    arabicTajweed,
    ayahNumber,
    endsRuku,
    fontSize,
    hasTajweed,
    lineHeightPx,
    textColor,
  ]);

  const [webHeight, setWebHeight] = useState(estimatedHeight);

  useEffect(() => {
    setWebHeight(estimatedHeight);
  }, [estimatedHeight, arabicTajweed, endsRuku]);

  const onMessage = useCallback((event: WebViewMessageEvent) => {
    const next = Number(event.nativeEvent.data);
    if (Number.isFinite(next) && next > 8) {
      setWebHeight((prev) =>
        Math.abs(prev - next) < 1 ? prev : Math.ceil(next),
      );
    }
  }, []);

  const webKey = useMemo(() => {
    if (!arabicTajweed) return "plain";
    return `tw-${arabicTajweed.length}-${endsRuku ? 1 : 0}-${arabicTajweed.slice(0, 24)}-${arabicTajweed.slice(-24)}`;
  }, [arabicTajweed, endsRuku]);

  if (!hasTajweed) {
    return (
      <Text style={[styles.base, style]} allowFontScaling={false}>
        {applyQuranicSukun(arabic)}
        {endsRuku ? (
          <Text style={styles.rukuPlain}>{"  ع"}</Text>
        ) : null}
      </Text>
    );
  }

  return (
    <View style={[styles.wrap, { height: webHeight }]}>
      <WebView
        key={webKey}
        originWhitelist={["*"]}
        source={{ html }}
        style={[styles.web, { height: webHeight }]}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled={false}
        setSupportMultipleWindows={false}
        androidLayerType="software"
        mixedContentMode="always"
        overScrollMode="never"
        nestedScrollEnabled={false}
        allowsInlineMediaPlayback={false}
        automaticallyAdjustContentInsets={false}
        scalesPageToFit={false}
        bounces={false}
      />
    </View>
  );
};

export default TajweedText;

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  web: {
    width: "100%",
    backgroundColor: "#ffffff",
    opacity: 0.999,
  },
  base: {
    fontSize: 28,
    lineHeight: 52,
    color: DEFAULT_ARABIC_COLOR,
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "500",
    includeFontPadding: false,
  },
  rukuPlain: {
    fontSize: 16,
    color: "#7a6a58",
    fontWeight: "600",
  },
});
