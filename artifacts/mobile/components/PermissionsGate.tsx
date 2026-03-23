import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const C = Colors.dark;
const ONBOARDED_KEY = "@videoplayer_onboarded";

type Props = {
  children: React.ReactNode;
};

export function PermissionsGate({ children }: Props) {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [, requestPermission] = MediaLibrary.usePermissions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const val = await AsyncStorage.getItem(ONBOARDED_KEY);
      if (val === "true") {
        setReady(true);
      } else {
        setShowOnboarding(true);
      }
    } catch {
      setReady(true);
    }
  };

  const handleAllow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await requestPermission();
    } catch {}
    await AsyncStorage.setItem(ONBOARDED_KEY, "true");
    setShowOnboarding(false);
    setReady(true);
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem(ONBOARDED_KEY, "true");
    setShowOnboarding(false);
    setReady(true);
  };

  if (!showOnboarding && !ready) return null;

  if (showOnboarding) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.inner}>
          <View style={styles.iconWrap}>
            <Text style={styles.iconEmoji}>🎬</Text>
          </View>

          <Text style={styles.appName}>VideoPlayer PRO</Text>
          <Text style={styles.tagline}>Your personal video library.</Text>

          <View style={styles.features}>
            {[
              { icon: "📂", text: "Add and organize video URLs" },
              { icon: "🎮", text: "Advanced playback controls & gestures" },
              { icon: "📌", text: "Resume videos right where you left off" },
              { icon: "🖼️", text: "Picture-in-Picture support" },
            ].map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Media Library Access</Text>
            <Text style={styles.permissionDesc}>
              VideoPlayer PRO would like access to your media library to automatically show videos downloaded to your device.
            </Text>
          </View>

          <Pressable
            onPress={handleAllow}
            style={({ pressed }) => [styles.allowBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.allowBtnText}>Allow Access & Continue</Text>
          </Pressable>

          <Pressable onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Not now</Text>
          </Pressable>

          <Text style={styles.privacyNote}>
            We never collect or share your personal data. All data is stored locally on your device.
          </Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    justifyContent: "center",
  },
  inner: {
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 16,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: C.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 4,
  },
  iconEmoji: {
    fontSize: 42,
  },
  appName: {
    color: C.text,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tagline: {
    color: C.textMuted,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: -8,
  },
  features: {
    width: "100%",
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    fontSize: 18,
    width: 24,
    textAlign: "center",
  },
  featureText: {
    color: C.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  permissionCard: {
    width: "100%",
    backgroundColor: C.accentSoft,
    borderRadius: 14,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: C.accent,
  },
  permissionTitle: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  permissionDesc: {
    color: C.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  allowBtn: {
    width: "100%",
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  allowBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  skipBtn: {
    paddingVertical: 6,
  },
  skipText: {
    color: C.textMuted,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  privacyNote: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});
