import AsyncStorage from "@react-native-async-storage/async-storage";
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
};

export type Chapter = {
  title: string;
  startTime: number;
};

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2 | 2.5 | 3 | 4;
export type VideoQuality = "Auto" | "144p" | "240p" | "360p" | "480p" | "720p" | "1080p" | "4K";

export type PlayerState = {
  currentVideo: VideoItem | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  playbackRate: PlaybackSpeed;
  quality: VideoQuality;
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
};

type PlayerContextType = {
  state: PlayerState;
  videos: VideoItem[];
  addVideo: (video: VideoItem) => void;
  removeVideo: (id: string) => void;
  playVideo: (video: VideoItem) => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  setPlaybackRate: (rate: PlaybackSpeed) => void;
  setQuality: (q: VideoQuality) => void;
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
  updatePlaybackInfo: (info: Partial<PlayerState>) => void;
  resetPlayer: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

const STORAGE_KEY = "@videoplayer_videos";

const DEFAULT_STATE: PlayerState = {
  currentVideo: null,
  isPlaying: false,
  isMuted: false,
  volume: 1,
  playbackRate: 1,
  quality: "Auto",
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
};

const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: "1",
    title: "Big Buck Bunny",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: 596,
    addedAt: Date.now() - 86400000,
    chapters: [
      { title: "Intro", startTime: 0 },
      { title: "The Characters", startTime: 60 },
      { title: "Main Adventure", startTime: 180 },
      { title: "Climax", startTime: 420 },
      { title: "Ending", startTime: 540 },
    ],
  },
  {
    id: "2",
    title: "Elephant Dream",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: 653,
    addedAt: Date.now() - 172800000,
    chapters: [
      { title: "Opening", startTime: 0 },
      { title: "The Machine", startTime: 120 },
      { title: "Confrontation", startTime: 300 },
      { title: "Resolution", startTime: 500 },
    ],
  },
  {
    id: "3",
    title: "For Bigger Blazes",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: 15,
    addedAt: Date.now() - 259200000,
  },
  {
    id: "4",
    title: "Subaru Outback",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    duration: 60,
    addedAt: Date.now() - 345600000,
  },
  {
    id: "5",
    title: "Tears of Steel",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    duration: 734,
    addedAt: Date.now() - 432000000,
    chapters: [
      { title: "Act I", startTime: 0 },
      { title: "Act II", startTime: 200 },
      { title: "Act III", startTime: 500 },
      { title: "Finale", startTime: 680 },
    ],
  },
  {
    id: "6",
    title: "Volkswagen GTI Review",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    duration: 50,
    addedAt: Date.now() - 518400000,
  },
];

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlayerState>(DEFAULT_STATE);
  const [videos, setVideos] = useState<VideoItem[]>(SAMPLE_VIDEOS);
  const seekRef = useRef<((t: number) => void) | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as VideoItem[];
        setVideos((prev) => {
          const savedIds = new Set(saved.map((v) => v.id));
          const combined = [...prev.filter((v) => !savedIds.has(v.id)), ...saved];
          return combined;
        });
      }
    } catch {}
  };

  const saveVideos = async (list: VideoItem[]) => {
    try {
      const userAdded = list.filter(
        (v) => !SAMPLE_VIDEOS.find((s) => s.id === v.id)
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userAdded));
    } catch {}
  };

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
    setState((prev) => ({
      ...prev,
      currentVideo: video,
      isPlaying: true,
      currentTime: 0,
      duration: video.duration ?? 0,
      isLoading: true,
      showControls: true,
      showSettings: false,
    }));
  }, []);

  const togglePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const toggleMute = useCallback(() => {
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const setVolume = useCallback((v: number) => {
    setState((prev) => ({ ...prev, volume: v, isMuted: v === 0 }));
  }, []);

  const setPlaybackRate = useCallback((rate: PlaybackSpeed) => {
    setState((prev) => ({ ...prev, playbackRate: rate }));
  }, []);

  const setQuality = useCallback((q: VideoQuality) => {
    setState((prev) => ({ ...prev, quality: q }));
  }, []);

  const seekTo = useCallback((time: number) => {
    setState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  const seekRelative = useCallback((delta: number) => {
    setState((prev) => ({
      ...prev,
      currentTime: Math.max(0, Math.min(prev.duration, prev.currentTime + delta)),
    }));
  }, []);

  const setFullscreen = useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, isFullscreen: v }));
  }, []);

  const setShowControls = useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, showControls: v }));
  }, []);

  const toggleSettings = useCallback(() => {
    setState((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  const toggleStatsForNerds = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showStatsForNerds: !prev.showStatsForNerds,
      showSettings: false,
    }));
  }, []);

  const toggleCaptions = useCallback(() => {
    setState((prev) => ({ ...prev, captionsEnabled: !prev.captionsEnabled }));
  }, []);

  const toggleAmbientMode = useCallback(() => {
    setState((prev) => ({ ...prev, ambientMode: !prev.ambientMode }));
  }, []);

  const toggleTheaterMode = useCallback(() => {
    setState((prev) => ({ ...prev, isTheaterMode: !prev.isTheaterMode }));
  }, []);

  const toggleLock = useCallback(() => {
    setState((prev) => ({ ...prev, isLocked: !prev.isLocked }));
  }, []);

  const setLoopMode = useCallback((m: "none" | "one" | "all") => {
    setState((prev) => ({ ...prev, loopMode: m }));
  }, []);

  const updatePlaybackInfo = useCallback((info: Partial<PlayerState>) => {
    setState((prev) => ({ ...prev, ...info }));
  }, []);

  const resetPlayer = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        state,
        videos,
        addVideo,
        removeVideo,
        playVideo,
        togglePlay,
        toggleMute,
        setVolume,
        setPlaybackRate,
        setQuality,
        seekTo,
        seekRelative,
        setFullscreen,
        setShowControls,
        toggleSettings,
        toggleStatsForNerds,
        toggleCaptions,
        toggleAmbientMode,
        toggleTheaterMode,
        toggleLock,
        setLoopMode,
        updatePlaybackInfo,
        resetPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
