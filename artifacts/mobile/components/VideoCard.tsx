import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import Colors from "@/constants/colors";
import type { VideoItem, WatchProgress } from "@/context/PlayerContext";
import { formatTime } from "@/utils/format";

const C = Colors.dark;

type Props = {
  video: VideoItem;
  progress?: WatchProgress;
  onPress: () => void;
  onDelete: () => void;
  isActive: boolean;
};

function confirmDelete(title: string, onDelete: () => void) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  Alert.alert(
    "Delete Video",
    `Remove "${title}" from your library?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          onDelete();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ],
    { cancelable: true }
  );
}

function RightActions({ onDelete }: { onDelete: () => void }) {
  return (
    <Pressable onPress={onDelete} style={styles.swipeDeleteBtn}>
      <View style={styles.swipeDeleteIcon}>
        <Ionicons name="trash" size={18} color="#fff" />
      </View>
      <Text style={styles.swipeDeleteText}>Delete</Text>
    </Pressable>
  );
}

export const VideoCard = React.memo(function VideoCard({ video, progress, onPress, onDelete, isActive }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const swipeableRef = useRef<Swipeable>(null);

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  const handleLongPress = () => confirmDelete(video.title, onDelete);
  const handleMenuPress = () => confirmDelete(video.title, onDelete);
  const handleSwipeDelete = () => {
    swipeableRef.current?.close();
    confirmDelete(video.title, onDelete);
  };

  const progressPercent =
    progress && progress.duration > 0
      ? Math.min(1, progress.position / progress.duration)
      : 0;

  const thumbnailUri = video.thumbnail ?? null;

  const dateStr = (() => {
    const d = new Date(video.addedAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  })();

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => <RightActions onDelete={handleSwipeDelete} />}
      overshootRight={false}
      friction={2}
      rightThreshold={60}
    >
      <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
        <Pressable
          onPress={onPress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          delayLongPress={450}
          style={[styles.card, isActive && styles.cardActive]}
        >
          {/* Thumbnail */}
          <View style={styles.thumbnail}>
            {thumbnailUri ? (
              <Image
                source={{ uri: thumbnailUri }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.thumbBg}>
                <Ionicons name="film" size={26} color="rgba(255,255,255,0.12)" />
              </View>
            )}

            {/* Gradient overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.thumbGradient}
            />

            {/* Play / active overlay */}
            {isActive ? (
              <View style={styles.activeOverlay}>
                <View style={styles.activeRing}>
                  <Ionicons name="pause" size={14} color={C.accent} />
                </View>
              </View>
            ) : (
              <View style={styles.playOverlay}>
                <Ionicons name="play" size={13} color="rgba(255,255,255,0.7)" />
              </View>
            )}

            {/* Duration */}
            {video.duration ? (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{formatTime(video.duration)}</Text>
              </View>
            ) : null}

            {/* Completed */}
            {progress?.completed && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark" size={9} color="#fff" />
              </View>
            )}

            {/* Progress bar */}
            {progressPercent > 0 && !progress?.completed && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercent * 100}%` as any }]} />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={[styles.title, isActive && styles.titleActive]} numberOfLines={2}>
              {video.title}
            </Text>

            <View style={styles.tags}>
              {video.isDeviceVideo && (
                <View style={[styles.tag, styles.tagDevice]}>
                  <Ionicons name="phone-portrait" size={9} color="#64B5F6" />
                  <Text style={[styles.tagText, { color: "#64B5F6" }]}>Device</Text>
                </View>
              )}
              {video.chapters && video.chapters.length > 0 && (
                <View style={styles.tag}>
                  <Ionicons name="list" size={9} color={C.textMuted} />
                  <Text style={styles.tagText}>{video.chapters.length} ch</Text>
                </View>
              )}
              {progress && !progress.completed && progressPercent > 0 && (
                <View style={[styles.tag, styles.tagResume]}>
                  <Ionicons name="play" size={9} color={C.accent} />
                  <Text style={[styles.tagText, { color: C.accent }]}>
                    Resume · {formatTime(progress.position)}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.metaDate}>{dateStr}</Text>
          </View>

          {/* Menu */}
          <Pressable
            onPress={handleMenuPress}
            hitSlop={8}
            style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.4 }]}
          >
            <Ionicons name="ellipsis-vertical" size={15} color={C.textMuted} />
          </Pressable>
        </Pressable>
      </Animated.View>
    </Swipeable>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 14,
    marginVertical: 3,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardActive: {
    borderColor: C.accent,
    backgroundColor: "rgba(255,0,51,0.07)",
  },
  thumbnail: {
    width: 108,
    height: 68,
    borderRadius: 10,
    overflow: "hidden",
    flexShrink: 0,
    backgroundColor: C.surfaceElevated,
  },
  thumbBg: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  playOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -14 }, { translateY: -14 }],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  activeOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -14 }, { translateY: -14 }],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  activeRing: {
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  durationText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
  },
  completedBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  progressFill: {
    height: 3,
    backgroundColor: C.accent,
    borderRadius: 2,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: C.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  titleActive: {
    color: C.accent,
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  tagResume: {
    backgroundColor: C.accentSoft,
    borderColor: "rgba(255,0,51,0.35)",
  },
  tagDevice: {
    backgroundColor: "rgba(100,181,246,0.1)",
    borderColor: "rgba(100,181,246,0.35)",
  },
  tagText: {
    color: C.textMuted,
    fontSize: 9,
    fontFamily: "Inter_500Medium",
  },
  metaDate: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  menuBtn: {
    paddingHorizontal: 4,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeDeleteBtn: {
    width: 78,
    marginVertical: 3,
    marginRight: 14,
    backgroundColor: "#C62828",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  swipeDeleteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  swipeDeleteText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
