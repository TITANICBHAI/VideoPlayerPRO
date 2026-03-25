import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/context/ThemeContext";

const APP_VERSION = "1.0.0";

type RowProps = {
  icon: string;
  iconColor?: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  chevron?: boolean;
  danger?: boolean;
  value?: string;
  right?: React.ReactNode;
};

function SettingsRow({ icon, iconColor, label, sublabel, onPress, chevron = true, danger, value, right }: RowProps) {
  const { C } = useTheme();
  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          onPress();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 12,
          gap: 12,
          backgroundColor: pressed && onPress ? C.surfaceElevated : "transparent",
        },
      ]}
    >
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: danger ? C.accentSoft : C.surfaceElevated,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Ionicons
          name={icon as any}
          size={17}
          color={danger ? C.accent : (iconColor ?? C.textSecondary)}
        />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: danger ? C.accent : C.text, fontSize: 14, fontFamily: "Inter_500Medium" }}>
          {label}
        </Text>
        {sublabel ? (
          <Text style={{ color: C.textMuted, fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 15 }}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {right}
      {value ? <Text style={{ color: C.textMuted, fontSize: 12, fontFamily: "Inter_400Regular" }}>{value}</Text> : null}
      {chevron && onPress && !right ? <Ionicons name="chevron-forward" size={16} color={C.textMuted} /> : null}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { C } = useTheme();
  return (
    <Text style={{
      color: C.textMuted,
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      paddingHorizontal: 4,
      paddingTop: 16,
      paddingBottom: 6,
    }}>
      {title}
    </Text>
  );
}

function Divider() {
  const { C } = useTheme();
  return <View style={{ height: 1, backgroundColor: C.border, marginLeft: 58 }} />;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { C, isDark, toggleTheme } = useTheme();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[{ flex: 1, backgroundColor: C.background }, { paddingTop: topPad }]}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <Text style={{ color: C.text, fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.4 }}>
          Settings
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: insets.bottom + 100, gap: 4 }}
      >
        <SectionHeader title="About" />
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 14 }}>
            <View style={{
              width: 52, height: 52, borderRadius: 14,
              backgroundColor: C.surfaceElevated,
              alignItems: "center", justifyContent: "center",
              borderWidth: 1, borderColor: C.border,
            }}>
              <Text style={{ fontSize: 26 }}>🎬</Text>
            </View>
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: C.text, fontSize: 17, fontFamily: "Inter_700Bold" }}>VideoPlayer</Text>
                <View style={{ backgroundColor: C.accent, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 }}>PRO</Text>
                </View>
              </View>
              <Text style={{ color: C.textMuted, fontSize: 12, fontFamily: "Inter_400Regular" }}>
                Version {APP_VERSION} · TB Techs
              </Text>
            </View>
          </View>
        </View>

        <SectionHeader title="Appearance" />
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SettingsRow
            icon={isDark ? "moon" : "sunny"}
            iconColor={isDark ? "#CE93D8" : "#FFD54F"}
            label="Dark Mode"
            sublabel={isDark ? "Using dark theme" : "Using light theme"}
            chevron={false}
            right={
              <Switch
                value={isDark}
                onValueChange={() => {
                  toggleTheme();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: C.border, true: C.accentSoft }}
                thumbColor={isDark ? C.accent : C.textMuted}
              />
            }
          />
        </View>

        <SectionHeader title="Legal" />
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
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
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
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

        <SectionHeader title="Player Tips" />
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SettingsRow
            icon="hand-left-outline"
            label="Gestures"
            sublabel="Swipe up · fullscreen    Swipe left/right edge up · brightness / volume (up to 200%)"
            chevron={false}
          />
          <Divider />
          <SettingsRow
            icon="flash-outline"
            iconColor="#FFD54F"
            label="Speed Boost"
            sublabel="Hold the play area for 2x fast-forward. Pitch stays normal at any speed."
            chevron={false}
          />
          <Divider />
          <SettingsRow
            icon="share-social-outline"
            iconColor="#64B5F6"
            label="Share to App"
            sublabel="Open a video link in Chrome, tap Share, and choose VideoPlayer PRO to add it directly."
            chevron={false}
          />
        </View>

        <SectionHeader title="Support" />
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SettingsRow
            icon="mail-outline"
            label="Contact Developer"
            sublabel="himanshusmartwatch@gmail.com"
            chevron={false}
          />
        </View>

        <Text style={{
          color: C.textMuted, fontSize: 11, fontFamily: "Inter_400Regular",
          textAlign: "center", lineHeight: 16,
          paddingHorizontal: 8, paddingTop: 20, paddingBottom: 8,
        }}>
          VideoPlayer PRO stores all data locally on your device.{"\n"}No personal data is collected, transmitted, or shared.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
});
