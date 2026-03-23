import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { usePlayer } from "@/context/PlayerContext";
import type { PlaybackSpeed, VideoQuality } from "@/context/PlayerContext";

const C = Colors.dark;

type Page =
  | "main"
  | "speed"
  | "quality"
  | "captions"
  | "audio"
  | "subtitles"
  | "sleep"
  | "fitMode";

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];
const QUALITIES: VideoQuality[] = ["Auto", "144p", "240p", "360p", "480p", "720p", "1080p", "4K"];
const SLEEP_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90];

type RowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  chevron?: boolean;
};

function Row({ icon, title, subtitle, onPress, right, chevron }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {right}
      {chevron ? <Ionicons name="chevron-forward" size={16} color={C.textMuted} style={{ marginLeft: 4 }} /> : null}
    </Pressable>
  );
}

function OptionRow({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.optionRow, active && styles.optionRowActive, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, active && styles.optionTextActive]}>{label}</Text>
      {active && <Ionicons name="checkmark" size={18} color={C.accent} />}
    </Pressable>
  );
}

export function SettingsSheet() {
  const {
    state,
    setPlaybackRate,
    setQuality,
    setFitMode,
    toggleCaptions,
    toggleAmbientMode,
    toggleTheaterMode,
    toggleSettings,
    toggleStatsForNerds,
    toggleAudioNormalization,
    toggleBackgroundPlayback,
    setAudioTrack,
    setSubtitleTrack,
    setSleepTimer,
  } = usePlayer();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState<Page>("main");

  const handleClose = () => {
    setPage("main");
    toggleSettings();
  };

  const handleStatsForNerds = () => {
    handleClose();
    setTimeout(() => toggleStatsForNerds(), 300);
  };

  const pageTitle: Record<Page, string> = {
    main: "Settings",
    speed: "Playback Speed",
    quality: "Quality",
    captions: "Captions",
    audio: "Audio Track",
    subtitles: "Subtitles",
    sleep: "Sleep Timer",
    fitMode: "Screen Fit",
  };

  const activeAudioLabel =
    state.audioTracks.find((t) => t.id === state.activeAudioTrack)?.label ?? "English";

  const activeSubLabel = state.activeSubtitleTrack
    ? state.subtitleTracks.find((t) => t?.id === state.activeSubtitleTrack)?.label ?? "Off"
    : "Off";

  const sleepLabel =
    state.sleepTimerMinutes !== null
      ? `${state.sleepTimerMinutes} min`
      : "Off";

  return (
    <Modal
      visible={state.showSettings}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          {page !== "main" && (
            <Pressable onPress={() => setPage("main")} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={C.text} />
            </Pressable>
          )}
          <Text style={styles.headerTitle}>{pageTitle[page]}</Text>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={C.textSecondary} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {page === "main" && (
            <View style={styles.section}>
              <Row
                icon={<Ionicons name="speedometer-outline" size={20} color={C.accent} />}
                title="Playback Speed"
                subtitle={state.playbackRate === 1 ? "Normal" : `${state.playbackRate}x`}
                onPress={() => setPage("speed")}
                chevron
              />
              <Row
                icon={<Ionicons name="layers-outline" size={20} color="#4FC3F7" />}
                title="Quality"
                subtitle={state.quality}
                onPress={() => setPage("quality")}
                chevron
              />
              <Row
                icon={<Ionicons name="resize-outline" size={20} color="#80DEEA" />}
                title="Screen Fit"
                subtitle={state.fitMode === "contain" ? "Contain (letterbox)" : "Fill (crop)"}
                onPress={() => setPage("fitMode")}
                chevron
              />

              <View style={styles.divider} />

              <Row
                icon={<Ionicons name="musical-notes-outline" size={20} color="#FFCC80" />}
                title="Audio Track"
                subtitle={activeAudioLabel}
                onPress={() => setPage("audio")}
                chevron
              />
              <Row
                icon={<Ionicons name="text-outline" size={20} color="#A5D6A7" />}
                title="Subtitles"
                subtitle={activeSubLabel}
                onPress={() => setPage("subtitles")}
                chevron
              />

              <View style={styles.divider} />

              <Row
                icon={<MaterialCommunityIcons name="shimmer" size={20} color="#FFD54F" />}
                title="Ambient Mode"
                subtitle="Dynamic glow behind video"
                right={
                  <Switch
                    value={state.ambientMode}
                    onValueChange={toggleAmbientMode}
                    trackColor={{ false: C.border, true: C.accentSoft }}
                    thumbColor={state.ambientMode ? C.accent : C.textMuted}
                  />
                }
              />
              <Row
                icon={<Ionicons name="tv-outline" size={20} color="#CE93D8" />}
                title="Theater Mode"
                subtitle="Expanded player view"
                right={
                  <Switch
                    value={state.isTheaterMode}
                    onValueChange={toggleTheaterMode}
                    trackColor={{ false: C.border, true: C.accentSoft }}
                    thumbColor={state.isTheaterMode ? C.accent : C.textMuted}
                  />
                }
              />
              <Row
                icon={<Ionicons name="volume-medium-outline" size={20} color="#EF9A9A" />}
                title="Audio Normalization"
                subtitle="Stable volume (VLC-style)"
                right={
                  <Switch
                    value={state.audioNormalization}
                    onValueChange={toggleAudioNormalization}
                    trackColor={{ false: C.border, true: C.accentSoft }}
                    thumbColor={state.audioNormalization ? C.accent : C.textMuted}
                  />
                }
              />
              <Row
                icon={<Ionicons name="play-skip-forward-outline" size={20} color="#80CBC4" />}
                title="Background Playback"
                subtitle="Audio continues when minimized"
                right={
                  <Switch
                    value={state.backgroundPlayback}
                    onValueChange={toggleBackgroundPlayback}
                    trackColor={{ false: C.border, true: C.accentSoft }}
                    thumbColor={state.backgroundPlayback ? C.accent : C.textMuted}
                  />
                }
              />

              <View style={styles.divider} />

              <Row
                icon={<Ionicons name="moon-outline" size={20} color="#CE93D8" />}
                title="Sleep Timer"
                subtitle={sleepLabel}
                onPress={() => setPage("sleep")}
                chevron
              />
              <Row
                icon={<Ionicons name="stats-chart-outline" size={20} color="#80DEEA" />}
                title="Stats for Nerds"
                subtitle="Technical playback details"
                onPress={handleStatsForNerds}
                chevron
              />
            </View>
          )}

          {page === "speed" && (
            <View style={styles.section}>
              {SPEEDS.map((speed) => (
                <OptionRow
                  key={speed}
                  label={speed === 1 ? "Normal (1x)" : speed >= 3 ? `${speed}x — Ultra Fast` : `${speed}x`}
                  active={state.playbackRate === speed}
                  onPress={() => {
                    setPlaybackRate(speed);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPage("main");
                  }}
                />
              ))}
            </View>
          )}

          {page === "quality" && (
            <View style={styles.section}>
              {QUALITIES.map((q) => (
                <OptionRow
                  key={q}
                  label={q === "Auto" ? "Auto (Recommended)" : q === "1080p" ? "1080p HD" : q === "4K" ? "4K Ultra HD" : q}
                  active={state.quality === q}
                  onPress={() => {
                    setQuality(q);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPage("main");
                  }}
                />
              ))}
            </View>
          )}

          {page === "fitMode" && (
            <View style={styles.section}>
              <OptionRow
                label="Contain (letterbox)"
                active={state.fitMode === "contain"}
                onPress={() => { setFitMode("contain"); setPage("main"); }}
              />
              <OptionRow
                label="Fill / Cover (crop to fill)"
                active={state.fitMode === "cover"}
                onPress={() => { setFitMode("cover"); setPage("main"); }}
              />
              <View style={styles.note}>
                <Ionicons name="information-circle-outline" size={14} color={C.textMuted} />
                <Text style={styles.noteText}>
                  You can also pinch-to-zoom on the video to temporarily fill the screen.
                </Text>
              </View>
            </View>
          )}

          {page === "audio" && (
            <View style={styles.section}>
              <View style={styles.trackNote}>
                <Ionicons name="musical-notes-outline" size={14} color={C.textMuted} />
                <Text style={styles.noteText}>
                  Multi-track audio is available for MKV, AVI files with embedded language tracks.
                </Text>
              </View>
              {state.audioTracks.map((track) => (
                <OptionRow
                  key={track.id}
                  label={`${track.label} (${track.language.toUpperCase()})`}
                  active={state.activeAudioTrack === track.id}
                  onPress={() => {
                    setAudioTrack(track.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPage("main");
                  }}
                />
              ))}
            </View>
          )}

          {page === "subtitles" && (
            <View style={styles.section}>
              <OptionRow
                label="Off"
                active={state.activeSubtitleTrack === null}
                onPress={() => {
                  setSubtitleTrack(null);
                  setPage("main");
                }}
              />
              {state.subtitleTracks.filter(Boolean).map((track) =>
                track ? (
                  <OptionRow
                    key={track.id}
                    label={`${track.label} (${track.language.toUpperCase()})`}
                    active={state.activeSubtitleTrack === track.id}
                    onPress={() => {
                      setSubtitleTrack(track.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPage("main");
                    }}
                  />
                ) : null
              )}
              <View style={styles.trackNote}>
                <Ionicons name="text-outline" size={14} color={C.textMuted} />
                <Text style={styles.noteText}>
                  External .vtt and .srt subtitle files are also supported — add via the URL field below the player.
                </Text>
              </View>
            </View>
          )}

          {page === "sleep" && (
            <View style={styles.section}>
              <OptionRow
                label="Off"
                active={state.sleepTimerMinutes === null}
                onPress={() => { setSleepTimer(null); setPage("main"); }}
              />
              {SLEEP_OPTIONS.map((mins) => (
                <OptionRow
                  key={mins}
                  label={`${mins} minutes`}
                  active={state.sleepTimerMinutes === mins}
                  onPress={() => {
                    setSleepTimer(mins);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setPage("main");
                  }}
                />
              ))}
              <View style={styles.note}>
                <Ionicons name="moon-outline" size={14} color={C.textMuted} />
                <Text style={styles.noteText}>
                  Playback will pause automatically after the selected time. A countdown badge appears on the player.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: C.border,
    maxHeight: "78%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 6,
  },
  headerTitle: {
    flex: 1,
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  backBtn: { padding: 4, marginRight: 4 },
  closeBtn: { padding: 4 },
  section: { paddingHorizontal: 12, paddingBottom: 8 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 6, marginHorizontal: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 12,
  },
  rowPressed: { backgroundColor: C.controlBg },
  rowIcon: { width: 32, alignItems: "center" },
  rowContent: { flex: 1 },
  rowTitle: { color: C.text, fontSize: 14, fontFamily: "Inter_500Medium" },
  rowSub: { color: C.textMuted, fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 1,
  },
  optionRowActive: { backgroundColor: C.accentSoft },
  optionText: { color: C.textSecondary, fontSize: 14, fontFamily: "Inter_400Regular" },
  optionTextActive: { color: C.accent, fontFamily: "Inter_600SemiBold" },
  note: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: C.surfaceElevated,
    borderRadius: 10,
    marginTop: 8,
    marginHorizontal: 8,
  },
  trackNote: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: C.surfaceElevated,
    borderRadius: 10,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  noteText: {
    flex: 1,
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
});
