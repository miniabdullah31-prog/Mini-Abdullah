import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

type Props = {
  visible: boolean;
  initialStars?: number;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  onSave: (stars: number) => void;
  onClose: () => void;
  /** If true, closing without save still dismisses (e.g. later from Profile) */
  allowSkip?: boolean;
};

const RateAppModal: React.FC<Props> = ({
  visible,
  initialStars = 0,
  title = "Rate Mini Abdullah",
  subtitle = "JazakAllah khair! Your stars help more kids learn Islam.",
  confirmLabel = "Submit",
  onSave,
  onClose,
  allowSkip = true,
}) => {
  const [stars, setStars] = useState(initialStars);

  useEffect(() => {
    if (visible) {
      setStars(initialStars > 0 ? initialStars : 0);
    }
  }, [visible, initialStars]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.box}>
        <View style={styles.iconCircle}>
          <Ionicons name="star" size={30} color="#F5B301" />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= stars;
            return (
              <TouchableOpacity
                key={n}
                onPress={() => setStars(n)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${n} star`}
              >
                <Ionicons
                  name={filled ? "star" : "star-outline"}
                  size={36}
                  color={filled ? "#F5B301" : "#C8C2D8"}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, stars < 1 && styles.primaryBtnDisabled]}
          disabled={stars < 1}
          onPress={() => onSave(stars)}
        >
          <Text style={styles.primaryText}>{confirmLabel}</Text>
        </TouchableOpacity>

        {allowSkip ? (
          <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
            <Text style={styles.skipText}>Maybe later</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
            <Text style={styles.skipText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default RateAppModal;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 20000,
    elevation: 20000,
  },
  box: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF6D9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E1A6B",
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    marginBottom: 18,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 22,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: "#6C4DF7",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  skipBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  skipText: {
    color: "#777",
    fontWeight: "600",
    fontSize: 14,
  },
});
