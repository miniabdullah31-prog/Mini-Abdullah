import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";

type SplashScreenProps = {
  /** Resolve next screen while splash shows; navigation only after min duration + this. */
  resolveNext: () => Promise<number>;
  onNavigate: (screen: number) => void;
};

const MIN_SPLASH_MS = 3000;

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
    <LinearGradient
      colors={["#172B6D", "#2A347C", "#8B285C"]}
      locations={[0, 0.46, 1]}
      start={{ x: 0.08, y: 0 }}
      end={{ x: 0.92, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.topText}>Welcome 🕌</Text>

      <View style={styles.content}>
        <View style={styles.glassRing}>
          <Image
            source={require("../assets/miniAbdullah.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>
          Mini
        </Text>
        <Text style={styles.abdullahUrdu}>عبداللہ</Text>

        <Text style={styles.urdu}>اسلام سیکھیں پیارے انداز میں</Text>
        <Text style={styles.subtitle}>Learn Islam the Right Way</Text>

        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotMid]} />
          <View style={styles.dot} />
        </View>
      </View>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  topText: {
    position: "absolute",
    top: 50,
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  content: {
    alignItems: "center",
  },
  glassRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "rgba(255,255,255,0.42)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.75)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    resizeMode: "cover",
  },
  title: {
    fontSize: 44,
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 52,
    letterSpacing: 0.8,
    fontFamily: Platform.select({
      ios: "Avenir Next",
      android: "casual",
      default: undefined,
    }),
    textShadowColor: "rgba(8, 12, 40, 0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  abdullahUrdu: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 46,
    fontWeight: "700",
    textAlign: "center",
    writingDirection: "rtl",
    fontFamily: Platform.select({
      ios: "Geeza Pro",
      android: "NotoNastaliqUrdu",
      default: undefined,
    }),
    textShadowColor: "rgba(8, 12, 40, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  urdu: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 34,
    fontWeight: "700",
    textAlign: "center",
    writingDirection: "rtl",
    fontFamily: Platform.select({
      ios: "Geeza Pro",
      android: "NotoNastaliqUrdu",
      default: undefined,
    }),
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.95)",
    fontSize: 16,
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 25,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.85)",
    marginHorizontal: 6,
  },
  dotMid: {
    backgroundColor: "#FFFFFF",
  },
});
