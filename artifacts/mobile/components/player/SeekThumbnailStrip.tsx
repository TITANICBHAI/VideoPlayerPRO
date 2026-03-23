import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import Colors from "@/constants/colors";
import { formatTime } from "@/utils/format";

const C = Colors.dark;
const { width: W } = Dimensions.get("window");
const THUMB_W = 72;
const THUMB_H = 44;
const THUMB_COUNT = 7;

type Props = {
  visible: boolean;
  currentTime: number;
  duration: number;
  seekTime: number;
};

function ThumbnailFrame({ isActive, time }: { isActive: boolean; time: number }) {
  // In a real app these would be generated frames from the video.
  // We simulate with gradient blocks representing different timestamps.
  const hue = Math.floor((time / Math.max(1, 3600)) * 280);
  const bg = `hsl(${hue}, 30%, 20%)`;

  return (
    <View style={[styles.frame, isActive && styles.frameActive, { backgroundColor: bg }]}>
      <View style={styles.frameInner}>
        <View style={[styles.frameLine, { width: THUMB_W * 0.6, top: THUMB_H * 0.3 }]} />
        <View style={[styles.frameLine, { width: THUMB_W * 0.4, top: THUMB_H * 0.5 }]} />
        <View style={[styles.frameLine, { width: THUMB_W * 0.5, top: THUMB_H * 0.7 }]} />
      </View>
      {isActive && (
        <View style={styles.frameTimeContainer}>
          <Text style={styles.frameTime}>{formatTime(time)}</Text>
        </View>
      )}
    </View>
  );
}

export function SeekThumbnailStrip({ visible, currentTime, duration, seekTime }: Props) {
  if (!visible || duration <= 0) return null;

  const centerRatio = seekTime / duration;
  const step = duration / Math.max(1, THUMB_COUNT - 1);

  const frames = Array.from({ length: THUMB_COUNT }, (_, i) => {
    const centerIdx = Math.round(centerRatio * (THUMB_COUNT - 1));
    const offset = i - Math.floor(THUMB_COUNT / 2);
    const idx = centerIdx + offset;
    const clampedIdx = Math.max(0, Math.min(THUMB_COUNT - 1, idx));
    const t = clampedIdx * step;
    return { t, isActive: i === Math.floor(THUMB_COUNT / 2) };
  });

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
      pointerEvents="none"
    >
      <View style={styles.strip}>
        {frames.map((f, i) => (
          <ThumbnailFrame key={i} isActive={f.isActive} time={f.t} />
        ))}
      </View>
      <View style={styles.seekInfo}>
        <Text style={styles.seekTimeText}>{formatTime(seekTime)}</Text>
        <Text style={styles.seekHint}>Slide to fine-tune</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 6,
    zIndex: 90,
  },
  strip: {
    flexDirection: "row",
    gap: 3,
    alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  frame: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.7,
    position: "relative",
  },
  frameActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: C.accent,
    height: THUMB_H + 8,
    marginTop: -8,
  },
  frameInner: {
    ...StyleSheet.absoluteFillObject,
  },
  frameLine: {
    position: "absolute",
    height: 2,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 1,
  },
  frameTimeContainer: {
    position: "absolute",
    bottom: 3,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  frameTime: {
    color: C.text,
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },
  seekInfo: {
    alignItems: "center",
    gap: 2,
  },
  seekTimeText: {
    color: C.text,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  seekHint: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
});
