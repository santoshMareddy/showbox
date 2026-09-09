# ShowBox — demo short-drama app

Status: Phase 0 (Design) delivered 2026-09-02. Design canvas link is in the chat handover.

## What we are building

A demo mobile app for **portrait short-drama video**, in the spirit of NetShort and DramaBox. Every video is vertical and full-screen. A series has 60 to 90 episodes of one to two minutes each. The first episodes are free; later ones cost coins or are free with VIP.

Design direction: **Midnight Marquee** — warm near-black background, one amber accent (which doubles as the coin colour), Bricolage Grotesque (display) + Instrument Sans (body). The catalog is fictional (titles, people, artwork). No real brands or copyrighted titles.

Reference: `Reference/Slide Animation.mp4` (7 s) shows the Home hero interaction to match. It is a centre-focused card carousel: the middle card is full size and bright, the neighbours are scaled down and dimmed, and a soft glow sits behind the focused card. Each card carries a rating badge, the title, and episode-count and genre chips.

## Screens (canvas numbering)

| # | Screen | What it does |
|---|--------|--------------|
| 01 | Me | Avatar and ID, VIP banner, coin balance with Top up / Earn, watch history, unlocked episodes, settings |
| 02 | Home | Genre chips, centre-focus hero carousel, Continue watching (portrait cards with EP badge and progress), Trending |
| 03 | Search | Search field, recent searches, genre tiles, top searches |
| 04 | Series details | Portrait cover, title and meta, Continue EP button, actions, synopsis, episode-number grid with locks, range chips |
| 05 | My List | Watching / Saved / Finished filters, 3-column poster grid with EP badges |
| 06 | Player | Vertical full-screen episode: title and EP counter, speed, right rail, episode caption, scrubber, "swipe up for next" |
| 07 | For You | Discovery feed of first episodes with a "Watch full series" call to action; same pager as the player |
| 08 | Unlock episode | Bottom sheet: balance, price, auto-unlock toggle, unlock with coins, watch an ad instead, VIP prompt |
| 09 | Wallet | Balance with expiring bonus, top-up packs with bonus tiers, VIP banner, recent transactions |
| 10 | Earn coins | 7-day check-in streak, daily tasks (ad, watch 3 episodes, add to My List, invite), earned today |
| 11 | VIP plans | Weekly / monthly / yearly, benefits, free-trial button |

Tab bar: Home · For You · My List · Rewards · Me. Search opens from the Home top bar. Wallet, Earn coins and VIP open from the coin pill, the Me page and the Unlock sheet.

## Stack (decided from what is installed on this machine)

Installed: Node 25, npm 11, Java 17, Android SDK + emulator, adb. Not installed: Flutter.

- **Expo SDK (React Native) + TypeScript** — runs on the Android emulator already here; Expo Go on a physical phone for iOS.
- **expo-router** — file-based navigation on a native stack.
- **react-native-reanimated + react-native-gesture-handler** — every animation and gesture on the UI thread.
- **@shopify/flash-list** — recycled horizontal rows, grids and the vertical episode pager.
- **expo-image** — memory/disk cache, placeholder + crossfade, prefetch.
- **expo-video** — one player instance per visible page, the next episode preloaded and muted.
- **expo-linear-gradient**, **expo-haptics**, **react-native-safe-area-context**, **AsyncStorage** (or MMKV) for the coin and unlock state.
- Data: local mock catalog in `src/data/catalog.ts`; short portrait sample clips for playback (public sample MP4s are landscape, so either generate 9:16 clips or play any MP4 with cover fit for the demo).

## Coins, unlocks and VIP

- **Unlocks:** the first episodes of a series are free (sample: up to EP 10). Later ones cost coins (sample: 50 each). Hitting a locked episode opens the Unlock sheet.
- **Auto-unlock:** a toggle that spends coins silently on each next locked episode.
- **Wallet:** coin balance with expiring bonus coins, top-up packs with bonus tiers (sample: 500 / 1,200 +10% / 2,500 +20% / 6,000 +35%), recent transactions.
- **Earn coins:** 7-day check-in streak with rising rewards, daily tasks (watch an ad, watch 3 episodes, add to My List, invite a friend).
- **VIP:** weekly / monthly / yearly plans; VIP unlocks every episode, removes ads and coin unlocks, and adds early access.
- **Demo rule:** purchases are simulated. Tapping a pack or plan runs a fake checkout and credits coins or VIP locally. No real store billing.
- **Data model (local):** `coins`, `bonusCoins[{amount, expiresAt}]`, `unlockedEpisodes[seriesId][]`, `autoUnlock`, `checkIn{streakDay, lastDate}`, `tasks[{id, progress, claimed}]`, `vip{plan, until}`, `transactions[]`, `progress[seriesId]{episode, position}`.

## Smoothness rules (non-negotiable)

1. Animations run on the UI thread only (Reanimated worklets). No JS-driven timing loops.
2. Every list is a FlashList with `estimatedItemSize`; row items are memoized and receive primitive props.
3. Every image goes through expo-image with a tinted placeholder and a 200 ms crossfade; the next row's posters are prefetched.
4. Navigation is a native stack. Series details opens with a cover-to-backdrop reveal and closes with a swipe-down gesture.
5. The Home hero is the centre-focus carousel from the reference clip: scale (1.0 focused, about 0.75 neighbours), dim (55% overlay on neighbours) and the glow colour are interpolated from the scroll offset on the UI thread. Snapping uses a spring, and the glow crossfades to the focused poster's dominant colour.
6. The player and For You are one vertical pager: the current episode plays, the next is preloaded and muted, so a swipe starts playback with no gap. Swipe sideways moves to the next series. Tap toggles play and pause with a 150 ms fade of the controls.
7. The unlock sheet springs up; the coin counter rolls down; check-in rewards fly into the balance pill.
8. Screens paint a skeleton instantly; mock data arrives after a simulated 300 ms so the loading path is real.
9. Light haptic on tab change, Play, unlock, and check-in.
10. Perf gate: 60 fps in the Perf Monitor while flinging Home, swiping episodes, and opening Details on the Android emulator, no JS-thread drop longer than 2 frames.

## Phases

| # | Phase | Output | Done when |
|---|-------|--------|-----------|
| 0 | Design | Canvas: 11 screens, tokens sheet, 2 alternate directions | Direction picked, screens approved |
| 1 | Scaffold | Expo app, theme tokens, fonts, tab router, mock catalog, coin store | Boots on the emulator with the 5-tab bar and empty screens |
| 2 | Home | Centre-focus hero carousel (per reference clip), Continue watching, poster rows | Carousel swipes snap at 60 fps, glow colour crossfades, rows fling at 60 fps |
| 3 | Series details | Cover reveal, episode-number grid with locks, range chips, swipe-down dismiss | Tapping an episode opens the player or the unlock sheet |
| 4 | Player + For You | Vertical pager with preloaded next episode, controls, scrubber, series switch | Swipe to the next episode starts with no gap; controls auto-hide |
| 5 | Coins and VIP | Unlock sheet, wallet, earn coins, VIP, simulated checkout | Coins flow end to end: earn, spend, top up, VIP bypass; state survives restart |
| 6 | Search / My List / Me | Genre grid, live filtering, list grid with filters, Me page | Every canvas screen exists in the app |
| 7 | Polish | Skeletons, haptics, empty states, perf pass | Perf gate passes |
| 8 | Demo build | `npx expo run:android --variant release` | Installable APK |

## Design tokens (source of truth: `design/Tokens.dc.html`)

| Token | Value |
|-------|-------|
| bg | #0B0A08 |
| surface | #15130F |
| surface-2 | #1E1B16 |
| border | rgba(255,255,255,0.08) |
| text | #F3EEE4 |
| text-muted | #A39C8F |
| accent (also coins) | #F2B441 (alternates: #F0725C, #3FC1B0, #A78BFA) |
| accent-ink | #14110A |
| Display font | Bricolage Grotesque 700/800 |
| Body font | Instrument Sans 400/500/600 |
| Radius | poster 10, button 12, input 14, hero card 16, sheet 24 |
| Screen margin | 20 |
| Poster sizes | portrait 110×165, continue card 104×156, hero carousel card 200×285 focused and 150×225 neighbours, episode tile 48 |
| Hit target | ≥ 44 px |
| Motion | enter 220 ms ease-out, exit 160 ms, gesture spring damping 18 / stiffness 180 |

## Open decisions

- Direction: Midnight Marquee (built out) vs Alt B Light Editorial vs Alt C Neon Glass (low-fi sketches on the canvas).
- Poster art: keep the abstract art placeholders, or generate real-looking portrait posters and short clips for the demo.
- Ad slot: a real ad SDK or a fake 15-second ad for the "watch an ad to unlock" path.
- Whether Search should also be a tab (currently opened from Home).
- iOS: no simulator on Windows. Expo Go on a physical iPhone is the fallback if an iOS demo is needed.

> **Restyle (2 Sep 2026):** the app now follows the user's "QuickReel" reference instead of the amber Midnight Marquee palette: navy-purple background `#0c0818`, pink `#ff3d8a` → violet `#8b5cf6` gradient accents with glow, white text on primary buttons, gold `#ffb43c` reserved for coins, gradient wordmark with a film-play logo mark, gradient tab icons. Tokens live in `app/src/styles/global.css`; the design canvas was restyled to match on 2 Sep 2026.

> **Privacy layer (2 Sep 2026):** privacy screen (branded cover whenever the app goes to the background or loses focus), screenshot/recording deterrent (PrintScreen and macOS capture keys blank the app and clear the clipboard; right-click, drag-save, picture-in-picture and casting disabled on video), 4-digit profile PIN lock (Settings > Privacy, PIN pad on the profile picker), incognito viewing (no watch history), and a Privacy & data page (what is stored, download as JSON, delete everything). A browser cannot cancel a phone hardware screenshot; the store build would use FLAG_SECURE / DRM for that. Test hooks: `?noshield=1` disables the shield, `?noanim=1` skips animations.
> **Placeholder content only (9 Sep 2026):** the Jellyfin media-server integration was removed. The catalogue is the built-in fictional one in `app/src/data/catalog.ts` (16 titles, 8 genres, CSS poster art) and every episode plays a free Mixkit portrait clip from `app/src/lib/video.ts`. Nothing needs a backend; the built site is static.

## Hosting

- **Web demo:** https://santoshmareddy.github.io/showbox/ — GitHub Pages serving the `gh-pages` branch. `deploy.ps1` builds `app/` and pushes `app/dist` there. It stays up whether or not any PC is on.
- **Android app:** https://santoshmareddy.github.io/showbox/get.html hands out `app/public/showbox.apk`, a self-contained build: the whole web app is packed into the APK and served to a WebView from a private origin, so it opens instantly with no server. The shell adds screenshot blocking (FLAG_SECURE, driven by the privacy toggle), the hardware back button, keep-awake during playback, a native splash and adaptive icon. Rebuild with `powershell -File androiduild-apk.ps1`, then commit the new `app/public/showbox.apk`. The signing key (`android/keystore/`) stays on the build machine and is gitignored; a different key will not install over an existing copy.
- **Build:** `npm run build` in `app/` type-checks, builds with `base: './'` (so the same output works on Pages, inside the APK and locally) and runs `app/scripts/assemble.mjs`, which copies the design canvas and the click-through prototype from `demo/` into `dist/canvas.html` and `dist/proto/`.
- The earlier local hosting (Python server, Tailscale Funnel, Cloudflare tunnel, scheduled tasks) was removed on 9 Sep 2026.

## Working files

- `design/*.dc.html` — one file per screen, the design canvas is re-generated from these.
- `design/canvas.json` — canvas layout and pages.
- `demo/` — the click-through prototype, its build script and the design-canvas export; copied into the site at build time.
- `app/` — the app itself; `app/public/` also holds the install page and the current APK.
- `android/` — the native shell that packs the web build into the APK.
- `deploy.ps1` — builds and publishes the site to the `gh-pages` branch.
