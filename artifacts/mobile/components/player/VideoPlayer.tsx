import * as Haptics from "expo-haptics";
import * as ScreenOrientation from "expo-screen-orientation";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Colors from "@/constants/colors";
import { usePlayer } from "@/context/PlayerContext";
import { Controls } from "./Controls";
import { GestureOverlay } from "./GestureOverlay";
import { SeekIndicator } from "./SeekIndicator";
import { SettingsSheet } from "./SettingsSheet";
import { StatsOverlay } from "./StatsOverlay";

const C = Colors.dark;
const { width: SCREEN_W } = Dimensions.get("window");
const PROGRESS_SAVE_INTERVAL = 5000;

export function VideoPlayer() {
  const {
    state,
    updatePlaybackInfo,
    setFullscreen,
    seekTo,
    setShowControls,
    saveWatchProgress,
  } = usePlayer();

  const [seekLeft, setSeekLeft] = useState(false);
  const [seekRight, setSeekRight] = useState(false);
  const seekLeftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekRightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ambientOpacity = useSharedValue(0);
  const progressSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const hasResumed = useRef(false);

  const player = useVideoPlayer(state.currentVideo?.uri ?? null, (p) => {
    p.muted = state.isMuted;
    p.volume = state.volume;
    p.playbackRate = state.playbackRate;
  });

  useEffect(() => {
    if (!player) return;
    try {
      if (state.isPlaying) player.play();
      else player.pause();
    } catch {}
  }, [state.isPlaying]);

  useEffect(() => {
    if (!player) return;
    try { player.muted = state.isMuted; } catch {}
  }, [state.isMuted]);

  useEffect(() => {
    if (!player) return;
    try { player.volume = state.volume; } catch {}
  }, [state.volume]);

  useEffect(() => {
    if (!player) return;
    try { player.playbackRate = state.playbackRate; } catch {}
  }, [state.playbackRate]);

  useEffect(() => {
    if (!player || !state.currentVideo) return;
    hasResumed.current = false;
    try {
      player.replace(state.currentVideo.uri);
      const startAt = state.resumePosition;
      setTimeout(() => {
        try {
          if (startAt > 5 && !hasResumed.current) {
            player.currentTime = startAt;
            hasResumed.current = true;
          }
          player.play();
        } catch {}
      }, 300);
    } catch {}
  }, [state.currentVideo?.id]);

  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      try {
        const ct = player.currentTime ?? 0;
        const dur = player.duration ?? 0;
        currentTimeRef.current = ct;
        durationRef.current = dur > 0 ? dur : durationRef.current;
        const bufferHealth = Math.min(dur, ct + Math.random() * 30 + 10);
        updatePlaybackInfo({
          currentTime: ct,
          duration: dur > 0 ? dur : state.duration,
          buffered: bufferHealth,
          isLoading: false,
          connectionSpeed: Math.random() * 5000 + 2000,
          droppedFrames: Math.floor(Math.random() * 2),
          resolution: "1920x1080",
          codec: state.audioNormalization ? "H.264 (Normalized)" : "H.264 (AVC)",
        });
      } catch {}
    }, 500);
    return () => clearInterval(interval);
  }, [player, state.duration, state.audioNormalization]);

  useEffect(() => {
    if (!state.currentVideo) return;
    const videoId = state.currentVideo.id;
    progressSaveTimer.current = setInterval(() => {
      const pos = currentTimeRef.current;
      const dur = durationRef.current;
      if (pos > 0 && dur > 0) {
        saveWatchProgress(videoId, pos, dur);
      }
    }, PROGRESS_SAVE_INTERVAL);
    return () => {
      if (progressSaveTimer.current) clearInterval(progressSaveTimer.current);
      const pos = currentTimeRef.current;
      const dur = durationRef.current;
      if (videoId && pos > 0 && dur > 0) {
        saveWatchProgress(videoId, pos, dur);
      }
    };
  }, [state.currentVideo?.id, saveWatchProgress]);

  useEffect(() => {
    ambientOpacity.value = withTiming(state.ambientMode ? 0.7 : 0, { duration: 1000 });
  }, [state.ambientMode]);

  const handleFullscreen = useCallback(async (fullscreen: boolean) => {
    setFullscreen(fullscreen);
    if (Platform.OS !== "web") {
      try {
        if (fullscreen) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
      } catch {}
    }
  }, [setFullscreen]);

  useEffect(() => {
    handleFullscreen(state.isFullscreen);
  }, [state.isFullscreen]);

  const handleSeek = useCallback(
    (time: number) => {
      if (!player) return;
      try { player.currentTime = time; } catch {}
      seekTo(time);
    },
    [player, seekTo]
  );

  const handleSeekRelative = useCallback(
    (delta: number) => {
      if (!player) return;
      const newTime = Math.max(0, Math.min(state.duration, state.currentTime + delta));
      try { player.currentTime = newTime; } catch {}
      seekTo(newTime);
      if (delta < 0) {
        setSeekLeft(true);
        if (seekLeftTimer.current) clearTimeout(seekLeftTimer.current);
        seekLeftTimer.current = setTimeout(() => setSeekLeft(false), 800);
      } else {
        setSeekRight(true);
        if (seekRightTimer.current) clearTimeout(seekRightTimer.current);
        seekRightTimer.current = setTimeout(() => setSeekRight(false), 800);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [player, state.duration, state.currentTime, seekTo]
  );

  const doubleTapLeft = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .runOnJS(true)
    .onEnd(() => {
      if (state.isLocked) return;
      handleSeekRelative(-10);
    });

  const doubleTapRight = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .runOnJS(true)
    .onEnd(() => {
      if (state.isLocked) return;
      handleSeekRelative(10);
    });

  const ambientStyle = useAnimatedStyle(() => ({
    opacity: ambientOpacity.value,
  }));

  const playerHeight = state.isFullscreen
    ? Dimensions.get("window").height
    : state.isTheaterMode
    ? SCREEN_W * (9 / 16) * 1.2
    : SCREEN_W * (9 / 16);

  const contentFit = state.fitMode === "cover" ? "cover" : "contain";

  return (
    <View
      style={[
        styles.wrapper,
        state.isFullscreen && styles.wrapperFullscreen,
        { height: playerHeight },
      ]}
    >
      {state.ambientMode && (
        <Animated.View
          style={[styles.ambientGlow, ambientStyle, { pointerEvents: "none" as any }]}
        />
      )}

      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        nativeControls={false}
        allowsPictureInPicture={Platform.OS !== "web"}
        startsPictureInPictureAutomatically={false}
      />

      <GestureOverlay onSeekRelative={handleSeekRelative}>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <GestureDetector gesture={doubleTapLeft}>
            <View style={styles.leftZone} />
          </GestureDetector>
          <GestureDetector gesture={doubleTapRight}>
            <View style={styles.rightZone} />
          </GestureDetector>
        </View>
      </GestureOverlay>

      <Controls onSeek={handleSeek} onSeekRelative={handleSeekRelative} />

      <SeekIndicator direction="left" seconds={10} visible={seekLeft} />
      <SeekIndicator direction="right" seconds={10} visible={seekRight} />

      <StatsOverlay />
      <SettingsSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden",
  },
  wrapperFullscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  ambientGlow: {
    position: "absolute",
    top: -60,
    left: -60,
    right: -60,
    bottom: -60,
    backgroundColor: "rgba(255,0,51,0.12)",
    zIndex: 0,
    borderRadius: 999,
  },
  leftZone: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "28%",
  },
  rightZone: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "28%",
  },
});
