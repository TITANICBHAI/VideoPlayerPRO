import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type VideoItem = {
  id: string;
  title: string;
  uri: string;
  thumbnail?: string;
  duration?: number;
  addedAt: number;
  chapters?: Chapter[];
  isDeviceVideo?: boolean;
};

export type Chapter = {
  title: string;
  startTime: number;
};

export type WatchProgress = {
  position: number;
  duration: number;
  lastWatched: number;
  completed: boolean;
};

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2 | 2.5 | 3 | 4;
export type VideoQuality = "Auto" | "144p" | "240p" | "360p" | "480p" | "720p" | "1080p" | "4K";
export type FitMode = "contain" | "cover";

export type AudioTrack = { id: string; label: string; language: string };
export type SubtitleTrack = { id: string; label: string; language: string } | null;

export type PlayerState = {
  currentVideo: VideoItem | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  brightness: number;
  playbackRate: PlaybackSpeed;
  quality: VideoQuality;
  fitMode: FitMode;
  currentTime: number;
  duration: number;
  buffered: number;
  isFullscreen: boolean;
  isLoading: boolean;
  showControls: boolean;
  showSettings: boolean;
  showStatsForNerds: boolean;
  captionsEnabled: boolean;
  ambientMode: boolean;
  isTheaterMode: boolean;
  isLocked: boolean;
  loopMode: "none" | "one" | "all";
  droppedFrames: number;
  codec: string;
  resolution: string;
  connectionSpeed: number;
  audioTracks: AudioTrack[];
  activeAudioTrack: string;
  subtitleTracks: SubtitleTrack[];
  activeSubtitleTrack: string | null;
  audioNormalization: boolean;
  backgroundPlayback: boolean;
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  resumePosition: number;
};

type PlayerContextType = {
  state: PlayerState;
  videos: VideoItem[];
  deviceVideos: VideoItem[];
  watchProgress: Record<string, WatchProgress>;
  refreshDeviceVideos: () => Promise<void>;
  addVideo: (video: VideoItem) => void;
  removeVideo: (id: string) => void;
  playVideo: (video: VideoItem) => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  setBrightness: (v: number) => void;
  setPlaybackRate: (rate: PlaybackSpeed) => void;
  setQuality: (q: VideoQuality) => void;
  setFitMode: (m: FitMode) => void;
  seekTo: (time: number) => void;
  seekRelative: (delta: number) => void;
  setFullscreen: (v: boolean) => void;
  setShowControls: (v: boolean) => void;
  toggleSettings: () => void;
  toggleStatsForNerds: () => void;
  toggleCaptions: () => void;
  toggleAmbientMode: () => void;
  toggleTheaterMode: () => void;
  toggleLock: () => void;
  setLoopMode: (m: "none" | "one" | "all") => void;
  setAudioTrack: (id: string) => void;
  setSubtitleTrack: (id: string | null) => void;
  toggleAudioNormalization: () => void;
  toggleBackgroundPlayback: () => void;
  setSleepTimer: (minutes: number | null) => void;
  updatePlaybackInfo: (info: Partial<PlayerState>) => void;
  saveWatchProgress: (videoId: string, position: number, duration: number) => void;
  resetPlayer: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

const STORAGE_KEY = "@videoplayer_videos";
const PROGRESS_KEY = "@videoplayer_progress";

const DEFAULT_AUDIO_TRACKS: AudioTrack[] = [
  { id: "1", label: "English", language: "en" },
  { id: "2", label: "Hindi", language: "hi" },
  { id: "3", label: "Japanese", language: "ja" },
  { id: "4", label: "Spanish", language: "es" },
];

const DEFAULT_SUBTITLE_TRACKS: SubtitleTrack[] = [
  null,
  { id: "s1", label: "English (CC)", language: "en" },
  { id: "s2", label: "Hindi", language: "hi" },
  { id: "s3", label: "Spanish", language: "es" },
  { id: "s4", label: "French", language: "fr" },
];

const DEFAULT_STATE: PlayerState = {
  currentVideo: null,
  isPlaying: false,
  isMuted: false,
  volume: 1,
  brightness: 0.8,
  playbackRate: 1,
  quality: "Auto",
  fitMode: "contain",
  currentTime: 0,
  duration: 0,
  buffered: 0,
  isFullscreen: false,
  isLoading: false,
  showControls: true,
  showSettings: false,
  showStatsForNerds: false,
  captionsEnabled: false,
  ambientMode: true,
  isTheaterMode: false,
  isLocked: false,
  loopMode: "none",
  droppedFrames: 0,
  codec: "H.264",
  resolution: "1920x1080",
  connectionSpeed: 0,
  audioTracks: DEFAULT_AUDIO_TRACKS,
  activeAudioTrack: "1",
  subtitleTracks: DEFAULT_SUBTITLE_TRACKS,
  activeSubtitleTrack: null,
  audioNormalization: false,
  backgroundPlayback: false,
  sleepTimerMinutes: null,
  sleepTimerRemaining: null,
  resumePosition: 0,
};

const SAMPLE_VIDEOS: VideoItem[] = [];

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlayerState>(DEFAULT_STATE);
  const [videos, setVideos] = useState<VideoItem[]>(SAMPLE_VIDEOS);
  const [deviceVideos, setDeviceVideos] = useState<VideoItem[]>([]);
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>({});
  const watchProgressRef = useRef<Record<string, WatchProgress>>({});
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadVideos();
    loadWatchProgress();
    refreshDeviceVideos();
  }, []);

  useEffect(() => {
    const subscription = MediaLibrary.addChangeListener(() => {
      refreshDeviceVideos();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    watchProgressRef.current = watchProgress;
  }, [watchProgress]);

  useEffect(() => {
    if (state.sleepTimerRemaining === null) {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
      return;
    }
    if (state.sleepTimerRemaining <= 0) {
      setState((prev) => ({ ...prev, isPlaying: false, sleepTimerMinutes: null, sleepTimerRemaining: null }));
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
      return;
    }
    sleepTimerRef.current = setInterval(() => {
      setState((prev) => {
        const next = (prev.sleepTimerRemaining ?? 1) - 1;
        if (next <= 0) {
          if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
          return { ...prev, isPlaying: false, sleepTimerMinutes: null, sleepTimerRemaining: null };
        }
        return { ...prev, sleepTimerRemaining: next };
      });
    }, 1000);
    return () => { if (sleepTimerRef.current) clearInterval(sleepTimerRef.current); };
  }, [state.sleepTimerRemaining !== null]);

  const loadVideos = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as VideoItem[];
        setVideos((prev) => {
          const savedIds = new Set(saved.map((v) => v.id));
          return [...prev.filter((v) => !savedIds.has(v.id)), ...saved];
        });
      }
    } catch {}
  };

  const loadWatchProgress = async () => {
    try {
      const raw = await AsyncStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, WatchProgress>;
        setWatchProgress(saved);
        watchProgressRef.current = saved;
      }
    } catch {}
  };

  const refreshDeviceVideos = async () => {
    try {
      const permission = await MediaLibrary.getPermissionsAsync();
      if (!permission.granted) return;
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.video,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        first: 200,
      });
      const items: VideoItem[] = result.assets.map((asset) => ({
        id: `device-${asset.id}`,
        title: asset.filename.replace(/\.[^/.]+$/, ""),
        uri: asset.uri,
        thumbnail: asset.uri,
        duration: asset.duration,
        addedAt: asset.creationTime,
        isDeviceVideo: true,
      }));
      setDeviceVideos(items);
    } catch {}
  };

  const saveVideos = async (list: VideoItem[]) => {
    try {
      const userAdded = list.filter((v) => !SAMPLE_VIDEOS.find((s) => s.id === v.id));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userAdded));
    } catch {}
  };

  const saveWatchProgress = useCallback((videoId: string, position: number, duration: number) => {
    if (!videoId || duration <= 0) return;
    const completed = position >= duration * 0.95;
    const entry: WatchProgress = {
      position,
      duration,
      lastWatched: Date.now(),
      completed,
    };
    setWatchProgress((prev) => {
      const next = { ...prev, [videoId]: entry };
      watchProgressRef.current = next;
      AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addVideo = useCallback((video: VideoItem) => {
    setVideos((prev) => {
      const next = [video, ...prev.filter((v) => v.id !== video.id)];
      saveVideos(next);
      return next;
    });
  }, []);

  const removeVideo = useCallback((id: string) => {
    setVideos((prev) => {
      const next = prev.filter((v) => v.id !== id);
      saveVideos(next);
      return next;
    });
  }, []);

  const playVideo = useCallback((video: VideoItem) => {
    const saved = watchProgressRef.current[video.id];
    const resumePosition =
      saved && !saved.completed && saved.position > 5
        ? saved.position
        : 0;
    setState((prev) => ({
      ...prev,
      currentVideo: video,
      isPlaying: true,
      currentTime: resumePosition,
      duration: video.duration ?? 0,
      isLoading: true,
      showControls: true,
      showSettings: false,
      resumePosition,
    }));
  }, []);

  const togglePlay = useCallback(() => setState((p) => ({ ...p, isPlaying: !p.isPlaying })), []);
  const toggleMute = useCallback(() => setState((p) => ({ ...p, isMuted: !p.isMuted })), []);
  const setVolume = useCallback((v: number) => setState((p) => ({ ...p, volume: v, isMuted: v === 0 })), []);
  const setBrightness = useCallback((v: number) => setState((p) => ({ ...p, brightness: Math.max(0.05, Math.min(1, v)) })), []);
  const setPlaybackRate = useCallback((rate: PlaybackSpeed) => setState((p) => ({ ...p, playbackRate: rate })), []);
  const setQuality = useCallback((q: VideoQuality) => setState((p) => ({ ...p, quality: q })), []);
  const setFitMode = useCallback((m: FitMode) => setState((p) => ({ ...p, fitMode: m })), []);
  const seekTo = useCallback((time: number) => setState((p) => ({ ...p, currentTime: time })), []);
  const seekRelative = useCallback((delta: number) => setState((p) => ({
    ...p, currentTime: Math.max(0, Math.min(p.duration, p.currentTime + delta)),
  })), []);
  const setFullscreen = useCallback((v: boolean) => setState((p) => ({ ...p, isFullscreen: v })), []);
  const setShowControls = useCallback((v: boolean) => setState((p) => ({ ...p, showControls: v })), []);
  const toggleSettings = useCallback(() => setState((p) => ({ ...p, showSettings: !p.showSettings })), []);
  const toggleStatsForNerds = useCallback(() => setState((p) => ({ ...p, showStatsForNerds: !p.showStatsForNerds, showSettings: false })), []);
  const toggleCaptions = useCallback(() => setState((p) => ({ ...p, captionsEnabled: !p.captionsEnabled })), []);
  const toggleAmbientMode = useCallback(() => setState((p) => ({ ...p, ambientMode: !p.ambientMode })), []);
  const toggleTheaterMode = useCallback(() => setState((p) => ({ ...p, isTheaterMode: !p.isTheaterMode })), []);
  const toggleLock = useCallback(() => setState((p) => ({ ...p, isLocked: !p.isLocked })), []);
  const setLoopMode = useCallback((m: "none" | "one" | "all") => setState((p) => ({ ...p, loopMode: m })), []);
  const setAudioTrack = useCallback((id: string) => setState((p) => ({ ...p, activeAudioTrack: id })), []);
  const setSubtitleTrack = useCallback((id: string | null) => setState((p) => ({ ...p, activeSubtitleTrack: id, captionsEnabled: id !== null })), []);
  const toggleAudioNormalization = useCallback(() => setState((p) => ({ ...p, audioNormalization: !p.audioNormalization })), []);
  const toggleBackgroundPlayback = useCallback(() => setState((p) => ({ ...p, backgroundPlayback: !p.backgroundPlayback })), []);
  const setSleepTimer = useCallback((minutes: number | null) => {
    setState((p) => ({
      ...p,
      sleepTimerMinutes: minutes,
      sleepTimerRemaining: minutes !== null ? minutes * 60 : null,
    }));
  }, []);
  const updatePlaybackInfo = useCallback((info: Partial<PlayerState>) => setState((p) => ({ ...p, ...info })), []);
  const resetPlayer = useCallback(() => setState(DEFAULT_STATE), []);

  return (
    <PlayerContext.Provider value={{
      state, videos, deviceVideos, watchProgress,
      refreshDeviceVideos,
      addVideo, removeVideo, playVideo,
      togglePlay, toggleMute, setVolume, setBrightness,
      setPlaybackRate, setQuality, setFitMode,
      seekTo, seekRelative,
      setFullscreen, setShowControls,
      toggleSettings, toggleStatsForNerds, toggleCaptions,
      toggleAmbientMode, toggleTheaterMode, toggleLock,
      setLoopMode, setAudioTrack, setSubtitleTrack,
      toggleAudioNormalization, toggleBackgroundPlayback,
      setSleepTimer, updatePlaybackInfo, saveWatchProgress, resetPlayer,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
