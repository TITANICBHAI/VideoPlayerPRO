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

const C = Colors.dark;
const APP_VERSION = "1.0.0";

type RowProps = {
  icon: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  chevron?: boolean;
  danger?: boolean;
  value?: string;
};

function SettingsRow({ icon, label, sublabel, onPress, chevron = true, danger, value }: RowProps) {
  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          onPress();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon as any} size={17} color={danger ? C.accent : C.textSecondary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {chevron && onPress ? <Ionicons name="chevron-forward" size={16} color={C.textMuted} /> : null}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      >
        <SectionHeader title="About" />
        <View style={styles.card}>
          <View style={styles.appInfoRow}>
            <View style={styles.appIconWrap}>
              <Text style={styles.appIconEmoji}>🎬</Text>
            </View>
            <View style={styles.appInfoText}>
              <View style={styles.appNameRow}>
                <Text style={styles.appName}>VideoPlayer</Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.appVersion}>Version {APP_VERSION}</Text>
            </View>
          </View>
        </View>

        <SectionHeader title="Legal" />
        <View style={styles.card}>
          <SettingsRow
            icon="document-text-outline"
            label="Privacy Policy"
            sublabel="How we handle your data"
            onPress={() => router.push("/privacy-policy")}
          />
          <Divider />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Data Storage"
            sublabel="All data is stored locally on your device"
            chevron={false}
          />
        </View>

        <SectionHeader title="Storage" />
        <View style={styles.card}>
          <SettingsRow
            icon="folder-outline"
            label="Local Storage"
            sublabel="Video library and watch progress"
            chevron={false}
            value="On Device"
          />
          <Divider />
          <SettingsRow
            icon="cloud-offline-outline"
            label="No Cloud Sync"
            sublabel="Your data never leaves this device"
            chevron={false}
          />
        </View>

        <SectionHeader title="Support" />
        <View style={styles.card}>
          <SettingsRow
            icon="information-circle-outline"
            label="How to Use"
            sublabel="Add any video URL to your library"
            chevron={false}
          />
          <Divider />
          <SettingsRow
            icon="hand-left-outline"
            label="Gestures"
            sublabel="Swipe up for fullscreen · Swipe left/right for brightness/volume · Double-tap to seek"
            chevron={false}
          />
        </View>

        <Text style={styles.footerNote}>
          VideoPlayer PRO stores all data locally on your device. No personal data is collected, transmitted, or shared.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    color: C.text,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
  },
  scroll: {
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 4,
  },
  sectionHeader: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 6,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowPressed: {
    backgroundColor: C.surfaceElevated,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowIconDanger: {
    backgroundColor: C.accentSoft,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  rowLabelDanger: {
    color: C.accent,
  },
  rowSublabel: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 15,
  },
  rowValue: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 58,
  },
  appInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
  },
  appIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  appIconEmoji: {
    fontSize: 26,
  },
  appInfoText: {
    gap: 4,
  },
  appNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  appName: {
    color: C.text,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  proBadge: {
    backgroundColor: C.accent,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  appVersion: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  footerNote: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 8,
    paddingTop: 20,
    paddingBottom: 8,
  },
});
