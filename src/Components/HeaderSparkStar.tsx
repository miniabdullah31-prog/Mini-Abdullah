import React from "react";
import { View, StyleSheet } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

/** Small gold star under hub headers — matches FYP screenshot polish. */
const HeaderSpark: React.FC = () => (
  <View style={styles.wrap} pointerEvents="none">
    <Ionicons name="star" size={14} color="#F5C542" />
  </View>
);

export default HeaderSpark;

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.95,
  },
});
