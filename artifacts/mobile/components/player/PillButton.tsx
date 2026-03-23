import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import Colors from "@/constants/colors";

const C = Colors.dark;

type Props = {
  onPress: () => void;
  children: React.ReactNode;
  label?: string;
  style?: ViewStyle;
  active?: boolean;
  disabled?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PillButton({ onPress, children, label, style, active, disabled }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        animStyle,
        styles.pill,
        active && styles.pillActive,
        style,
      ]}
    >
      {children}
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.controlBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  pillActive: {
    backgroundColor: C.accentSoft,
    borderColor: C.accent,
  },
  label: {
    color: C.text,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
