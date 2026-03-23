import React, { useCallback, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import Colors from "@/constants/colors";
import { usePlayer } from "@/context/PlayerContext";
import type { Chapter } from "@/context/PlayerContext";
import { formatTime } from "@/utils/format";

const C = Colors.dark;

type Props = {
  onSeek: (time: number) => void;
};

export function ProgressBar({ onSeek }: Props) {
  const { state } = usePlayer();
  const { currentTime, duration, buffered, isFullscreen } = state;
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const barRef = useRef<View>(null);
  const barX = useRef(0);
  const barW = useRef(1);
  const thumbScale = useSharedValue(1);

  const chapters: Chapter[] = state.currentVideo?.chapters ?? [];

  const progress = duration > 0 ? (isDragging ? dragTime : currentTime) / duration : 0;
  const bufferProgress = duration > 0 ? buffered / duration : 0;

  const onLayout = useCallback(() => {
    barRef.current?.measure((_x, _y, width, _h, pageX) => {
      barX.current = pageX;
      barW.current = width;
    });
  }, []);

  const getTimeFromX = (x: number) => {
    const ratio = Math.max(0, Math.min(1, (x - barX.current) / barW.current));
    return ratio * duration;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setIsDragging(true);
        thumbScale.value = withSpring(1.4);
        const t = getTimeFromX(e.nativeEvent.pageX);
        setDragTime(t);
      },
      onPanResponderMove: (e) => {
        const t = getTimeFromX(e.nativeEvent.pageX);
        setDragTime(t);
      },
      onPanResponderRelease: (e) => {
        const t = getTimeFromX(e.nativeEvent.pageX);
        onSeek(t);
        setIsDragging(false);
        thumbScale.value = withSpring(1);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        thumbScale.value = withSpring(1);
      },
    })
  ).current;

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thumbScale.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.timesRow}>
        <Text style={styles.timeText}>
          {formatTime(isDragging ? dragTime : currentTime)}
        </Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View
        ref={barRef}
        onLayout={onLayout}
        style={[styles.track, isFullscreen && styles.trackFullscreen]}
        {...panResponder.panHandlers}
      >
        <View style={styles.trackBg}>
          <View style={[styles.bufferFill, { width: `${bufferProgress * 100}%` }]} />
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]}>
            <Animated.View style={[styles.thumb, thumbStyle]} />
          </View>
        </View>

        {chapters.length > 0 &&
          chapters.map((ch, i) => {
            const pos = duration > 0 ? ch.startTime / duration : 0;
            if (pos <= 0 || pos >= 1) return null;
            return (
              <View
                key={i}
                style={[styles.chapterMark, { left: `${pos * 100}%` as any }]}
              />
            );
          })}
      </View>

      {isDragging && chapters.length > 0 && (() => {
        const t = dragTime;
        const ch = [...chapters].reverse().find((c) => c.startTime <= t);
        if (!ch) return null;
        return (
          <View style={styles.chapterTooltip}>
            <Text style={styles.chapterTooltipText}>{ch.title}</Text>
          </View>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: 16,
  },
  timesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  timeText: {
    color: C.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  track: {
    height: 28,
    justifyContent: "center",
  },
  trackFullscreen: {
    height: 36,
  },
  trackBg: {
    height: 3,
    backgroundColor: C.track,
    borderRadius: 2,
    overflow: "visible",
    position: "relative",
  },
  bufferFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: C.buffer,
    borderRadius: 2,
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: C.accent,
    borderRadius: 2,
    alignItems: "flex-end",
    justifyContent: "center",
    overflow: "visible",
  },
  thumb: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: C.scrubber,
    position: "absolute",
    right: -6.5,
    elevation: 4,
  },
  chapterMark: {
    position: "absolute",
    width: 2,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 1,
    top: -1.5,
  },
  chapterTooltip: {
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: C.surfaceGlass,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  chapterTooltipText: {
    color: C.text,
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
});
