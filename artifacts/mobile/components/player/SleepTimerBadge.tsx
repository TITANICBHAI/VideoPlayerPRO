import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import Colors from "@/constants/colors";
import { usePlayer } from "@/context/PlayerContext";

const C = Colors.dark;

export function SleepTimerBadge() {
  const { state, setSleepTimer } = usePlayer();

  if (state.sleepTimerRemaining === null) return null;

  const mins = Math.floor(state.sleepTimerRemaining / 60);
  const secs = state.sleepTimerRemaining % 60;
  const label = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.badge}>
      <Ionicons name="moon-outline" size={12} color="#CE93D8" />
      <Text style={styles.text}>{label}</Text>
      <Pressable
        onPress={() => {
          setSleepTimer(null);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={styles.cancel}
      >
        <Ionicons name="close" size={10} color={C.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(206,147,216,0.15)",
    borderWidth: 1,
    borderColor: "rgba(206,147,216,0.4)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    color: "#CE93D8",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  cancel: {
    padding: 2,
  },
});
