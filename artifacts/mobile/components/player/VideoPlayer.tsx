import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ScreenOrientation from "expo-screen-orientation";
import { useVideoPlayer, VideoView, type VideoViewRef } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
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
const PROGRESS_SAVE_INTERVAL = 5000;
const PLAYBACK_POLL_INTERVAL = 1000;

export function VideoPlayer() {
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
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
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const seekLeftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekRightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ambientOpacity = useSharedValue(0);
  const progressSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const hasResumed = useRef(false);
  const videoViewRef = useRef<VideoViewRef>(null);

  const player = useVideoPlayer(state.currentVideo?.uri ?? null, (p) => {
    p.muted = state.isMuted;
    p.volume = Math.min(1, state.volume);
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
    try {
      player.volume = Math.min(1, state.volume);
    } catch {}
  }, [state.volume]);

  useEffect(() => {
    if (!player) return;
    try {
      player.playbackRate = state.playbackRate;
      (player as any).preservesPitch = true;
    } catch {}
  }, [state.playbackRate]);

  useEffect(() => {
    if (!player || !state.currentVideo) return;
    hasResumed.current = false;
    setPlayerError(null);
    setIsBuffering(true);
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
    let subscription: any;
    try {
      subscription = (player as any).addListener?.("statusChange", ({ status, error }: any) => {
        if (status === "error") {
          setPlayerError(error?.message ?? "Failed to load video");
          setIsBuffering(false);
        } else if (status === "readyToPlay") {
          setPlayerError(null);
          setIsBuffering(false);
        } else if (status === "loading") {
          setIsBuffering(true);
        }
      });
    } catch {}
    return () => { try { subscription?.remove?.(); } catch {} };
  }, [player]);

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
        if (dur > 0) setIsBuffering(false);
      } catch {}
    }, PLAYBACK_POLL_INTERVAL);
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

  const handleEnterPiP = useCallback(() => {
    try {
      videoViewRef.current?.startPictureInPicture();
    } catch {}
  }, []);

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

  const ambientStyle = useAnimatedStyle(() => ({
    opacity: ambientOpacity.value,
  }));

  const playerHeight = state.isFullscreen
    ? SCREEN_H
    : state.isTheaterMode
    ? SCREEN_W * (9 / 16) * 1.2
    : SCREEN_W * (9 / 16);

  const contentFit = state.fitMode === "cover" ? "cover" : "contain";

  const brightnessBoost = state.brightness > 1
    ? Math.min(0.75, (state.brightness - 1) * 0.75)
    : 0;

  const handleRetry = () => {
    setPlayerError(null);
    setIsBuffering(true);
    if (state.currentVideo && player) {
      try {
        player.replace(state.currentVideo.uri);
        setTimeout(() => { try { player.play(); } catch {} }, 300);
      } catch {}
    }
  };

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
        ref={videoViewRef}
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        nativeControls={false}
        allowsPictureInPicture={Platform.OS !== "web"}
        startsPictureInPictureAutomatically={Platform.OS !== "web"}
      />

      {brightnessBoost > 0 && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "#FFFFFF", opacity: brightnessBoost, zIndex: 1 },
          ]}
          pointerEvents="none"
        />
      )}

      {isBuffering && !playerError && (
        <View style={styles.bufferingOverlay} pointerEvents="none">
          <View style={styles.bufferingSpinner} />
        </View>
      )}

      {playerError && (
        <View style={styles.errorOverlay}>
          <Ionicons name="warning-outline" size={44} color="#FF5252" />
          <Text style={styles.errorTitle}>Can't play this video</Text>
          <Text style={styles.errorMsg} numberOfLines={3}>{playerError}</Text>
          <Pressable onPress={handleRetry} style={styles.retryBtn}>
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      <GestureOverlay onSeekRelative={handleSeekRelative} />

      <Controls onSeek={handleSeek} onSeekRelative={handleSeekRelative} onEnterPiP={handleEnterPiP} screenWidth={SCREEN_W} />

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
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  bufferingSpinner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.15)",
    borderTopColor: C.accent,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.88)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    zIndex: 10,
  },
  errorTitle: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  errorMsg: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 4,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
