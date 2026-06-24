import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

type Props = {
  onPress: () => void;
};

const BackButton: React.FC<Props> = ({ onPress }) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.7}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        style={styles.backButton}
        onPress={onPress}
      >
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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

    elevation: 10,
  },
});