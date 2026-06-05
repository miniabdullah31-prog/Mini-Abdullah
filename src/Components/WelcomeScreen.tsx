import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";

type Props = {
  goToSignup: () => void;
  goToLogin: () => void;
};

const MiniAbdullahWelcome: React.FC<Props> = ({
  goToSignup,
  goToLogin,
}) => {

  return (
    <View style={styles.container}>

      <View style={styles.kidSection}>

        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            Assalamu{"\n"}alaykum
          </Text>
        </View>

        <View style={styles.kidCircle}>
          <Image
            source={require("../assets/miniAbdullah.png")}
            style={styles.kidImage}
          />
        </View>

      </View>

      <View style={styles.brand}>

        <Text style={styles.brandTitle}>

          <Text style={styles.green}>M</Text>
          <Text style={styles.blue}>i</Text>
          <Text style={styles.indigo}>n</Text>
          <Text style={styles.purple}>i</Text>
          <Text style={styles.pink}>A</Text>
          <Text style={styles.orange}>bdullah</Text>

        </Text>

        <Text style={styles.brandSubtitle}>
          Islam essentials for kids
        </Text>

      </View>

      <View style={styles.buttons}>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={goToSignup}
        >
          <Text style={styles.primaryButtonText}>
            I'm new to Mini Abdullah
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={goToLogin}
        >
          <Text style={styles.secondaryButtonText}>
            I already have an account
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default MiniAbdullahWelcome;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#eef0f5",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
  },

  kidSection: {
    marginTop: 20,
    position: "relative",
    alignItems: "center",
  },

  speechBubble: {
    position: "absolute",
    left: -70,
    top: 30,
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 60,
    elevation: 5,
    zIndex: 10,
  },

  speechText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4c2aa8",
    textAlign: "center",
  },

  kidCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  kidImage: {
    width: 170,
    height: 170,
    borderRadius: 85,
    resizeMode: "cover",
  },

  brand: {
    alignItems: "center",
    marginTop: 30,
  },

  brandTitle: {
    fontSize: 48,
    fontWeight: "300",
  },

  green: {
    color: "#3fd18a",
  },

  blue: {
    color: "#47a8ff",
  },

  indigo: {
    color: "#5d6cff",
  },

  purple: {
    color: "#8b3dff",
  },

  pink: {
    color: "#d52f8c",
  },

  orange: {
    color: "#f28c28",
  },

  brandSubtitle: {
    marginTop: 10,
    color: "#4c2aa8",
    fontSize: 22,
    textAlign: "center",
  },

  buttons: {
    width: "100%",
    marginTop: "auto",
    gap: 20,
  },

  primaryButton: {
    backgroundColor: "#6c4df7",
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: "center",
    elevation: 5,
  },

  primaryButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#b35cff",
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#4c2aa8",
    fontSize: 18,
    fontWeight: "bold",
  },

});