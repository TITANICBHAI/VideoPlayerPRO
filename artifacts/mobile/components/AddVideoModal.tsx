import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/context/ThemeContext";
import { usePlayer } from "@/context/PlayerContext";
import { generateId } from "@/utils/format";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AddVideoModal({ visible, onClose }: Props) {
  const { addVideo, pendingShareUrl, setPendingShareUrl } = usePlayer();
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [clipboardHint, setClipboardHint] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (pendingShareUrl) {
        setUrl(pendingShareUrl);
        setPendingShareUrl(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        checkClipboard();
      }
    }
  }, [visible]);

  const checkClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.match(/^https?:\/\/.+/)) {
        setClipboardHint(text);
      } else {
        setClipboardHint(null);
      }
    } catch {
      setClipboardHint(null);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setUrl(text.trim());
        setError("");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setClipboardHint(null);
      }
    } catch {}
  };

  const handleAdd = () => {
    const trimUrl = url.trim();
    const trimTitle = title.trim();
    if (!trimUrl) {
      setError("Please enter a video URL.");
      return;
    }
    if (!trimUrl.match(/^https?:\/\/.+/)) {
      setError("Please enter a valid http/https URL.");
      return;
    }
    const video = {
      id: generateId(),
      title: trimTitle || trimUrl.split("/").pop() || "Untitled Video",
      uri: trimUrl,
      addedAt: Date.now(),
    };
    addVideo(video);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setUrl("");
    setTitle("");
    setError("");
    setClipboardHint(null);
    onClose();
  };

  const handleClose = () => {
    setUrl("");
    setTitle("");
    setError("");
    setClipboardHint(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kav}
      >
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20, backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.handle, { backgroundColor: C.border }]} />
          <View style={[styles.header, { borderBottomColor: C.border }]}>
            <Text style={[styles.title, { color: C.text }]}>Add Video</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={C.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: C.textSecondary }]}>Video URL *</Text>
              <View style={[styles.inputRow, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
                <TextInput
                  style={[styles.input, { color: C.text }]}
                  placeholder="https://example.com/video.mp4"
                  placeholderTextColor={C.textMuted}
                  value={url}
                  onChangeText={(t) => { setUrl(t); setError(""); }}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={handlePasteClipboard}
                  style={({ pressed }) => [styles.pasteBtn, { opacity: pressed ? 0.6 : 1 }]}
                  hitSlop={8}
                >
                  <Ionicons name="clipboard-outline" size={18} color={C.accent} />
                </Pressable>
              </View>
              {clipboardHint && !url && (
                <Pressable
                  onPress={handlePasteClipboard}
                  style={[styles.clipboardHint, { backgroundColor: C.accentSoft, borderColor: C.accent }]}
                >
                  <Ionicons name="clipboard-outline" size={13} color={C.accent} />
                  <Text style={[styles.clipboardHintText, { color: C.accent }]} numberOfLines={1}>
                    Paste: {clipboardHint}
                  </Text>
                </Pressable>
              )}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: C.textSecondary }]}>Title (optional)</Text>
              <TextInput
                style={[styles.input, styles.inputStandalone, { color: C.text, backgroundColor: C.surfaceElevated, borderColor: C.border }]}
                placeholder="My awesome video"
                placeholderTextColor={C.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={[styles.formatNote, { backgroundColor: C.surfaceElevated }]}>
              <Ionicons name="information-circle-outline" size={14} color={C.textMuted} />
              <Text style={[styles.formatNoteText, { color: C.textMuted }]}>
                Supports MP4, WebM, HLS (.m3u8), DASH, MKV, AVI, and direct stream URLs (RTSP, RTMP).
              </Text>
            </View>

            {error ? (
              <View style={styles.error}>
                <Ionicons name="alert-circle-outline" size={14} color={C.accent} />
                <Text style={[styles.errorText, { color: C.accent }]}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleAdd}
              style={({ pressed }) => [styles.addBtn, { backgroundColor: C.accent }, pressed && styles.addBtnPressed]}
            >
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Add to Library</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  kav: {
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    padding: 16,
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  inputStandalone: {
    borderRadius: 12,
    borderWidth: 1,
  },
  pasteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  clipboardHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  clipboardHintText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  formatNote: {
    flexDirection: "row",
    gap: 6,
    padding: 10,
    borderRadius: 10,
  },
  formatNoteText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  error: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  addBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  addBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  addBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
