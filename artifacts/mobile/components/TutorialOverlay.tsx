import AsyncStorage from "@react-native-async-storage/async-storage";
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
const { width: W } = Dimensions.get("window");

type Step = {
  emoji: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    emoji: "🎬",
    title: "Welcome to VideoPlayer PRO",
    body: "Your personal video hub — add any URL or watch videos already on your device. Everything stays private and local.",
  },
  {
    emoji: "➕",
    title: "Adding Videos",
    body: 'Tap the + button in the top-right corner to paste a video URL (MP4, HLS, etc.).\n\nPull the list down to refresh and discover new videos on your device.',
  },
  {
    emoji: "▶️",
    title: "Playing a Video",
    body: "Tap any video card to start playing instantly.\n\nYour position is saved automatically — resume right where you left off next time.",
  },
  {
    emoji: "👆",
    title: "Player Controls",
    body: "Tap the screen once to show or hide controls.\n\nDouble-tap the left half to rewind 10 s, or the right half to skip ahead 10 s.\n\nHold anywhere for instant 2× speed boost.",
  },
  {
    emoji: "✋",
    title: "Swipe Gestures",
    body: "Swipe up from the centre to go fullscreen, down to exit.\n\nSwipe up/down on the LEFT edge to adjust brightness.\nSwipe up/down on the RIGHT edge to control volume — up to 200%!",
  },
  {
    emoji: "🗑️",
    title: "Managing Videos",
    body: "Swipe a video card left to reveal the Delete button.\n\nLong-press or tap ⋮ to quickly remove it from your library.",
  },
  {
    emoji: "✅",
    title: "You're All Set!",
    body: "You can revisit these tips any time from the Settings tab under Player Tips.\n\nEnjoy your videos!",
  },
];

export function TutorialOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    AsyncStorage.getItem(TUTORIAL_KEY).then((val) => {
      if (val !== "done") setVisible(true);
    });
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      ]).start();
    }
  }, [visible]);

  const animateStep = (next: number) => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 20, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideY.setValue(-20);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      ]).start();
    });
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      animateStep(step + 1);
    } else {
      finish();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateStep(step - 1);
    }
  };

  const finish = () => {
    Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setVisible(false);
      AsyncStorage.setItem(TUTORIAL_KEY, "done");
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
      <Animated.View
        style={[
          styles.card,
          { paddingBottom: insets.bottom + 20 },
          { opacity, transform: [{ translateY: slideY }] },
        ]}
      >
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{current.emoji}</Text>
        </View>

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>

        <View style={styles.buttons}>
          {step > 0 && (
            <Pressable
              onPress={handlePrev}
              style={({ pressed }) => [styles.prevBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.prevText}>Back</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [styles.nextBtn, { flex: step > 0 ? 1 : undefined, width: step === 0 ? W - 80 : undefined }, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.nextText}>{isLast ? "Get Started" : "Next"}</Text>
          </Pressable>
        </View>

        <Pressable onPress={finish} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip tutorial</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
    zIndex: 9999,
  },
  card: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 28,
    paddingHorizontal: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderBottomWidth: 0,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: C.accent,
  },
  emojiWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  emoji: {
    fontSize: 36,
  },
  title: {
    color: C.text,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  body: {
    color: C.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  nextBtn: {
    backgroundColor: C.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  nextText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  prevBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.border,
  },
  prevText: {
    color: C.textSecondary,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  skipText: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
