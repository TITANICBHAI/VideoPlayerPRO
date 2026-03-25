import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddVideoModal } from "@/components/AddVideoModal";
import { VideoCard } from "@/components/VideoCard";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

export default function HomeScreen() {
  const { videos, deviceVideos, playVideo, removeVideo, state, watchProgress, refreshDeviceVideos, pendingShareUrl } = usePlayer();
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const appState = useRef(AppState.currentState);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        refreshDeviceVideos();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [refreshDeviceVideos]);

  useEffect(() => {
    if (pendingShareUrl) {
      setShowAddModal(true);
    }
  }, [pendingShareUrl]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshDeviceVideos();
    setRefreshing(false);
  }, [refreshDeviceVideos]);

  const allVideos = useMemo(() => {
    const urlVideoIds = new Set(videos.map((v) => v.id));
    const filteredDevice = deviceVideos.filter((d) => !urlVideoIds.has(d.id));
    return [...videos, ...filteredDevice];
  }, [videos, deviceVideos]);

  const sorted = useMemo(() => {
    const filtered = searchQuery.trim()
      ? allVideos.filter((v) => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : [...allVideos];
    return filtered.sort((a, b) => b.addedAt - a.addedAt);
  }, [allVideos, searchQuery]);

  const watchedCount = useMemo(
    () => Object.values(watchProgress).filter((p) => p.completed).length,
    [watchProgress]
  );

  const handlePlay = (video: typeof videos[0]) => {
    playVideo(video);
    router.push("/player");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[{ flex: 1, backgroundColor: C.background }, { paddingTop: topPad }]}>
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <View style={styles.headerTop}>
          <View style={styles.logoArea}>
            <View style={[styles.logoIcon, { backgroundColor: C.accent }]}>
              <Ionicons name="play" size={12} color="#fff" />
            </View>
            <View>
              <Text style={[styles.logoText, { color: C.text }]}>VideoPlayer</Text>
              <Text style={[styles.logoSub, { color: C.textMuted }]}>Your private library</Text>
            </View>
            <View style={[styles.logoBadge, { backgroundColor: C.accentSoft, borderColor: "rgba(255,0,51,0.35)" }]}>
              <Text style={[styles.logoBadgeText, { color: C.accent }]}>PRO</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={({ pressed }) => [styles.addBtn, { backgroundColor: C.accent }, pressed && styles.addBtnPressed]}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
            <Ionicons name="search" size={15} color={C.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: C.text }]}
              placeholder="Search videos..."
              placeholderTextColor={C.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={C.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
            <Ionicons name="film" size={11} color={C.accent} />
            <Text style={[styles.statText, { color: C.textSecondary }]}>{videos.length} videos</Text>
          </View>
          {deviceVideos.length > 0 && (
            <View style={[styles.statChip, { backgroundColor: "rgba(100,181,246,0.08)", borderColor: "rgba(100,181,246,0.25)" }]}>
              <Ionicons name="phone-portrait" size={11} color="#64B5F6" />
              <Text style={[styles.statText, { color: "#64B5F6" }]}>{deviceVideos.length} on device</Text>
            </View>
          )}
          {watchedCount > 0 && (
            <View style={[styles.statChip, { backgroundColor: "rgba(76,175,80,0.08)", borderColor: "rgba(76,175,80,0.25)" }]}>
              <Ionicons name="checkmark-circle" size={11} color="#4CAF50" />
              <Text style={[styles.statText, { color: "#4CAF50" }]}>{watchedCount} watched</Text>
            </View>
          )}
          {state.currentVideo && (
            <Pressable
              onPress={() => router.push("/player")}
              style={[styles.nowPlayingChip, { backgroundColor: C.accentSoft, borderColor: "rgba(255,0,51,0.4)" }]}
            >
              <View style={[styles.nowPlayingDot, { backgroundColor: C.accent }]} />
              <Text style={[styles.nowPlayingChipText, { color: C.accent }]} numberOfLines={1}>
                {state.currentVideo.title}
              </Text>
              <Ionicons name="chevron-forward" size={11} color={C.accent} />
            </Pressable>
          )}
        </View>

      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={C.accent}
            colors={[C.accent]}
          />
        }
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            progress={watchProgress[item.id]}
            onPress={() => handlePlay(item)}
            onDelete={() => removeVideo(item.id)}
            isActive={state.currentVideo?.id === item.id}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
              <Ionicons name="film-outline" size={40} color={C.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: C.text }]}>No videos found</Text>
            <Text style={[styles.emptySubtitle, { color: C.textMuted }]}>
              {searchQuery ? "Try a different search term" : "Tap + to add your first video URL"}
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.list,
          sorted.length === 0 && styles.listEmpty,
          { paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
      />

      <AddVideoModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
    paddingTop: 6,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
    lineHeight: 20,
  },
  logoSub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    lineHeight: 13,
  },
  logoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  logoBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  addBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },
  searchRow: {},
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  nowPlayingChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  nowPlayingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nowPlayingChipText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    paddingTop: 10,
  },
  listEmpty: {
    flex: 1,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
