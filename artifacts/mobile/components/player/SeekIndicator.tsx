import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import Colors from "@/constants/colors";

const C = Colors.dark;

type Props = {
  direction: "left" | "right";
  seconds: number;
  visible: boolean;
};

export function SeekIndicator({ direction, seconds, visible }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 200 })
      );
      scale.value = withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(0.95, { duration: 400 })
      );
    }
  }, [visible, seconds]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        direction === "left" ? styles.left : styles.right,
        animStyle,
      ]}
    >
      <View style={styles.inner}>
        {[0, 1, 2].map((i) => (
          <Ionicons
            key={i}
            name={direction === "left" ? "play-back" : "play-forward"}
            size={18}
            color="rgba(255,255,255,0.9)"
            style={{ opacity: 1 - i * 0.3 }}
          />
        ))}
        <Text style={styles.text}>{seconds}s</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "30%",
    zIndex: 50,
  },
  left: {
    left: 32,
  },
  right: {
    right: 32,
  },
  inner: {
    alignItems: "center",
    gap: 2,
  },
  text: {
    color: C.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginTop: 2,
  },
});
