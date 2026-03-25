import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const C = Colors.dark;
const TUTORIAL_KEY = "@videoplayer_tutorial_done";
const { width: W, height: H } = Dimensions.get("window");

type Step = {
  title: string;
  subtitle: string;
  accentColor: string;
  illustration: React.ReactNode;
  tips: string[];
};

function IllustrationLibrary() {
  return (
    <View style={illus.container}>
      <View style={[illus.phone, { borderColor: "rgba(255,255,255,0.15)" }]}>
        <View style={illus.phoneHeader}>
          <View style={[illus.phoneDot, { backgroundColor: C.accent }]} />
          <Text style={illus.phoneTitle}>VideoPlayer PRO</Text>
          <View style={[illus.phoneBadge, { backgroundColor: C.accent }]}>
            <Text style={illus.phoneBadgeText}>PRO</Text>
          </View>
        </View>
        {[0.9, 0.7, 0.85].map((w, i) => (
          <View key={i} style={illus.row}>
            <View style={[illus.thumb, { opacity: 0.6 + i * 0.1 }]} />
            <View style={{ flex: 1, gap: 5 }}>
              <View style={[illus.line, { width: `${w * 100}%` as any }]} />
              <View style={[illus.line, { width: "50%", opacity: 0.4 }]} />
            </View>
          </View>
        ))}
      </View>
      <View style={[illus.badge, { backgroundColor: C.accent, right: 20, top: 10 }]}>
        <Ionicons name="film" size={16} color="#fff" />
        <Text style={illus.badgeText}>Your Library</Text>
      </View>
    </View>
  );
}

function IllustrationAdd() {
  return (
    <View style={illus.container}>
      <View style={[illus.card, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)", padding: 20, gap: 14 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={[illus.iconCircle, { backgroundColor: C.accentSoft, borderColor: C.accent }]}>
            <Ionicons name="link" size={20} color={C.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={[illus.line, { width: "80%", backgroundColor: "rgba(255,255,255,0.25)" }]} />
            <View style={[illus.line, { width: "55%", opacity: 0.25, marginTop: 5 }]} />
          </View>
        </View>
        <View style={[illus.urlBar, { borderColor: C.accent, backgroundColor: C.accentSoft }]}>
          <Ionicons name="play-circle" size={14} color={C.accent} />
          <Text style={{ color: C.accent, fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 }}>https://example.com/video.mp4</Text>
        </View>
        <View style={[illus.addBig, { backgroundColor: C.accent }]}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" }}>Add to Library</Text>
        </View>
      </View>
      <View style={[illus.badge, { backgroundColor: "#4CAF50", left: 20, bottom: 30 }]}>
        <Ionicons name="phone-portrait" size={14} color="#fff" />
        <Text style={illus.badgeText}>Auto-detects device videos</Text>
      </View>
    </View>
  );
}

function IllustrationPlayer() {
  return (
    <View style={illus.container}>
      <View style={[illus.playerMock, { borderColor: "rgba(255,255,255,0.12)" }]}>
        <View style={illus.playerScreen}>
          <View style={illus.playRing}>
            <Ionicons name="play" size={28} color="#fff" />
          </View>
        </View>
        <View style={illus.playerBar}>
          <View style={illus.playerProgress}>
            <View style={[illus.playerFill, { width: "45%" }]} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 8 }}>2:14</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 8 }}>5:00</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 8 }}>
            <MaterialIcons name="replay-10" size={18} color="rgba(255,255,255,0.6)" />
            <Ionicons name="pause" size={22} color="#fff" />
            <MaterialIcons name="forward-10" size={18} color="rgba(255,255,255,0.6)" />
          </View>
        </View>
      </View>
      <View style={[illus.badge, { backgroundColor: C.accent, right: 16, bottom: 24 }]}>
        <Ionicons name="bookmark" size={13} color="#fff" />
        <Text style={illus.badgeText}>Auto-saves position</Text>
      </View>
    </View>
  );
}

function IllustrationControls() {
  return (
    <View style={illus.container}>
      <View style={[illus.gestureBox, { borderColor: "rgba(255,255,255,0.12)" }]}>
        <View style={[illus.tapZone, { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.1)" }]}>
          <Ionicons name="play-back" size={20} color={C.accent} />
          <Text style={illus.tapLabel}>Double-tap{"\n"}−10s</Text>
        </View>
        <View style={illus.tapZoneCenter}>
          <Ionicons name="hand-left" size={22} color="rgba(255,255,255,0.6)" />
          <Text style={illus.tapLabel}>Single tap{"\n"}show/hide</Text>
        </View>
        <View style={[illus.tapZone, { borderLeftWidth: 1, borderLeftColor: "rgba(255,255,255,0.1)" }]}>
          <Ionicons name="play-forward" size={20} color={C.accent} />
          <Text style={illus.tapLabel}>Double-tap{"\n"}+10s</Text>
        </View>
      </View>
      <View style={[illus.badge, { backgroundColor: "#FFD54F", alignSelf: "center", top: undefined, bottom: 20 }]}>
        <Ionicons name="flash" size={13} color="#000" />
        <Text style={[illus.badgeText, { color: "#000" }]}>Hold for 2× speed boost</Text>
      </View>
    </View>
  );
}

function IllustrationGestures() {
  return (
    <View style={illus.container}>
      <View style={[illus.gestureBox, { borderColor: "rgba(255,255,255,0.12)", position: "relative" }]}>
        <View style={[illus.swipeEdge, { left: 0, backgroundColor: "rgba(100,181,246,0.12)", borderRightWidth: 1, borderRightColor: "rgba(100,181,246,0.3)" }]}>
          <Ionicons name="sunny" size={18} color="#64B5F6" />
          <View style={{ alignItems: "center", gap: 2 }}>
            <Ionicons name="chevron-up" size={12} color="#64B5F6" />
            <Ionicons name="chevron-down" size={12} color="rgba(100,181,246,0.4)" />
          </View>
          <Text style={[illus.edgeLabel, { color: "#64B5F6" }]}>Bright-{"\n"}ness</Text>
        </View>
        <View style={illus.swipeCenter}>
          <Ionicons name="expand" size={24} color="rgba(255,255,255,0.5)" />
          <Text style={[illus.tapLabel, { marginTop: 6 }]}>Swipe up{"\n"}fullscreen</Text>
        </View>
        <View style={[illus.swipeEdge, { right: 0, left: undefined, backgroundColor: "rgba(129,199,132,0.12)", borderLeftWidth: 1, borderLeftColor: "rgba(129,199,132,0.3)" }]}>
          <Ionicons name="volume-high" size={18} color="#81C784" />
          <View style={{ alignItems: "center", gap: 2 }}>
            <Ionicons name="chevron-up" size={12} color="#81C784" />
            <Ionicons name="chevron-down" size={12} color="rgba(129,199,132,0.4)" />
          </View>
          <Text style={[illus.edgeLabel, { color: "#81C784" }]}>Vol-{"\n"}ume</Text>
        </View>
      </View>
    </View>
  );
}

function IllustrationDone() {
  const dots = [
    { x: -50, y: -60, size: 8, color: C.accent },
    { x: 50, y: -50, size: 6, color: "#FFD54F" },
    { x: -70, y: 20, size: 5, color: "#81C784" },
    { x: 70, y: 10, size: 7, color: "#64B5F6" },
    { x: -30, y: 70, size: 6, color: C.accent },
    { x: 40, y: 60, size: 5, color: "#CE93D8" },
  ];
  return (
    <View style={illus.container}>
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
        {dots.map((d, i) => (
          <View key={i} style={[illus.confettiDot, { width: d.size, height: d.size, backgroundColor: d.color, transform: [{ translateX: d.x }, { translateY: d.y }] }]} />
        ))}
        <View style={[illus.doneCircle, { borderColor: C.accent }]}>
          <View style={[illus.doneInner, { backgroundColor: C.accentSoft }]}>
            <Ionicons name="checkmark" size={48} color={C.accent} />
          </View>
        </View>
      </View>
    </View>
  );
}

const STEPS: Step[] = [
  {
    title: "Welcome to\nVideoPlayer PRO",
    subtitle: "Your private, offline-first video library — no account, no cloud, no ads.",
    accentColor: C.accent,
    illustration: <IllustrationLibrary />,
    tips: ["Add any MP4 or stream URL", "Auto-discovers videos on your device", "Everything stays local"],
  },
  {
    title: "Add Videos\nYour Way",
    subtitle: "Paste a URL or let the app find videos already saved on your phone.",
    accentColor: "#64B5F6",
    illustration: <IllustrationAdd />,
    tips: ["Tap + in the top corner", "Paste any video link", "Pull to refresh device videos"],
  },
  {
    title: "Powerful\nPlayer",
    subtitle: "Smooth playback with auto-resume, so you never lose your spot.",
    accentColor: "#81C784",
    illustration: <IllustrationPlayer />,
    tips: ["Tap any video to play", "Progress saved every 5 seconds", "Resumes from where you left off"],
  },
  {
    title: "Tap Controls\n& Double-Tap",
    subtitle: "Everything is one or two taps away — no menus required.",
    accentColor: C.accent,
    illustration: <IllustrationControls />,
    tips: ["Tap to show / hide controls", "Double-tap left/right to seek 10s", "Hold for instant 2× speed"],
  },
  {
    title: "Swipe\nGestures",
    subtitle: "Fine-tune volume and brightness without leaving the video.",
    accentColor: "#64B5F6",
    illustration: <IllustrationGestures />,
    tips: ["Swipe right edge up/down → Volume", "Swipe left edge up/down → Brightness", "Swipe up from centre → Fullscreen"],
  },
  {
    title: "Ready to\nWatch!",
    subtitle: "All tips are available anytime in Settings → Player Tips.",
    accentColor: "#81C784",
    illustration: <IllustrationDone />,
    tips: ["Swipe card left to delete", "Long-press card for quick delete", "Settings → What's New for updates"],
  },
];

export function TutorialOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentSlide = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(TUTORIAL_KEY).then((val) => {
      if (val !== "done") setVisible(true);
    });
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }
  }, [visible]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / STEPS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const animateToStep = (next: number) => {
    const dir = next > step ? 1 : -1;
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: dir * -30, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      contentSlide.setValue(dir * 30);
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(contentSlide, { toValue: 0, useNativeDriver: true, tension: 90, friction: 14 }),
      ]).start();
    });
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) animateToStep(step + 1);
    else finish();
  };

  const handlePrev = () => {
    if (step > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateToStep(step - 1);
    }
  };

  const finish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setVisible(false);
      AsyncStorage.setItem(TUTORIAL_KEY, "done");
    });
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fadeAnim }]}>
      <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>

        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.stepCounter}>
            <Text style={styles.stepCounterText}>{step + 1} / {STEPS.length}</Text>
          </View>
          <Pressable onPress={finish} style={styles.skipPill}>
            <Text style={styles.skipPillText}>Skip</Text>
          </Pressable>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }), backgroundColor: current.accentColor }]} />
        </View>

        {/* Illustration */}
        <Animated.View style={[styles.illustrationWrap, { opacity: contentOpacity, transform: [{ translateX: contentSlide }] }]}>
          {current.illustration}
        </Animated.View>

        {/* Text content */}
        <Animated.View style={[styles.textBlock, { opacity: contentOpacity, transform: [{ translateX: contentSlide }] }]}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>
        </Animated.View>

        {/* Tips */}
        <Animated.View style={[styles.tipsBlock, { opacity: contentOpacity }]}>
          {current.tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: current.accentColor }]} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {step > 0 ? (
            <Pressable onPress={handlePrev} style={({ pressed }) => [styles.prevBtn, pressed && { opacity: 0.6 }]}>
              <Ionicons name="chevron-back" size={20} color={C.textSecondary} />
            </Pressable>
          ) : <View style={styles.prevBtn} />}

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [styles.nextBtn, { backgroundColor: current.accentColor }, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.nextText}>{isLast ? "Let's go!" : "Next"}</Text>
            <Ionicons name={isLast ? "checkmark" : "arrow-forward"} size={16} color="#fff" />
          </Pressable>
        </View>

      </View>
    </Animated.View>
  );
}

const illus = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  phone: {
    width: W * 0.62,
    backgroundColor: "#111",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 8,
  },
  phoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  phoneDot: { width: 6, height: 6, borderRadius: 3 },
  phoneTitle: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold", flex: 1 },
  phoneBadge: { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  phoneBadgeText: { color: "#fff", fontSize: 7, fontFamily: "Inter_700Bold" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 10, paddingVertical: 8 },
  thumb: { width: 52, height: 34, borderRadius: 6, backgroundColor: "#2A2A2A" },
  line: { height: 7, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 4 },
  badge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  card: {
    width: W * 0.7,
    borderRadius: 18,
    borderWidth: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  urlBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  addBig: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 11,
  },
  playerMock: {
    width: W * 0.65,
    backgroundColor: "#111",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  playerScreen: {
    height: W * 0.65 * 9 / 16,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  playRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  playerBar: { padding: 12 },
  playerProgress: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },
  playerFill: { height: 3, backgroundColor: C.accent, borderRadius: 2 },
  gestureBox: {
    width: W * 0.7,
    height: 110,
    backgroundColor: "#111",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  tapZone: { flex: 1, alignItems: "center", justifyContent: "center", gap: 5 },
  tapZoneCenter: { flex: 1.2, alignItems: "center", justifyContent: "center", gap: 5 },
  tapLabel: { color: "rgba(255,255,255,0.5)", fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  swipeEdge: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  swipeCenter: { flex: 1, alignItems: "center", justifyContent: "center", marginHorizontal: 64 },
  edgeLabel: { fontSize: 9, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  doneCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  doneInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  confettiDot: {
    position: "absolute",
    borderRadius: 999,
  },
});

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "#0A0A0A",
    zIndex: 9999,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepCounter: {
    backgroundColor: C.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
  },
  stepCounterText: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  skipPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.border,
  },
  skipPillText: {
    color: C.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  progressTrack: {
    height: 3,
    backgroundColor: C.surfaceElevated,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  illustrationWrap: {
    flex: 1,
    minHeight: H * 0.26,
    maxHeight: H * 0.32,
  },
  textBlock: {
    gap: 6,
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  subtitle: {
    color: C.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  tipsBlock: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 10,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  tipText: {
    color: C.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  prevBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  nextText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
