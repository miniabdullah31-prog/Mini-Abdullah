import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Modal,
  useWindowDimensions,
} from "react-native";
import {
  TAJWEED_GUIDE_RULES,
  TajweedGuideLang,
} from "../services/tajweedGuide";
import type { TranslationLang } from "../services/quranTypes";

type Props = {
  translationLang: TranslationLang;
};

function guideLangFrom(translationLang: TranslationLang): TajweedGuideLang {
  if (translationLang === "ur") return "ur";
  if (translationLang === "en") return "en";
  return "ar";
}

const TRIGGER: Record<TajweedGuideLang, string> = {
  en: "Tajweed Colored Rules",
  ur: "تجوید رنگ والے قواعد",
  ar: "قواعد التجويد الملونة",
};

/**
 * Small fixed trigger + bounded scrollable popover (opens below trigger).
 */
const TajweedGuideTrigger: React.FC<Props> = ({ translationLang }) => {
  const [open, setOpen] = useState(false);
  const [anchorY, setAnchorY] = useState(120);
  const wrapRef = useRef<View>(null);
  const { height: winH } = useWindowDimensions();
  const lang = guideLangFrom(translationLang);

  const title = useMemo(() => {
    if (lang === "ur") return "تجوید رنگ";
    if (lang === "ar") return "ألوان التجويد";
    return "Tajweed colors";
  }, [lang]);

  const panelMaxH = Math.min(320, Math.max(220, winH * 0.45));
  const scrollH = Math.max(140, panelMaxH - 88); // title + close reserved

  const openPopup = () => {
    wrapRef.current?.measureInWindow((_x, y, _w, h) => {
      setAnchorY(Math.max(56, y + h + 6));
      setOpen(true);
    });
  };

  return (
    <View ref={wrapRef} style={styles.wrap} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.trigger}
        onPress={openPopup}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={TRIGGER.en}
      >
        <Text style={styles.triggerText}>{TRIGGER[lang]}</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityLabel="Close Tajweed guide"
          />
          <View style={[styles.panel, { top: anchorY, height: panelMaxH }]}>
            <Text style={styles.panelTitle}>{title}</Text>
            <ScrollView
              style={{ height: scrollH }}
              contentContainerStyle={styles.scrollContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator
              persistentScrollbar
              keyboardShouldPersistTaps="handled"
              bounces
              overScrollMode="always"
            >
              {TAJWEED_GUIDE_RULES.map((rule) => (
                <View key={rule.id} style={styles.row}>
                  <View
                    style={[styles.dot, { backgroundColor: rule.color }]}
                  />
                  <View style={styles.rowText}>
                    <Text style={styles.ruleName}>{rule.label[lang]}</Text>
                    <Text style={styles.ruleTip}>{rule.tip[lang]}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.closeText}>
                {lang === "ur"
                  ? "بند کریں"
                  : lang === "ar"
                    ? "إغلاق"
                    : "Close"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TajweedGuideTrigger;

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: "flex-start",
  },
  trigger: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  triggerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5B33C4",
    textDecorationLine: "underline",
  },
  modalRoot: {
    flex: 1,
  },
  panel: {
    position: "absolute",
    left: 16,
    width: "86%",
    maxWidth: 340,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: "#E6DEFF",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    overflow: "hidden",
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3A2080",
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: 8,
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  rowText: { flex: 1 },
  ruleName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#222",
    marginBottom: 2,
  },
  ruleTip: {
    fontSize: 12,
    lineHeight: 17,
    color: "#555",
    fontWeight: "500",
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeText: {
    color: "#5B33C4",
    fontWeight: "700",
    fontSize: 13,
  },
});
