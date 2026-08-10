import React from "react";
import { View, StyleSheet } from "react-native";

/** Soft decorative circles for gradient list cards (screenshot-style polish). */
const GradCardDecor: React.FC = () => (
  <>
    <View style={styles.decoTop} pointerEvents="none" />
    <View style={styles.decoBottom} pointerEvents="none" />
    <View style={styles.decoTiny} pointerEvents="none" />
    <View style={styles.decoMid} pointerEvents="none" />
  </>
);

export default GradCardDecor;

const styles = StyleSheet.create({
  decoTop: {
    position: "absolute",
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "rgba(255,255,255,0.14)",
    top: -22,
    right: -16,
  },
  decoBottom: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.1)",
    bottom: -14,
    left: -10,
  },
  decoTiny: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.16)",
    top: 14,
    left: 10,
  },
  decoMid: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: 10,
    right: 48,
  },
});
