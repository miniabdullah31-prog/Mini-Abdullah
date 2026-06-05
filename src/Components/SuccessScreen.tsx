import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

type Props = {
  goToHome: () => void;
};

const SuccessScreen: React.FC<Props> = ({ goToHome }) => {

  return (
    <ImageBackground
      source={require("../assets/successScreen.png")}
      style={styles.container}
      resizeMode="cover"
    >

      <View style={styles.overlay}>

        <Image
          source={require("../assets/miniAbdullah.png")}
          style={styles.kidImage}
        />

        <Text style={styles.title}>
          Account created successfully
        </Text>

        <Text style={styles.description}>
          Your child is ready to learn all the{"\n"}
          Islam essentials
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={goToHome}
        >
          <Text style={styles.buttonText}>
            Continue
          </Text>
        </TouchableOpacity>

      </View>

    </ImageBackground>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  overlay: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    paddingVertical: 35,
    paddingHorizontal: 24,
    borderRadius: 32,
  },

  kidImage: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: 20,
  },

  title: {
    fontSize: 34,
    color: "#3b178d",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 42,
  },

  description: {
    fontSize: 20,
    color: "#3b178d",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 50,
  },

  button: {
    width: "100%",
    maxWidth: 300,
    paddingVertical: 18,
    borderRadius: 32,
    backgroundColor: "#28b273",
    alignItems: "center",
    elevation: 5,
  },

  buttonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },

});