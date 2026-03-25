import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { usePlayer } from "@/context/PlayerContext";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { formatTime } from "@/utils/format";

const C = Colors.dark;

export default function PlayerScreen() {
  const { state } = usePlayer();
  const insets = useSafeAreaInsets();

  const chapters = state.currentVideo?.chapters ?? [];
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.container, { paddingTop: state.isFullscreen ? 0 : topPad }]}>
      {!state.isFullscreen && (
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              router.back();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="chevron-down" size={20} color={C.text} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
            {state.currentVideo && (
              <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                {state.currentVideo.title}
              </Text>
            )}
          </View>
          <View style={{ width: 36 }} />
        </View>
      )}

      <VideoPlayer />

      {!state.isFullscreen && (
        <ScrollView style={styles.below} contentContainerStyle={styles.belowContent} showsVerticalScrollIndicator={false}>
          {state.currentVideo && (
            <View style={styles.videoInfo}>
              <View style={styles.videoInfoLeft}>
                <Text style={styles.videoTitle}>{state.currentVideo.title}</Text>
                <View style={styles.videoMeta}>
                  {state.currentVideo.isDeviceVideo ? (
                    <View style={[styles.sourceChip, styles.sourceChipDevice]}>
                      <Ionicons name="phone-portrait" size={10} color="#64B5F6" />
                      <Text style={[styles.sourceChipText, { color: "#64B5F6" }]}>On Device</Text>
                    </View>
                  ) : (
                    <View style={[styles.sourceChip, styles.sourceChipUrl]}>
                      <Ionicons name="link" size={10} color={C.textMuted} />
                      <Text style={styles.sourceChipText}>URL Stream</Text>
                    </View>
                  )}
                  {state.currentVideo.duration ? (
                    <View style={styles.durationRow}>
                      <Ionicons name="time-outline" size={11} color={C.textMuted} />
                      <Text style={styles.videoDuration}>{formatTime(state.currentVideo.duration)}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          )}

          {chapters.length > 0 && (
            <View style={styles.chaptersSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Chapters</Text>
                <Text style={styles.sectionCount}>{chapters.length}</Text>
              </View>
              {chapters.map((ch, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [styles.chapterItem, pressed && styles.chapterItemPressed]}
                  onPress={() => {}}
                >
                  <View style={[styles.chapterNum, state.currentTime >= ch.startTime && styles.chapterNumActive]}>
                    <Text style={[styles.chapterNumText, state.currentTime >= ch.startTime && styles.chapterNumTextActive]}>
                      {i + 1}
                    </Text>
                  </View>
                  <View style={styles.chapterInfo}>
                    <Text style={[styles.chapterTitle, state.currentTime >= ch.startTime && styles.chapterTitleActive]}>
                      {ch.title}
                    </Text>
                    <Text style={styles.chapterTime}>{formatTime(ch.startTime)}</Text>
                  </View>
                  <Ionicons
                    name={state.currentTime >= ch.startTime ? "checkmark-circle" : "play-circle-outline"}
                    size={18}
                    color={state.currentTime >= ch.startTime ? C.accent : C.textMuted}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
    gap: 1,
  },
  nowPlayingLabel: {
    color: C.textMuted,
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
  },
  nowPlayingTitle: {
    color: C.text,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.1,
  },
  below: {
    flex: 1,
  },
  belowContent: {
    paddingBottom: 40,
  },
  videoInfo: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  videoInfoLeft: {
    gap: 7,
  },
  videoTitle: {
    color: C.text,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    lineHeight: 23,
    letterSpacing: -0.4,
  },
  videoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sourceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  sourceChipUrl: {
    backgroundColor: C.surfaceElevated,
    borderColor: C.border,
  },
  sourceChipDevice: {
    backgroundColor: "rgba(100,181,246,0.1)",
    borderColor: "rgba(100,181,246,0.3)",
  },
  sourceChipText: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  videoDuration: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  chaptersSection: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: C.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionCount: {
    backgroundColor: C.surfaceElevated,
    color: C.textMuted,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  chapterItemPressed: {
    opacity: 0.6,
  },
  chapterNum: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: C.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  chapterNumActive: {
    backgroundColor: C.accentSoft,
    borderColor: C.accent,
  },
  chapterNumText: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  chapterNumTextActive: {
    color: C.accent,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    color: C.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  chapterTitleActive: {
    color: C.text,
    fontFamily: "Inter_600SemiBold",
  },
  chapterTime: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
});
