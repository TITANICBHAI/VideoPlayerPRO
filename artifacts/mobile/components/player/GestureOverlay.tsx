import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import Colors from "@/constants/colors";
import { usePlayer } from "@/context/PlayerContext";

const C = Colors.dark;
const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get("window");
const SWIPE_THRESHOLD = 60;
const GESTURE_ZONE_W = SCREEN_W * 0.3;
const MAX_VOL = 2.0;
const MAX_BRIGHT = 2.0;

type GestureIndicatorType = "volume" | "brightness" | "none";

function GestureIndicator({ type, value }: { type: GestureIndicatorType; value: number }) {
  if (type === "none") return null;
  const isVolume = type === "volume";
  const pct = Math.round(value * 100);
  const fillPct = Math.min(100, (value / (isVolume ? MAX_VOL : MAX_BRIGHT)) * 100);
  const isBoosted = value > 1.0;

  return (
    <Animated.View
      entering={FadeIn.duration(100)}
      exiting={FadeOut.duration(200)}
      style={[styles.indicator, isVolume ? styles.indicatorRight : styles.indicatorLeft]}
      pointerEvents="none"
    >
      <Text style={styles.indicatorIcon}>
        {isVolume ? (value === 0 ? "🔇" : "🔊") : "☀"}
      </Text>
      <View style={styles.indicatorBar}>
        <View
          style={[
            styles.indicatorFill,
            { height: `${fillPct}%` as any },
            isBoosted && styles.indicatorFillBoost,
          ]}
        />
        <View style={styles.indicatorMidMark} />
      </View>
      <Text style={[styles.indicatorPct, isBoosted && styles.indicatorPctBoost]}>
        {pct}%
      </Text>
      {isBoosted && (
        <Text style={styles.boostLabel}>BOOST</Text>
      )}
    </Animated.View>
  );
}

type Props = {
  onSeekRelative: (delta: number) => void;
  children?: React.ReactNode;
};

export function GestureOverlay({ children }: Props) {
  const { state, setVolume, setBrightness, setFullscreen } = usePlayer();
  const [gestureType, setGestureType] = useState<GestureIndicatorType>("none");
  const [gestureValue, setGestureValue] = useState(0);
  const gestureHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startX = useRef(0);
  const startVol = useRef(state.volume);
  const startBright = useRef(state.brightness);

  const showGesture = useCallback((type: GestureIndicatorType, value: number) => {
    setGestureType(type);
    setGestureValue(value);
    if (gestureHideTimer.current) clearTimeout(gestureHideTimer.current);
    gestureHideTimer.current = setTimeout(() => setGestureType("none"), 1500);
  }, []);

  const swipeGesture = Gesture.Pan()
    .minDistance(8)
    .runOnJS(true)
    .onBegin((e) => {
      startX.current = e.x;
      startVol.current = state.volume;
      startBright.current = state.brightness;
    })
    .onUpdate((e) => {
      const deltaY = e.translationY;
      const x = startX.current;
      const playerH = SCREEN_H * 0.35;

      if (x < GESTURE_ZONE_W) {
        const newVal = Math.max(0.05, Math.min(MAX_BRIGHT, startBright.current - deltaY / playerH));
        setBrightness(newVal);
        showGesture("brightness", newVal);
      } else if (x > SCREEN_W - GESTURE_ZONE_W) {
        const newVal = Math.max(0, Math.min(MAX_VOL, startVol.current - deltaY / playerH));
        setVolume(newVal);
        showGesture("volume", newVal);
      }
    })
    .onEnd((e) => {
      const deltaY = e.translationY;
      const x = startX.current;
      const isMidZone = x >= GESTURE_ZONE_W && x <= SCREEN_W - GESTURE_ZONE_W;

      if (isMidZone && Math.abs(deltaY) > SWIPE_THRESHOLD) {
        if (deltaY < -SWIPE_THRESHOLD && !state.isFullscreen) {
          setFullscreen(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (deltaY > SWIPE_THRESHOLD && state.isFullscreen) {
          setFullscreen(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={StyleSheet.absoluteFill}>
        {children}
        <GestureIndicator type={gestureType} value={gestureValue} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: "absolute",
    top: "20%",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.82)",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    minWidth: 56,
    zIndex: 200,
  },
  indicatorLeft: { left: 16 },
  indicatorRight: { right: 16 },
  indicatorIcon: { fontSize: 18 },
  indicatorBar: {
    width: 4,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "visible",
    justifyContent: "flex-end",
    position: "relative",
  },
  indicatorFill: {
    width: "100%",
    backgroundColor: C.accent,
    borderRadius: 2,
  },
  indicatorFillBoost: {
    backgroundColor: "#FFD54F",
  },
  indicatorMidMark: {
    position: "absolute",
    bottom: "50%",
    left: -3,
    right: -3,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 1,
  },
  indicatorPct: {
    color: C.text,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  indicatorPctBoost: {
    color: "#FFD54F",
  },
  boostLabel: {
    color: "#FFD54F",
    fontSize: 8,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
