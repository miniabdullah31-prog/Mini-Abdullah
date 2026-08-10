import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { QuizLang, QUIZ_UI } from "../../data/quizGames";

/** RN 0.85: avoid StyleSheet.absoluteFillObject + Modal (both flaky). */

type LangChipsProps = {
  lang: QuizLang;
  onChange: (l: QuizLang) => void;
  /** Match/Meaning: only ur | en for answer side */
  modes?: QuizLang[];
};

export function QuizLangChips({
  lang,
  onChange,
  modes = ["ar", "ur", "en"],
}: LangChipsProps) {
  const labels: Record<QuizLang, string> = {
    ar: "Arabic",
    ur: "Urdu",
    en: "English",
  };
  return (
    <View style={styles.langRow}>
      {modes.map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[styles.langChip, lang === mode && styles.langChipActive]}
          onPress={() => onChange(mode)}
        >
          <Text
            style={[
              styles.langChipText,
              lang === mode && styles.langChipTextActive,
            ]}
          >
            {labels[mode]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function StarRow({ stars }: { stars: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= stars ? "star" : "star-outline"}
          size={28}
          color={i <= stars ? "#F5B400" : "#CCC"}
          style={{ marginHorizontal: 3 }}
        />
      ))}
    </View>
  );
}

/** Full-screen overlay without RN Modal (Modal is unreliable on RN 0.85). */
function PopupShell({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) {
  if (!visible) return null;
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.card}>{children}</View>
    </View>
  );
}

type ClearModalProps = {
  visible: boolean;
  lang: QuizLang;
  stars: number;
  isLastLevel: boolean;
  onNext: () => void;
  onCancel: () => void;
};

export function LevelClearModal({
  visible,
  lang,
  stars,
  isLastLevel,
  onNext,
  onCancel,
}: ClearModalProps) {
  const ui = QUIZ_UI[lang === "ar" ? "en" : lang];
  return (
    <PopupShell visible={visible}>
      <Text style={styles.modalTitle}>
        {isLastLevel ? ui.bothDone : ui.levelCleared}
      </Text>
      <Text style={styles.modalSub}>{ui.starsHint}</Text>
      <StarRow stars={stars} />
      <TouchableOpacity
        style={[styles.btn, styles.btnPrimary]}
        onPress={onNext}
        activeOpacity={0.85}
      >
        <Text style={styles.btnPrimaryText}>
          {isLastLevel ? ui.back : ui.nextLevel}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.btnGhost]}
        onPress={onCancel}
        activeOpacity={0.85}
      >
        <Text style={styles.btnGhostText}>{ui.cancel}</Text>
      </TouchableOpacity>
    </PopupShell>
  );
}

type FailOverlayProps = {
  visible: boolean;
  lang: QuizLang;
  onRetry: () => void;
  onBack: () => void;
};

export function FailOverlay({
  visible,
  lang,
  onRetry,
  onBack,
}: FailOverlayProps) {
  const ui = QUIZ_UI[lang === "ar" ? "en" : lang];
  return (
    <PopupShell visible={visible}>
      <Text style={styles.modalTitle}>{ui.tryAgainTitle}</Text>
      <Text style={styles.modalSub}>{ui.tryAgainMsg}</Text>
      <TouchableOpacity
        style={[styles.btn, styles.btnPrimary]}
        onPress={onRetry}
        activeOpacity={0.85}
      >
        <Text style={styles.btnPrimaryText}>{ui.tryAgain}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.btnGhost]}
        onPress={onBack}
        activeOpacity={0.85}
      >
        <Text style={styles.btnGhostText}>{ui.back}</Text>
      </TouchableOpacity>
    </PopupShell>
  );
}

export function LevelFailModal(props: FailOverlayProps) {
  return <FailOverlay {...props} />;
}

export function openFailSoon(setFailOpen: (v: boolean) => void) {
  // Immediate — no Modal gesture race anymore
  setFailOpen(true);
}

const styles = StyleSheet.create({
  langRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  langChip: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6DEFF",
  },
  langChipActive: { backgroundColor: "#5B33C4", borderColor: "#5B33C4" },
  langChipText: { color: "#5B33C4", fontWeight: "700", fontSize: 13 },
  langChipTextActive: { color: "#fff" },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 14,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.62)",
    justifyContent: "center",
    alignItems: "center",
    padding: 22,
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    elevation: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4B2AA8",
    textAlign: "center",
  },
  modalSub: {
    marginTop: 8,
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 6,
  },
  btn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  btnPrimary: { backgroundColor: "#6C4DF7" },
  btnPrimaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btnGhost: { backgroundColor: "#F1F2F6" },
  btnGhostText: { color: "#555", fontWeight: "700", fontSize: 16 },
});
