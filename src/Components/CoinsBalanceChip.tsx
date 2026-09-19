import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Props = {
  coins: number | null;
};

const CoinsBalanceChip: React.FC<Props> = ({ coins }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (typeof coins !== "number") {
      return;
    }
    if (prev.current != null && coins !== prev.current) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prev.current = coins;
  }, [coins, scale]);

  return (
    <Animated.View style={[styles.chip, { transform: [{ scale }] }]}>
      <View style={styles.iconWrap}>
        <Text style={styles.coinIcon}>🪙</Text>
      </View>
      <View>
        <Text style={styles.label}>Coins</Text>
        <Text style={styles.count}>
          {typeof coins === "number" ? coins : "—"}
        </Text>
      </View>
    </Animated.View>
  );
};

export default CoinsBalanceChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#FED7AA",
    gap: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FDE68A",
    alignItems: "center",
    justifyContent: "center",
  },
  coinIcon: {
    fontSize: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B45309",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  count: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4B2AA8",
    lineHeight: 22,
    minWidth: 28,
  },
});
