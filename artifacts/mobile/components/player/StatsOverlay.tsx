import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { usePlayer } from "@/context/PlayerContext";
import { formatTime } from "@/utils/format";

const C = Colors.dark;

export function StatsOverlay() {
  const { state, toggleStatsForNerds } = usePlayer();
  if (!state.showStatsForNerds) return null;

  const bufferHealth = state.duration > 0
    ? Math.max(0, state.buffered - state.currentTime).toFixed(1)
    : "0.0";

  const rows = [
    { label: "Resolution", value: state.resolution },
    { label: "Codec", value: state.codec },
    { label: "Playback Speed", value: `${state.playbackRate}x` },
    { label: "Quality", value: state.quality },
    { label: "Buffer Health", value: `${bufferHealth}s` },
    { label: "Connection", value: `${(state.connectionSpeed).toFixed(0)} Kbps` },
    { label: "Dropped Frames", value: `${state.droppedFrames}` },
    { label: "Duration", value: formatTime(state.duration) },
    { label: "Current Time", value: formatTime(state.currentTime) },
  ];

  return (
    <View style={[styles.overlay, { pointerEvents: "box-none" }]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Stats for Nerds</Text>
          <Pressable onPress={toggleStatsForNerds} style={styles.closeBtn}>
            <Ionicons name="close" size={16} color={C.textSecondary} />
          </Pressable>
        </View>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 60,
    left: 12,
    zIndex: 100,
  },
  card: {
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    minWidth: 200,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: {
    color: C.text,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
    gap: 16,
  },
  label: {
    color: C.textSecondary,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  value: {
    color: "#00E5FF",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
});
