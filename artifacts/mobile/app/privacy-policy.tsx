import { Ionicons } from "@expo/vector-icons";
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
const LAST_UPDATED = "March 23, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <Text style={styles.para}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="chevron-back" size={20} color={C.text} />
          <Text style={styles.backText}>Settings</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</Text>

        <Section title="Overview">
          <Para>
            VideoPlayer PRO is a personal video library application. We are committed to protecting your privacy. This policy explains what information we handle, how it is stored, and your rights regarding that data.
          </Para>
          <Para>
            The short version: <Text style={styles.bold}>we collect nothing. All your data stays on your device.</Text>
          </Para>
        </Section>

        <Section title="Information We Do NOT Collect">
          <Para>VideoPlayer PRO does not collect, transmit, or share any personal information. Specifically, we do not collect:</Para>
          <Bullet>Your name, email address, or any contact information</Bullet>
          <Bullet>Your location data</Bullet>
          <Bullet>Device identifiers or advertising IDs</Bullet>
          <Bullet>Usage analytics or crash reports</Bullet>
          <Bullet>The video URLs you add to your library</Bullet>
          <Bullet>Your watch history or playback preferences</Bullet>
          <Bullet>Any financial information</Bullet>
        </Section>

        <Section title="Data Stored Locally on Your Device">
          <Para>
            All data created while using VideoPlayer PRO is stored exclusively on your device using local storage. This includes:
          </Para>
          <Bullet>Your video library (titles and URLs you add)</Bullet>
          <Bullet>Watch progress and resume positions for each video</Bullet>
          <Bullet>Playback preferences (speed, volume, etc.)</Bullet>
          <Bullet>App settings and onboarding state</Bullet>
          <Para>
            This data is never transmitted to any server, third party, or cloud service. Uninstalling the app removes all locally stored data permanently.
          </Para>
        </Section>

        <Section title="Media Library Permission">
          <Para>
            VideoPlayer PRO may request access to your device's media library. This permission is used solely to enable future features such as saving or sharing videos directly from the app. We do not read, scan, or transmit any content from your media library.
          </Para>
          <Para>
            You can deny this permission and continue using all core features of the app without restriction.
          </Para>
        </Section>

        <Section title="Video Playback">
          <Para>
            Videos are streamed directly from the URLs you provide. VideoPlayer PRO acts only as a player — it does not proxy, cache to external servers, or share your video URLs with any third party.
          </Para>
          <Para>
            Standard network activity logs (IP address, request time) may be created on the servers that host those video files, as is normal for any internet request. This is outside of VideoPlayer PRO's control.
          </Para>
        </Section>

        <Section title="Third-Party Services">
          <Para>
            VideoPlayer PRO does not integrate any third-party analytics, advertising, or tracking SDKs. There are no embedded social media buttons, trackers, or external scripts.
          </Para>
        </Section>

        <Section title="Children's Privacy">
          <Para>
            VideoPlayer PRO does not knowingly collect any information from users of any age, including children. Since no personal data is collected at all, this application is compliant with children's privacy standards.
          </Para>
        </Section>

        <Section title="Changes to This Policy">
          <Para>
            We may update this privacy policy from time to time. Any changes will be reflected in the "Last updated" date at the top of this page. Continued use of the app after changes constitutes acceptance of the updated policy.
          </Para>
        </Section>

        <Section title="Contact">
          <Para>
            If you have any questions about this privacy policy or your data, please reach out through the app store listing where you downloaded VideoPlayer PRO.
          </Para>
        </Section>

        <View style={styles.footer}>
          <View style={styles.footerBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
            <Text style={styles.footerBadgeText}>No data collected · Stored locally only · No tracking</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  navBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  backText: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 0,
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  lastUpdated: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
    gap: 10,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  para: {
    color: C.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  bold: {
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: C.accent,
    marginTop: 8,
    flexShrink: 0,
  },
  bulletText: {
    color: C.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    flex: 1,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: "center",
  },
  footerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  footerBadgeText: {
    color: "#4CAF50",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
