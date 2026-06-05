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
  step: number;
  next: () => void;
};

const Onboarding: React.FC<Props> = ({ step, next }) => {

  const data = [
    {
      title: "The Learning Journey",
      desc: "Discover the beauty of Quran",
      image: require("../assets/learning.png"),
    },
    {
      title: "Fun & Games",
      desc: "Learn through exciting games and challenges",
      image: require("../assets/fun-games.png"),
    },
    {
      title: "Your AI Friend",
      desc: "Chat with our AI companion for personalized guidance and support",
      image: require("../assets/ai.png"),
    },
  ];

  const current = data[step - 1];

  return (
    <View style={styles.container}>

      <Text style={styles.skip}>Skip</Text>

      <View style={styles.card}>

        <View style={styles.imageContainer}>
          <Image
            source={current.image}
            style={styles.image}
          />
        </View>

        <Text style={styles.title}>
          {current.title}
        </Text>

        <Text style={styles.desc}>
          {current.desc}
        </Text>

        <View style={styles.progress}>
          <View
            style={[
              styles.fill,
              {
                width:
                  step === 1
                    ? "33%"
                    : step === 2
                    ? "66%"
                    : "100%",
              },
            ]}
          />
        </View>

        <View style={styles.dots}>

          <View
            style={[
              styles.dot,
              step === 1 && styles.activeDot,
            ]}
          />

          <View
            style={[
              styles.dot,
              step === 2 && styles.activeDot,
            ]}
          />

          <View
            style={[
              styles.dot,
              step === 3 && styles.activeDot,
            ]}
          />

        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={next}
        >
          <Text style={styles.buttonText}>
            Next
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default Onboarding;

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  skip: {
    position: "absolute",
    top: 50,
    right: 20,
    fontSize: 14,
    color: "gray",
  },

  card: {
    width: width * 0.95,
    height: height * 0.8,
    backgroundColor: "#fffaf0",
    borderRadius: 28,
    paddingVertical: 35,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 8,
  },

  imageContainer: {
    width: width * 0.85,
    height: height * 0.35,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  title: {
    color: "#0d6efd",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 38,
  },

  desc: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  progress: {
    width: "80%",
    height: 4,
    backgroundColor: "#e6e6e6",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
  },

  fill: {
    height: "100%",
    backgroundColor: "#0d6efd",
  },

  dots: {
    flexDirection: "row",
    marginTop: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "lightgray",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#0d6efd",
    transform: [{ scale: 1.3 }],
  },

  button: {
    marginTop: 15,
    backgroundColor: "#0d6efd",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
    minWidth: 140,
    alignItems: "center",
    elevation: 5,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});