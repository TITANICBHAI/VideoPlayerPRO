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
  ScrollView,
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

type SortOption = "recent" | "oldest" | "az" | "za" | "longest" | "shortest" | "last-watched";

const SORT_OPTIONS: { key: SortOption; label: string; icon: string }[] = [
  { key: "recent", label: "Recent", icon: "time-outline" },
  { key: "oldest", label: "Oldest", icon: "calendar-outline" },
  { key: "az", label: "A–Z", icon: "text-outline" },
  { key: "za", label: "Z–A", icon: "text-outline" },
  { key: "longest", label: "Longest", icon: "film-outline" },
  { key: "shortest", label: "Shortest", icon: "timer-outline" },
  { key: "last-watched", label: "Last Watched", icon: "eye-outline" },
];

export default function HomeScreen() {
  const { videos, deviceVideos, playVideo, removeVideo, state, watchProgress, refreshDeviceVideos, pendingShareUrl } = usePlayer();
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
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

    const copy = [...filtered];
    switch (sortBy) {
      case "recent":
        return copy.sort((a, b) => b.addedAt - a.addedAt);
      case "oldest":
        return copy.sort((a, b) => a.addedAt - b.addedAt);
      case "az":
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case "za":
        return copy.sort((a, b) => b.title.localeCompare(a.title));
      case "longest":
        return copy.sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0));
      case "shortest":
        return copy.sort((a, b) => (a.duration ?? Infinity) - (b.duration ?? Infinity));
      case "last-watched":
        return copy.sort((a, b) => {
          const pa = watchProgress[a.id]?.lastWatched ?? 0;
          const pb = watchProgress[b.id]?.lastWatched ?? 0;
          return pb - pa;
        });
      default:
        return copy;
    }
  }, [allVideos, searchQuery, sortBy, watchProgress]);

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
            <View style={[styles.logoDot, { backgroundColor: C.accent }]} />
            <Text style={[styles.logoText, { color: C.text }]}>VideoPlayer</Text>
            <View style={[styles.logoBadge, { backgroundColor: C.accent }]}>
              <Text style={styles.logoBadgeText}>PRO</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={({ pressed }) => [styles.addBtn, { backgroundColor: C.accent }, pressed && styles.addBtnPressed]}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
            <Ionicons name="search" size={16} color={C.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: C.text }]}
              placeholder="Search videos..."
              placeholderTextColor={C.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={16} color={C.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
            <Ionicons name="library-outline" size={12} color={C.accent} />
            <Text style={[styles.statText, { color: C.textSecondary }]}>{videos.length} videos</Text>
          </View>
          {deviceVideos.length > 0 && (
            <View style={[styles.statChip, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
              <Ionicons name="phone-portrait-outline" size={12} color="#64B5F6" />
              <Text style={[styles.statText, { color: "#64B5F6" }]}>{deviceVideos.length} on device</Text>
            </View>
          )}
          {watchedCount > 0 && (
            <View style={[styles.statChip, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
              <Ionicons name="checkmark-circle-outline" size={12} color="#4CAF50" />
              <Text style={[styles.statText, { color: "#4CAF50" }]}>{watchedCount} watched</Text>
            </View>
          )}
          {state.currentVideo && (
            <Pressable
              onPress={() => router.push("/player")}
              style={[styles.nowPlayingChip, { backgroundColor: C.accentSoft, borderColor: C.accent }]}
            >
              <View style={[styles.nowPlayingDot, { backgroundColor: C.accent }]} />
              <Text style={[styles.nowPlayingChipText, { color: C.accent }]} numberOfLines={1}>
                {state.currentVideo.title}
              </Text>
              <Ionicons name="chevron-forward" size={12} color={C.accent} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}
        >
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => {
                setSortBy(opt.key);
                Haptics.selectionAsync();
              }}
              style={[
                styles.sortChip,
                { backgroundColor: C.surfaceElevated, borderColor: C.border },
                sortBy === opt.key && { backgroundColor: C.accentSoft, borderColor: C.accent },
              ]}
            >
              <Ionicons
                name={opt.icon as any}
                size={11}
                color={sortBy === opt.key ? C.accent : C.textMuted}
              />
              <Text style={[
                styles.sortChipText,
                { color: C.textMuted },
                sortBy === opt.key && { color: C.accent, fontFamily: "Inter_600SemiBold" },
              ]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 10,
    paddingTop: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logoText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  logoBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logoBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  searchRow: {},
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    gap: 8,
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
  sortRow: {
    gap: 6,
    paddingRight: 4,
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
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
