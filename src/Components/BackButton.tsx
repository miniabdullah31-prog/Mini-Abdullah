import React from "react";

import {
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Ionicons from "@react-native-vector-icons/ionicons";

type Props = {
  onPress: () => void;
};

const BackButton: React.FC<Props> = ({
  onPress,
}) => {

  return (

    <TouchableOpacity
      style={styles.backButton}
      onPress={onPress}
    >

      <Ionicons
        name="arrow-back"
        size={28}
        color="#fff"
      />

    </TouchableOpacity>

  );
};

export default BackButton;

const styles = StyleSheet.create({

  backButton: {
    position: "absolute",
    left: 20,
    top: 25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

});