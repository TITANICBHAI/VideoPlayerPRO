# VideoPlayer PRO — Complete App Overview

> **Platform:** Android (APK) & iOS  
> **Framework:** React Native + Expo SDK 54  
> **Version:** 1.0.0  
> **Last Updated:** March 2026

---

## What Is VideoPlayer PRO?

VideoPlayer PRO is a premium personal video library and player for mobile devices. It lets you organize, store, and play any video from a URL — with a cinema-grade playback experience. Think of it as your own private YouTube, with no ads, no algorithms, and complete control.

All data is stored **locally on your device**. Nothing is uploaded, tracked, or shared.

---

## Core Features

### Library Management
- Add videos by pasting any direct video URL (MP4, HLS, etc.)
- Automatically discovers videos already downloaded on your device
- Search your entire library instantly
- Sort by: Most Recent, Oldest, A–Z, Z–A, Longest, Last Watched
- Pull-to-refresh detects new device downloads in real time
- Auto-refreshes whenever you switch back to the app (e.g. after downloading in Chrome)

### Playback Engine
- Powered by **expo-video** — Expo's modern, hardware-accelerated video engine
- Smooth fullscreen with automatic landscape orientation lock
- Theater mode for an expanded viewing area
- Fit modes: Contain (letterboxed) or Cover (cropped fill)
- Double-tap left/right to seek ±10 seconds
- Hold the screen to temporarily speed up to 2× (release to resume)

### Gesture Controls
| Gesture | Action |
|---|---|
| Double-tap left | Seek back 10s |
| Double-tap right | Seek forward 10s |
| Swipe up on player | Enter fullscreen |
| Swipe down on player | Exit fullscreen |
| Swipe left on video list card | Delete video |
| Pull down on library | Refresh device videos |

### Playback Controls
- Play / Pause / Seek bar
- Playback speed: 0.25× to 4×
- Volume & mute toggle
- Loop modes: Off / Loop One / Loop All
- Sleep timer (auto-stops playback after set time)
- Screen lock (prevents accidental touches)

### Advanced Features
- **Resume Playback** — returns to exactly where you left off, per video
- **Watch Progress Tracking** — progress bar on every card, "Watched" badge when complete
- **Picture-in-Picture (PiP)** — keeps playing in a floating window while you use other apps
- **Ambient Mode** — subtle glow effect behind the player that matches the video
- **Stats for Nerds** — live overlay showing codec, resolution, dropped frames, buffer
- **Audio tracks & subtitle tracks** — UI ready for multi-track content
- **Audio normalization** — reduces volume spikes
- **Background playback** — audio continues when the screen is off

### On-Device Video Discovery
- Automatically reads all videos from your media library (with permission)
- Cards marked **"On Device"** with a blue badge
- Live change listener — a video downloaded from Chrome appears immediately, no restart needed
- Sorted alongside your URL videos, works with all sort options

---

## Screens

### Library (Home)
Your main screen. Displays all videos (URL-added + device downloads) with:
- Watch progress bars and completion badges
- Resume-from-here tags showing time remaining
- Chapter count badges
- Swipe-left-to-delete on any card
- Sort and search bar

### Player
Full-featured playback screen with:
- Custom controls overlay (auto-hides)
- Chapter list below the player
- Settings sheet (gear icon) with all advanced options
- Ambient glow, stats overlay, sleep timer badge

### Settings
- App version and identity
- Privacy Policy (in-app, full text)
- Data storage disclosure
- Gesture reference guide
- No account required, no sign-in

### Privacy Policy (in-app)
Full legal privacy policy accessible within the app, covering:
- No data collected
- Local-only storage
- Media library permission explanation
- Third-party services disclosure (none)

---

## Permissions

| Permission | Why | Required? |
|---|---|---|
| Media Library (Photos/Videos) | Discover device downloads, future save-to-library | Optional |

The app works fully without any permissions. The media library permission only enables device video auto-discovery.

---

## Building as an Android APK

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Expo CLI (`npm install -g expo`)
- EAS CLI (`npm install -g eas-cli`)
- An Expo account (free at expo.dev)

### Steps

**1. Install dependencies**
```bash
pnpm install
```

**2. Log in to Expo**
```bash
eas login
```

**3. Build a development APK (for testing, sideloading)**
```bash
cd artifacts/mobile
eas build --platform android --profile development
```

**4. Build a production APK (for distribution)**
```bash
eas build --platform android --profile production
```

**5. Build a local APK (no cloud, requires Android SDK)**
```bash
eas build --platform android --profile production --local
```

The resulting `.apk` file can be:
- Sideloaded directly onto any Android phone (enable "Install from unknown sources")
- Submitted to the Google Play Store via `eas submit`

### Build Profiles (eas.json)

| Profile | Type | Use For |
|---|---|---|
| `development` | APK | Internal testing, sideloading |
| `preview` | APK | QA / beta testers |
| `production` | AAB (App Bundle) | Google Play submission |

### Android Package Name
```
com.videoplayer.app
```

### EAS Project ID
```
878ec02f-bc26-41aa-8856-9f080b034268
```

---

## Building for iOS (IPA)

```bash
eas build --platform ios --profile production
```

Requirements:
- Apple Developer Account ($99/year)
- Provisioning profile and distribution certificate (EAS handles this automatically)

---

## Submitting to App Stores

**Google Play Store**
```bash
eas submit --platform android
```

**Apple App Store**
```bash
eas submit --platform ios
```

EAS Submit handles all metadata upload automatically with your store credentials.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 + Expo SDK 54 |
| Navigation | expo-router (file-based) |
| Video Engine | expo-video 3.x |
| State Management | React Context API |
| Local Storage | @react-native-async-storage |
| Media Discovery | expo-media-library |
| Animations | react-native-reanimated 4.x |
| Gestures | react-native-gesture-handler |
| Fonts | Inter (via expo-google-fonts) |
| Icons | Expo Vector Icons (Ionicons, Material) |
| Haptics | expo-haptics |
| Screen Orientation | expo-screen-orientation |
| Build System | pnpm monorepo + EAS Build |
| API Backend | Express.js (health checks, future sync) |

---

## Privacy & Production Readiness

- No analytics SDK
- No advertising SDK
- No crash reporting SDK (add Sentry if needed)
- No user accounts or authentication
- All data local-only (AsyncStorage)
- In-app Privacy Policy screen
- First-launch permission onboarding screen
- iOS `NSPhotoLibraryUsageDescription` declared in `app.json`
- Android package name configured
- EAS project configured and ready to build

---

## Project Structure

```
artifacts/mobile/
├── app/
│   ├── _layout.tsx          # Root layout, permissions gate
│   ├── (tabs)/
│   │   ├── index.tsx        # Library screen
│   │   ├── settings.tsx     # Settings screen
│   │   └── _layout.tsx      # Tab bar
│   ├── player.tsx           # Player screen
│   └── privacy-policy.tsx   # Privacy policy screen
├── components/
│   ├── VideoCard.tsx         # Library video card (swipe-to-delete, progress)
│   ├── PermissionsGate.tsx   # First-launch onboarding + permissions
│   └── player/
│       ├── VideoPlayer.tsx   # Core player (PiP, resume, progress saving)
│       ├── Controls.tsx      # Playback controls overlay
│       ├── ProgressBar.tsx   # Seek bar
│       ├── GestureOverlay.tsx
│       ├── SettingsSheet.tsx # In-player settings
│       ├── StatsOverlay.tsx  # Stats for Nerds
│       └── SleepTimerBadge.tsx
├── context/
│   └── PlayerContext.tsx     # Global state, watch progress, device discovery
├── constants/
│   └── colors.ts            # Design system colors
└── app.json                 # Expo config, permissions, EAS project ID
```

---

## Known Limitations / Future Improvements

- Video thumbnails: Currently shows a film icon placeholder for URL-based videos (actual thumbnail requires server-side extraction or a thumbnail URL)
- No cloud backup / sync across devices
- No playlist/queue management yet
- No video download (stream-only)
- No Chromecast / AirPlay casting yet
- Theme options (dark/light) not yet implemented — dark only

---

*VideoPlayer PRO is built with React Native + Expo and is ready for production distribution via EAS Build.*
