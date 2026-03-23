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
            style={styles.backBtn}
          >
            <Ionicons name="chevron-down" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.nowPlaying}>Now Playing</Text>
          <View style={{ width: 36 }} />
        </View>
      )}

      <VideoPlayer />

      {!state.isFullscreen && (
        <ScrollView style={styles.below} contentContainerStyle={styles.belowContent} showsVerticalScrollIndicator={false}>
          {state.currentVideo && (
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>{state.currentVideo.title}</Text>
              {state.currentVideo.duration && (
                <Text style={styles.videoDuration}>{formatTime(state.currentVideo.duration)}</Text>
              )}
            </View>
          )}

          {chapters.length > 0 && (
            <View style={styles.chaptersSection}>
              <Text style={styles.sectionTitle}>Chapters</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: C.controlBg,
    alignItems: "center",
    justifyContent: "center",
  },
  nowPlaying: {
    flex: 1,
    textAlign: "center",
    color: C.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  below: {
    flex: 1,
  },
  belowContent: {
    paddingBottom: 40,
  },
  videoInfo: {
    padding: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  videoTitle: {
    flex: 1,
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    lineHeight: 22,
  },
  videoDuration: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flexShrink: 0,
    marginTop: 2,
  },
  chaptersSection: {
    marginTop: 4,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: C.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  chapterItemPressed: {
    opacity: 0.7,
  },
  chapterNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
