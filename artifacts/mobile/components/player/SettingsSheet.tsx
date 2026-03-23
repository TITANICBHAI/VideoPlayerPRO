import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

type SettingsPage = "main" | "speed" | "quality" | "captions";

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];
const QUALITIES: VideoQuality[] = ["Auto", "144p", "240p", "360p", "480p", "720p", "1080p", "4K"];

type SettingRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  chevron?: boolean;
};

function SettingRow({ icon, title, subtitle, onPress, right, chevron }: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
      {chevron ? (
        <Ionicons name="chevron-forward" size={16} color={C.textMuted} style={{ marginLeft: 4 }} />
      ) : null}
    </Pressable>
  );
}

export function SettingsSheet() {
  const { state, setPlaybackRate, setQuality, toggleCaptions, toggleAmbientMode, toggleTheaterMode, toggleSettings, toggleStatsForNerds } = usePlayer();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState<SettingsPage>("main");

  const handleClose = () => {
    setPage("main");
    toggleSettings();
  };

  const handleStatsForNerds = () => {
    handleClose();
    setTimeout(() => toggleStatsForNerds(), 300);
  };

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
          {page !== "main" ? (
            <Pressable onPress={() => setPage("main")} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={C.text} />
            </Pressable>
          ) : null}
          <Text style={styles.headerTitle}>
            {page === "main" ? "Settings" : page === "speed" ? "Playback Speed" : page === "quality" ? "Quality" : "Captions"}
          </Text>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={C.textSecondary} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {page === "main" && (
            <View style={styles.section}>
              <SettingRow
                icon={<Ionicons name="speedometer-outline" size={20} color={C.accent} />}
                title="Playback Speed"
                subtitle={state.playbackRate === 1 ? "Normal" : `${state.playbackRate}x`}
                onPress={() => setPage("speed")}
                chevron
              />
              <SettingRow
                icon={<Ionicons name="layers-outline" size={20} color="#4FC3F7" />}
                title="Quality"
                subtitle={state.quality}
                onPress={() => setPage("quality")}
                chevron
              />
              <SettingRow
                icon={<Ionicons name="text-outline" size={20} color="#A5D6A7" />}
                title="Captions"
                subtitle={state.captionsEnabled ? "On" : "Off"}
                onPress={() => setPage("captions")}
                chevron
              />
              <SettingRow
                icon={<MaterialCommunityIcons name="shimmer" size={20} color="#FFD54F" />}
                title="Ambient Mode"
                subtitle="Video glow behind player"
                right={
                  <Switch
                    value={state.ambientMode}
                    onValueChange={toggleAmbientMode}
                    trackColor={{ false: C.border, true: C.accentSoft }}
                    thumbColor={state.ambientMode ? C.accent : C.textMuted}
                  />
                }
              />
              <SettingRow
                icon={<Ionicons name="tv-outline" size={20} color="#CE93D8" />}
                title="Theater Mode"
                subtitle="Expanded view"
                right={
                  <Switch
                    value={state.isTheaterMode}
                    onValueChange={toggleTheaterMode}
                    trackColor={{ false: C.border, true: C.accentSoft }}
                    thumbColor={state.isTheaterMode ? C.accent : C.textMuted}
                  />
                }
              />
              <SettingRow
                icon={<Ionicons name="stats-chart-outline" size={20} color="#80DEEA" />}
                title="Stats for Nerds"
                subtitle="Technical playback info"
                onPress={handleStatsForNerds}
                chevron
              />
            </View>
          )}

          {page === "speed" && (
            <View style={styles.section}>
              {SPEEDS.map((speed) => (
                <Pressable
                  key={speed}
                  style={({ pressed }) => [
                    styles.optionRow,
                    state.playbackRate === speed && styles.optionRowSelected,
                    pressed && styles.rowPressed,
                  ]}
                  onPress={() => {
                    setPlaybackRate(speed);
                    setPage("main");
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      state.playbackRate === speed && styles.optionTextSelected,
                    ]}
                  >
                    {speed === 1 ? "Normal (1x)" : `${speed}x`}
                    {speed === 4 ? " — Ultra Fast" : ""}
                  </Text>
                  {state.playbackRate === speed && (
                    <Ionicons name="checkmark" size={18} color={C.accent} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {page === "quality" && (
            <View style={styles.section}>
              {QUALITIES.map((q) => (
                <Pressable
                  key={q}
                  style={({ pressed }) => [
                    styles.optionRow,
                    state.quality === q && styles.optionRowSelected,
                    pressed && styles.rowPressed,
                  ]}
                  onPress={() => {
                    setQuality(q);
                    setPage("main");
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      state.quality === q && styles.optionTextSelected,
                    ]}
                  >
                    {q === "Auto" ? "Auto (Recommended)" : q}
                    {q === "1080p" ? " HD" : ""}
                    {q === "4K" ? " Ultra HD" : ""}
                  </Text>
                  {state.quality === q && (
                    <Ionicons name="checkmark" size={18} color={C.accent} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {page === "captions" && (
            <View style={styles.section}>
              <SettingRow
                icon={<Ionicons name="text-outline" size={20} color="#A5D6A7" />}
                title="Enable Captions"
                right={
                  <Switch
                    value={state.captionsEnabled}
                    onValueChange={toggleCaptions}
                    trackColor={{ false: C.border, true: C.accentSoft }}
                    thumbColor={state.captionsEnabled ? C.accent : C.textMuted}
                  />
                }
              />
              <View style={styles.captionsNote}>
                <Ionicons name="information-circle-outline" size={14} color={C.textMuted} />
                <Text style={styles.captionsNoteText}>
                  Add .vtt or .srt subtitle files by entering a URL below the player. Captions will sync automatically with playback.
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
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: C.border,
    maxHeight: "70%",
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
    marginBottom: 8,
  },
  headerTitle: {
    flex: 1,
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  backBtn: {
    padding: 4,
    marginRight: 4,
  },
  closeBtn: {
    padding: 4,
  },
  section: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 12,
  },
  rowPressed: {
    backgroundColor: C.controlBg,
  },
  rowIcon: {
    width: 32,
    alignItems: "center",
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  rowSubtitle: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 1,
  },
  optionRowSelected: {
    backgroundColor: C.accentSoft,
  },
  optionText: {
    color: C.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  optionTextSelected: {
    color: C.accent,
    fontFamily: "Inter_600SemiBold",
  },
  captionsNote: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: C.surfaceElevated,
    borderRadius: 10,
    marginTop: 8,
    marginHorizontal: 8,
  },
  captionsNoteText: {
    flex: 1,
    color: C.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
