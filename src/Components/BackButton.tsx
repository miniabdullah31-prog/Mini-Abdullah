import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

type Props = {
  onPress: () => void;
};

const BackButton: React.FC<Props> = ({ onPress }) => {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Pressable
        android_ripple={{ color: "transparent" }}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </Pressable>
    </View>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
});
