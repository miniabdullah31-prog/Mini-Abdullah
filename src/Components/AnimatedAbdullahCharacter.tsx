import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated, Easing } from "react-native";

export type AbdullahAnimState = "idle" | "listening" | "thinking" | "speaking";

type Props = {
  state: AbdullahAnimState;
  /** Kept for API compatibility with TalkingAbdullah lip-sync callbacks. */
  mouthOpen?: boolean;
  size?: number;
};

/**
 * Circular Mini Abdullah avatar.
 * No white fill and no Android elevation — those draw a square flash while speaking.
 */
const AnimatedAbdullahCharacter: React.FC<Props> = ({
  state,
  size = 210,
}) => {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const nodAnim = useRef(new Animated.Value(0)).current;
  const listenPulse = useRef(new Animated.Value(1)).current;

  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isThinking = state === "thinking";

  useEffect(() => {
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: 1,
          duration: isSpeaking ? 480 : 980,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: isSpeaking ? 480 : 980,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    bobLoop.start();
    return () => bobLoop.stop();
  }, [bobAnim, isSpeaking]);

  useEffect(() => {
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    swayLoop.start();
    return () => swayLoop.stop();
  }, [swayAnim]);

  useEffect(() => {
    if (!isListening) {
      listenPulse.setValue(1);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(listenPulse, {
          toValue: 1.03,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(listenPulse, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [isListening, listenPulse]);

  useEffect(() => {
    if (!isSpeaking) {
      nodAnim.setValue(0);
      return;
    }

    const nodLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(nodAnim, {
          toValue: 1,
          duration: 380,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(nodAnim, {
          toValue: 0,
          duration: 380,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    nodLoop.start();
    return () => nodLoop.stop();
  }, [isSpeaking, nodAnim]);

  const bobY = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, isSpeaking ? -6 : -10],
  });

  const rotate = swayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-2deg", "2deg"],
  });

  const nodRotate = nodAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "3.5deg"],
  });

  const ringScale = isListening ? listenPulse : 1;
  const imageScale = isThinking ? 0.97 : 1;
  const activeRotate = isSpeaking ? nodRotate : rotate;
  const characterSize = size * 0.78;

  const ringBorder =
    state === "listening"
      ? "#FF6B6B"
      : state === "speaking"
        ? "#6C4DF7"
        : state === "thinking"
          ? "#F5B041"
          : "#D9CFFF";

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.shadow,
          {
            width: size * 0.5,
            transform: [
              {
                scaleX: bobAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.88],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: ringBorder,
            transform: [{ scale: ringScale }],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [
              { translateY: bobY },
              { rotate: activeRotate },
              { scale: imageScale },
            ],
          }}
        >
          <Image
            source={require("../assets/miniAbdullah.png")}
            style={{
              width: characterSize,
              height: characterSize,
              borderRadius: characterSize / 2,
            }}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default AnimatedAbdullahCharacter;

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  shadow: {
    position: "absolute",
    bottom: 8,
    height: 12,
    borderRadius: 50,
    backgroundColor: "rgba(75, 42, 168, 0.16)",
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
});
