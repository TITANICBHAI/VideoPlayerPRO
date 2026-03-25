import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { usePlayer } from "@/context/PlayerContext";
import { PillButton } from "./PillButton";
import { ProgressBar } from "./ProgressBar";
import { SleepTimerBadge } from "./SleepTimerBadge";

const C = Colors.dark;
const HIDE_DELAY = 3500;

type Props = {
  onSeek: (t: number) => void;
  onSeekRelative: (delta: number) => void;
  onEnterPiP?: () => void;
  screenWidth: number;
};

export function Controls({ onSeek, onSeekRelative, onEnterPiP, screenWidth }: Props) {
  const {
    state,
    togglePlay,
    toggleMute,
    setPlaybackRate,
    toggleSettings,
    setFullscreen,
    toggleLock,
    setLoopMode,
    setShowControls,
  } = usePlayer();
  const insets = useSafeAreaInsets();
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holdingFast, setHoldingFast] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRate = useRef(state.playbackRate);
  const opacity = useSharedValue(1);
  const showSettingsRef = useRef(state.showSettings);
  const isLockedRef = useRef(state.isLocked);

  useEffect(() => { showSettingsRef.current = state.showSettings; }, [state.showSettings]);
  useEffect(() => { isLockedRef.current = state.isLocked; }, [state.isLocked]);

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    opacity.value = withTiming(1, { duration: 150 });
    setShowControls(true);
    hideTimer.current = setTimeout(() => {
      if (!showSettingsRef.current && !isLockedRef.current) {
        opacity.value = withTiming(0, { duration: 400 });
        setShowControls(false);
      }
    }, HIDE_DELAY);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [state.isPlaying, state.showSettings]);

  useEffect(() => {
    if (!state.showControls) {
      opacity.value = withTiming(0, { duration: 400 });
    } else {
      opacity.value = withTiming(1, { duration: 150 });
    }
  }, [state.showControls]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (state.isFullscreen) {
        setFullscreen(false);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [state.isFullscreen]);

  const handlePressIn = () => {
    prevRate.current = state.playbackRate;
    holdTimer.current = setTimeout(() => {
      setHoldingFast(true);
      setPlaybackRate(2);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 400);
  };

  const handlePressOut = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (holdingFast) {
      setPlaybackRate(prevRate.current);
      setHoldingFast(false);
    }
  };

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const handlePlay = () => {
    togglePlay();
    resetHideTimer();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBack10 = () => {
    onSeekRelative(-10);
    resetHideTimer();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleForward10 = () => {
    onSeekRelative(10);
    resetHideTimer();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLoop = () => {
    const next =
      state.loopMode === "none" ? "one" : state.loopMode === "one" ? "all" : "none";
    setLoopMode(next as any);
    resetHideTimer();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .runOnJS(true)
    .onEnd(() => {
      if (state.isLocked) return;
      if (state.showControls) {
        opacity.value = withTiming(0, { duration: 200 });
        setShowControls(false);
      } else {
        resetHideTimer();
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .runOnJS(true)
    .onEnd((e) => {
      if (state.isLocked) return;
      const isLeft = e.x < screenWidth / 2;
      onSeekRelative(isLeft ? -10 : 10);
      resetHideTimer();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });

  const longPress = Gesture.LongPress()
    .minDuration(400)
    .runOnJS(true)
    .onBegin(handlePressIn)
    .onFinalize(handlePressOut);

  singleTap.requireExternalGestureToFail(doubleTap);

  const composedGesture = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTap, singleTap),
    longPress
  );

  const topInset = state.isFullscreen ? insets.top : 0;
  const bottomInset = state.isFullscreen ? insets.bottom : 0;
  const loopActive = state.loopMode !== "none";
  const loopIcon = state.loopMode === "one" ? "repeat-once" : "repeat";

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[StyleSheet.absoluteFill, animStyle, styles.container]}>
        {state.isLocked ? (
          <View style={[StyleSheet.absoluteFill, styles.lockOnly, { paddingTop: topInset + 12 }]}>
            <PillButton
              onPress={() => {
                toggleLock();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Ionicons name="lock-closed" size={14} color={C.accent} />
              <Text style={styles.lockText}>Locked — Tap to unlock</Text>
            </PillButton>
          </View>
        ) : (
          <>
            {/* TOP BAR */}
            <View style={[styles.topBar, { paddingTop: topInset + 8 }]}>
              <View style={styles.topLeft}>
                {state.currentVideo && (
                  <Text style={styles.videoTitle} numberOfLines={1}>
                    {state.currentVideo.title}
                  </Text>
                )}
              </View>
              <View style={styles.topRight}>
                {holdingFast && (
                  <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.fastBadge}>
                    <Ionicons name="flash" size={12} color="#FFD54F" />
                    <Text style={styles.fastBadgeText}>2x</Text>
                  </Animated.View>
                )}
                <SleepTimerBadge />
                <PillButton onPress={() => { toggleLock(); resetHideTimer(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
                  <Ionicons name="lock-open-outline" size={14} color={C.text} />
                </PillButton>
                <PillButton onPress={() => { toggleSettings(); resetHideTimer(); }}>
                  <Ionicons name="settings-outline" size={14} color={C.text} />
                </PillButton>
                {Platform.OS !== "web" && onEnterPiP && (
                  <PillButton onPress={() => { onEnterPiP(); resetHideTimer(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                    <MaterialCommunityIcons name="picture-in-picture-bottom-right" size={14} color={C.text} />
                  </PillButton>
                )}
                <PillButton onPress={() => { setFullscreen(!state.isFullscreen); resetHideTimer(); }}>
                  <Ionicons
                    name={state.isFullscreen ? "contract-outline" : "expand-outline"}
                    size={14}
                    color={C.text}
                  />
                </PillButton>
              </View>
            </View>

            {/* CENTER CONTROLS — absolutely centred */}
            <View style={styles.centerArea} pointerEvents="box-none">
              <View style={styles.centerRow}>
                <PillButton onPress={handleBack10} style={styles.seekBtn}>
                  <MaterialIcons name="replay-10" size={26} color={C.text} />
                </PillButton>
                <PillButton onPress={handlePlay} style={styles.playBtn}>
                  <Ionicons
                    name={state.isPlaying ? "pause" : "play"}
                    size={32}
                    color={C.text}
                  />
                </PillButton>
                <PillButton onPress={handleForward10} style={styles.seekBtn}>
                  <MaterialIcons name="forward-10" size={26} color={C.text} />
                </PillButton>
              </View>
              <View style={styles.swipeHintRow} pointerEvents="none">
                <Text style={styles.swipeHintText}>
                  {state.isFullscreen ? "swipe down to exit" : "double-tap to seek · swipe up for fullscreen"}
                </Text>
              </View>
            </View>

            {/* BOTTOM BAR */}
            <View style={[styles.bottomBar, { paddingBottom: bottomInset + 8 }]}>
              <ProgressBar onSeek={onSeek} />
              <View style={styles.bottomControls}>
                <PillButton onPress={() => { toggleMute(); resetHideTimer(); }}>
                  <Ionicons
                    name={state.isMuted ? "volume-mute" : "volume-medium"}
                    size={16}
                    color={C.text}
                  />
                </PillButton>
                <PillButton
                  onPress={() => {
                    const rates = [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4] as const;
                    const idx = rates.indexOf(state.playbackRate as any);
                    const next = rates[(idx + 1) % rates.length];
                    setPlaybackRate(next);
                    resetHideTimer();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  label={`${state.playbackRate}x`}
                >
                  <Ionicons name="speedometer-outline" size={13} color={C.text} />
                </PillButton>
                <PillButton onPress={handleLoop} active={loopActive}>
                  <MaterialCommunityIcons
                    name={loopIcon}
                    size={15}
                    color={loopActive ? C.accent : C.text}
                  />
                </PillButton>
                {state.audioNormalization && (
                  <PillButton onPress={() => {}} active>
                    <Ionicons name="volume-medium" size={13} color={C.accent} />
                    <Text style={{ color: C.accent, fontSize: 9, fontFamily: "Inter_700Bold" }}>NRM</Text>
                  </PillButton>
                )}
                {state.captionsEnabled && (
                  <PillButton onPress={() => {}} active>
                    <Ionicons name="text" size={14} color={C.accent} />
                  </PillButton>
                )}
                {state.backgroundPlayback && (
                  <PillButton onPress={() => {}} active>
                    <Ionicons name="headset-outline" size={14} color="#80CBC4" />
                  </PillButton>
                )}
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  lockOnly: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  lockText: {
    color: C.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    gap: 8,
  },
  topLeft: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 2,
  },
  videoTitle: {
    color: C.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  topRight: {
    flexDirection: "row",
    gap: 5,
    flexShrink: 0,
    alignItems: "center",
  },
  centerArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  seekBtn: {
    width: 52,
    height: 52,
    borderRadius: 999,
    paddingHorizontal: 0,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 999,
    paddingHorizontal: 0,
    backgroundColor: C.controlBgActive,
    borderColor: C.borderStrong,
  },
  swipeHintRow: {
    alignItems: "center",
  },
  swipeHintText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    gap: 8,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    flexWrap: "wrap",
  },
  fastBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FFD54F",
  },
  fastBadgeText: {
    color: "#FFD54F",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
});
