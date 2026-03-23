import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import type { VideoItem } from "@/context/PlayerContext";
import { formatTime } from "@/utils/format";

const C = Colors.dark;

type Props = {
  video: VideoItem;
  onPress: () => void;
  onDelete: () => void;
  isActive: boolean;
};

export function VideoCard({ video, onPress, onDelete, isActive }: Props) {
  const [showActions, setShowActions] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const handleLongPress = () => {
    setShowActions(!showActions);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  const qualityBadge = video.duration && video.duration > 3600 ? "FHD" : video.duration && video.duration > 60 ? "HD" : "SD";

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, isActive && styles.cardActive]}
      >
        <View style={styles.thumbnail}>
          <View style={styles.thumbBg}>
            <Ionicons name="film-outline" size={28} color="rgba(255,255,255,0.2)" />
          </View>
          {video.duration ? (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{formatTime(video.duration)}</Text>
            </View>
          ) : null}
          <View style={styles.qualityBadge}>
            <Text style={styles.qualityText}>{qualityBadge}</Text>
          </View>
          {isActive && (
            <View style={styles.activeDot}>
              <View style={styles.activeDotInner} />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={[styles.title, isActive && styles.titleActive]} numberOfLines={2}>
            {video.title}
          </Text>
          <View style={styles.meta}>
            {video.chapters && video.chapters.length > 0 ? (
              <View style={styles.metaTag}>
                <Ionicons name="list-outline" size={10} color={C.textMuted} />
                <Text style={styles.metaTagText}>{video.chapters.length} chapters</Text>
              </View>
            ) : null}
            <Text style={styles.metaDate}>
              {new Date(video.addedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {showActions ? (
            <Pressable
              onPress={() => { onDelete(); setShowActions(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={16} color={C.accent} />
            </Pressable>
          ) : (
            <Ionicons name="ellipsis-vertical" size={16} color={C.textMuted} />
          )}
        </View>
      </Pressable>
    </Animated.View>
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
  qualityBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: C.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  qualityText: {
    color: C.text,
    fontSize: 8,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
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
  actions: {
    paddingLeft: 4,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: C.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
