import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

type SplashScreenProps = {
  /** Resolve next screen while splash shows; navigation only after min duration + this. */
  resolveNext: () => Promise<number>;
  onNavigate: (screen: number) => void;
};

const MIN_SPLASH_MS = 1000;

const SplashScreen: React.FC<SplashScreenProps> = ({
  resolveNext,
  onNavigate,
}) => {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [, next] = await Promise.all([
          new Promise<void>((resolve) => setTimeout(resolve, MIN_SPLASH_MS)),
          resolveNext(),
        ]);
        if (!cancelled) {
          onNavigate(next);
        }
      } catch {
        if (!cancelled) {
          onNavigate(2);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolveNext, onNavigate]);

  return (
    <View style={styles.container}>
      <Text style={styles.topText}>Welcome🕌</Text>

      <View style={styles.content}>
        <Text style={styles.title}>
          Mini{"\n"}Abdullah
        </Text>

        <Text style={styles.subtitle}>Learn Islam the Right Way</Text>

        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
};

export default SplashScreen;

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
});
