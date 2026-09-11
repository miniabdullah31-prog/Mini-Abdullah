import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Props = Omit<PressableProps, "style" | "android_ripple"> & {
  style?: StyleProp<ViewStyle>;
  /** Keep this in sync with the card's borderRadius so the overlay stays clipped. */
  radius?: number;
};

/**
 * Module/card press without the white-square flash.
 * Avoids TouchableOpacity fade, Android white ripples, and scale gaps.
 */
const SmoothPressable: React.FC<Props> = ({
  style,
  radius = 22,
  children,
  ...rest
}) => {
  return (
    <Pressable
      android_ripple={{ color: "transparent" }}
      style={[styles.base, { borderRadius: radius }, style]}
      {...rest}
    >
      {({ pressed }) => (
        <>
          {children}
          {pressed ? (
            <View
              pointerEvents="none"
              style={[styles.overlay, { borderRadius: radius }]}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 12, 48, 0.08)",
  },
});

export default SmoothPressable;
