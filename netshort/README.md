# NetShort (Flutter)

Vertical short-drama OTT app: 9:16 portrait only, forced dark theme (pure black `#000000`, crimson accent `#E11D48`).

- **Architecture:** feature-first Clean Architecture (`domain` / `data` / `presentation`) with Riverpod 3 (code-generated providers).
- **Errors:** every domain repository returns `Either<Failure, T>` from `fpdart`.
- **Network:** Dio with a queued auth interceptor (Bearer injection, single-flight token refresh on 401, request replay).
- **Storage:** tokens in `flutter_secure_storage`, the cached profile in a Hive box.
- **Video:** media_kit (libmpv) with a three-decoder sliding window (`PreloadManager`), one `Player` per visible page and its neighbours.
- **Targets:** Android API 24+ (compileSdk 36), iOS 15.0+.

## Stage 1 layout

```
lib/
  main.dart                      bindings, portrait lock, edge-to-edge, Hive, ProviderScope
  app/                           NetShortApp, theme, GoRouter
  core/config/env_config.dart    dev / staging / prod, API base URL, 8 s timeouts
  core/errors/failures.dart      Failure hierarchy
  core/network/                  endpoints, Dio factory, AuthInterceptor
  core/storage/                  ISecureStorageService + flutter_secure_storage implementation
  features/auth/                 UserSession, AuthRepository, AuthController, SplashScreen
  features/feed/                 Episode, FeedRepository (sample catalogue), FeedController,
                                 FeedScreen (vertical PageView), HUD overlay, comments sheet
  features/player/               PreloadManager (decoder window), EpisodePlayer (media_kit Video)
test/core/network/auth_interceptor_test.dart
test/features/player/services/preload_manager_test.dart
```

## Stage 2 notes

- `PreloadManager.shiftWindow(i)` disposes every `Player` with `|index - i| > 1` before creating the missing ones, so at most three hardware decoders exist at any time. Locked episodes never get a decoder.
- The feed screen pauses all decoders when the app leaves the foreground and resumes the current one on return.
- Sample clips are the public Google test videos over HTTPS; they are 16:9, so `BoxFit.cover` crops them to the portrait viewport. Real 9:16 content will fill the screen without cropping.

## Commands

```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs   # regenerate *.g.dart after editing providers
flutter analyze
flutter test
flutter run --dart-define=NETSHORT_ENV=dev                  # dev (default) | staging | prod
```
