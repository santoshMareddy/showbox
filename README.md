# ShowBox

A demo of a portrait short-drama streaming app, in the spirit of NetShort and DramaBox: vertical episodes, coins and unlocks, VIP, a Lucky Spin, profiles with PIN locks, and a privacy layer. Everything is simulated and stored on the device; the catalogue is fictional and the clips are free Mixkit placeholders.

- **Web demo:** https://santoshmareddy.github.io/showbox/
- **Android app:** https://santoshmareddy.github.io/showbox/get.html
- **Design canvas:** https://santoshmareddy.github.io/showbox/canvas.html
- **Click-through prototype:** https://santoshmareddy.github.io/showbox/proto/

## Layout

| Folder | What it is |
|---|---|
| `app/` | The app: Vite 8, React 19, TypeScript, framer-motion, zustand. `npm run build` produces a fully static site in `app/dist`. |
| `android/` | A small native shell that packs the web build into an APK. No server, no libraries; adds screenshot blocking, the hardware back button and keep-awake during playback. |
| `demo/` | The design canvas export and the earlier click-through prototype, copied into the site at build time. |
| `design/` | The design canvas sources. |
| `netshort/` | The native Flutter app (Riverpod, go_router, Dio): Stage 1 scaffolding, network engine and auth bootstrap. See `netshort/README.md`. |

## Build

```bash
cd app
npm ci
npm run build        # -> app/dist
npm run dev          # local dev server
```

Android (needs JDK 17 and an Android SDK with platform 36 and build-tools 36.1.0):

```powershell
powershell -File android\build-apk.ps1
```

That builds the web app, bundles it, signs the APK and writes `app/public/showbox.apk`. Commit that file to publish it on the site. The signing key lives only on the build machine and is not in this repository.

## Publishing

```powershell
powershell -File deploy.ps1
```

That builds `app/` and pushes `app/dist` to the `gh-pages` branch, which GitHub Pages serves. The site is live a minute or two later.
