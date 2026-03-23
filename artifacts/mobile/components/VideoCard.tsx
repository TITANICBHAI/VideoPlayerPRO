import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useRef } from "react";
import {
  Animated,
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

function renderRightActions(onDelete: () => void) {
  return (
    <Pressable
      onPress={() => {
        onDelete();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }}
      style={styles.swipeDeleteBtn}
    >
      <Ionicons name="trash-outline" size={20} color="#fff" />
      <Text style={styles.swipeDeleteText}>Delete</Text>
    </Pressable>
  );
}

export function VideoCard({ video, progress, onPress, onDelete, isActive }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const swipeableRef = useRef<Swipeable>(null);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  const progressPercent =
    progress && progress.duration > 0
      ? Math.min(1, progress.position / progress.duration)
      : 0;

  const thumbnailUri = video.thumbnail ?? null;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => renderRightActions(() => {
        swipeableRef.current?.close();
        onDelete();
      })}
      overshootRight={false}
      friction={2}
      rightThreshold={60}
    >
      <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.card, isActive && styles.cardActive]}
        >
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
                <Ionicons name="film-outline" size={28} color="rgba(255,255,255,0.2)" />
              </View>
            )}

            {video.duration ? (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{formatTime(video.duration)}</Text>
              </View>
            ) : null}

            {isActive && (
              <View style={styles.activeDot}>
                <View style={styles.activeDotInner} />
              </View>
            )}

            {progress?.completed && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark" size={9} color="#fff" />
              </View>
            )}

            {progressPercent > 0 && !progress?.completed && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercent * 100}%` as any }]} />
              </View>
            )}
          </View>

          <View style={styles.info}>
            <Text style={[styles.title, isActive && styles.titleActive]} numberOfLines={2}>
              {video.title}
            </Text>
            <View style={styles.meta}>
              {video.isDeviceVideo && (
                <View style={[styles.metaTag, styles.metaTagDevice]}>
                  <Ionicons name="phone-portrait-outline" size={10} color="#64B5F6" />
                  <Text style={[styles.metaTagText, { color: "#64B5F6" }]}>On Device</Text>
                </View>
              )}
              {video.chapters && video.chapters.length > 0 ? (
                <View style={styles.metaTag}>
                  <Ionicons name="list-outline" size={10} color={C.textMuted} />
                  <Text style={styles.metaTagText}>{video.chapters.length} chapters</Text>
                </View>
              ) : null}
              {progress && !progress.completed && progressPercent > 0 ? (
                <View style={[styles.metaTag, styles.metaTagResume]}>
                  <Ionicons name="play-outline" size={10} color={C.accent} />
                  <Text style={[styles.metaTagText, { color: C.accent }]}>
                    {formatTime(progress.position)} left
                  </Text>
                </View>
              ) : null}
              <Text style={styles.metaDate}>
                {new Date(video.addedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.chevron}>
            <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
          </View>
        </Pressable>
      </Animated.View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardActive: {
    borderColor: C.accent,
    backgroundColor: C.accentSoft,
  },
  thumbnail: {
    width: 100,
    height: 62,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
  },
  thumbBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: C.text,
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
  },
  activeDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,0,51,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  activeDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.accent,
  },
  completedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressFill: {
    height: 3,
    backgroundColor: C.accent,
    borderRadius: 2,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: C.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
  },
  titleActive: {
    color: C.accent,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  metaTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: C.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaTagResume: {
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accent,
  },
  metaTagDevice: {
    backgroundColor: "rgba(100, 181, 246, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(100, 181, 246, 0.4)",
  },
  metaTagText: {
    color: C.textMuted,
    fontSize: 9,
    fontFamily: "Inter_500Medium",
  },
  metaDate: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  chevron: {
    paddingLeft: 4,
  },
  swipeDeleteBtn: {
    width: 80,
    marginVertical: 4,
    marginRight: 16,
    backgroundColor: "#E53935",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  swipeDeleteText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
