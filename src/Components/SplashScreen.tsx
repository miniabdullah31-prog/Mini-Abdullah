import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";

type SplashScreenProps = {
  onFinish: () => void;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>

      <Text style={styles.topText}>Welcome🕌</Text>

      <View style={styles.content}>
        <Text style={styles.title}>
          Mini{"\n"}Abdullah
        </Text>

        <Text style={styles.subtitle}>
          Learn Islam the Right Way
        </Text>

        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

    {/*} <Image
  source={require("../assets/Mosque.png")}
  style={styles.mosque}
/>*/}
    </View>
  );
};

export default SplashScreen;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d6efd",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  topText: {
    position: "absolute",
    top: 50,
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  content: {
    alignItems: "center",
  },

  title: {
    fontSize: 45,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 55,
  },

  subtitle: {
    marginTop: 10,
    color: "white",
    fontSize: 16,
    opacity: 0.9,
  },

  dotsContainer: {
    flexDirection: "row",
    marginTop: 25,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "white",
    marginHorizontal: 6,
  },

  mosque: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    opacity: 0.08,
  },
});