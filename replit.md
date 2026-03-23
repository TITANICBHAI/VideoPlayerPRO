# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a full-featured YouTube-style video player mobile app built with Expo React Native.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo React Native video player app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Mobile App (VideoPlayer Pro)

Full-featured YouTube + VLC style video player for Android/iOS.

### Key Features
- **YouTube 2026 UI**: Pill-shaped controls, glassmorphism settings, dark-first design
- **Ambient Mode**: Dynamic red glow effect behind video player
- **Full Settings Menu**: Playback speed (0.25x–4x), quality selection, captions, theater mode, ambient mode
- **Stats for Nerds**: Codec, resolution, dropped frames, buffer health, connection speed
- **Gestures**: Double-tap to seek ±10s, long-press for 2x speed, tap to toggle controls
- **Chapter Markers**: Visual markers on progress bar with tooltips
- **Screen Orientation**: Auto-rotate to landscape in fullscreen
- **Android BackHandler**: Back button exits fullscreen before closing app
- **Lock Screen**: Disables all touch controls
- **Loop Modes**: None, single, all
- **Video Library**: 6 sample videos, add via URL, search, long-press to delete

### Architecture
- `artifacts/mobile/context/PlayerContext.tsx` — Global player state management
- `artifacts/mobile/components/player/VideoPlayer.tsx` — Core video player with expo-video
- `artifacts/mobile/components/player/Controls.tsx` — YouTube-style control overlay
- `artifacts/mobile/components/player/ProgressBar.tsx` — Custom progress bar with chapters
- `artifacts/mobile/components/player/SettingsSheet.tsx` — Bottom sheet settings menu
- `artifacts/mobile/components/player/StatsOverlay.tsx` — Stats for nerds overlay
- `artifacts/mobile/components/player/SeekIndicator.tsx` — Double-tap seek indicator
- `artifacts/mobile/components/VideoCard.tsx` — Library video card component
- `artifacts/mobile/components/AddVideoModal.tsx` — Add video via URL modal
- `artifacts/mobile/app/(tabs)/index.tsx` — Library home screen
- `artifacts/mobile/app/player.tsx` — Full player screen with chapters

### Packages Used
- `expo-video@~3.0.16` — Core video playback
- `expo-screen-orientation@~9.0.8` — Landscape/portrait rotation
- `expo-haptics` — Haptic feedback on interactions
- `react-native-gesture-handler` — Double-tap and gesture support
- `react-native-reanimated` — Smooth animations
