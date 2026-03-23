import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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

import Colors from "@/constants/colors";
import { usePlayer } from "@/context/PlayerContext";
import { generateId } from "@/utils/format";

const C = Colors.dark;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AddVideoModal({ visible, onClose }: Props) {
  const { addVideo } = usePlayer();
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

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
    onClose();
  };

  const handleClose = () => {
    setUrl("");
    setTitle("");
    setError("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kav}
      >
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Add Video</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={C.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Video URL *</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/video.mp4"
                placeholderTextColor={C.textMuted}
                value={url}
                onChangeText={(t) => { setUrl(t); setError(""); }}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Title (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="My awesome video"
                placeholderTextColor={C.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formatNote}>
              <Ionicons name="information-circle-outline" size={14} color={C.textMuted} />
              <Text style={styles.formatNoteText}>
                Supports MP4, WebM, HLS (.m3u8), DASH, MKV, AVI, and direct stream URLs (RTSP, RTMP).
              </Text>
            </View>

            {error ? (
              <View style={styles.error}>
                <Ionicons name="alert-circle-outline" size={14} color={C.accent} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleAdd}
              style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
            >
              <Ionicons name="add-circle-outline" size={18} color={C.text} />
              <Text style={styles.addBtnText}>Add Video</Text>
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
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: C.border,
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: {
    flex: 1,
    color: C.text,
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
    color: C.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: C.surfaceElevated,
    color: C.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    borderColor: C.border,
  },
  formatNote: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: C.surfaceElevated,
    padding: 10,
    borderRadius: 10,
  },
  formatNoteText: {
    flex: 1,
    color: C.textMuted,
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
    color: C.accent,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  addBtn: {
    backgroundColor: C.accent,
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
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
