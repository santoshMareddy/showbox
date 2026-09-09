import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:media_kit/media_kit.dart';
import 'package:media_kit_video/media_kit_video.dart';

import '../../../app/theme/app_colors.dart';
import '../../feed/domain/entities/episode.dart';
import '../di/player_providers.dart';
import '../services/preload_manager.dart';

/// The video layer of one feed page.
///
/// While the [PreloadManager] holds a decoder for [index] the live texture is
/// drawn (inside its own [RepaintBoundary], so the HUD never forces a video
/// repaint). Outside the window, or while the first frame is still on its
/// way, the episode thumbnail stands in. The active page also gets the
/// tap-to-pause surface, the buffering spinner, the progress line and the
/// playback-error banner; those live in a second [RepaintBoundary].
class EpisodePlayer extends ConsumerWidget {
  const EpisodePlayer({
    required this.episode,
    required this.index,
    required this.isActive,
    super.key,
  });

  final Episode episode;
  final int index;
  final bool isActive;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final manager = ref.watch(preloadManagerProvider);
    return ListenableBuilder(
      listenable: manager,
      builder: (BuildContext context, Widget? _) {
        final player = manager.playerAt(index);
        final controller = manager.controllerAt(index);
        final hasDecoder = player != null && controller != null;

        return Stack(
          fit: StackFit.expand,
          children: <Widget>[
            _Thumbnail(url: episode.thumbnailUrl, dimmed: episode.isLocked),
            if (hasDecoder)
              RepaintBoundary(
                child: Video(
                  controller: controller,
                  fit: BoxFit.cover,
                  fill: Colors.transparent,
                  controls: NoVideoControls,
                  // Lifecycle is owned by PreloadManager (feed screen observer).
                  pauseUponEnteringBackgroundMode: false,
                  resumeUponEnteringForegroundMode: false,
                ),
              ),
            if (hasDecoder && isActive)
              RepaintBoundary(
                child: _PlaybackLayer(
                  player: player,
                  intendsToPlay: manager.isPlaying,
                  onToggle: manager.togglePlayback,
                  onRetry: () => manager.retry(index),
                ),
              ),
            if (!hasDecoder && episode.isLocked) const _LockedNotice(),
          ],
        );
      },
    );
  }
}

class _Thumbnail extends StatelessWidget {
  const _Thumbnail({required this.url, required this.dimmed});

  final String url;
  final bool dimmed;

  @override
  Widget build(BuildContext context) {
    return Image.network(
      url,
      fit: BoxFit.cover,
      gaplessPlayback: true,
      filterQuality: FilterQuality.medium,
      color: dimmed ? const Color(0x99000000) : null,
      colorBlendMode: dimmed ? BlendMode.darken : null,
      loadingBuilder: (
        BuildContext context,
        Widget child,
        ImageChunkEvent? progress,
      ) =>
          progress == null
              ? child
              : const ColoredBox(color: AppColors.pureBlack),
      errorBuilder: (BuildContext context, Object error, StackTrace? stack) =>
          const ColoredBox(color: AppColors.surfaceDark),
    );
  }
}

class _LockedNotice extends StatelessWidget {
  const _LockedNotice();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return IgnorePointer(
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: const Color(0x33FFFFFF),
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(
                Icons.lock_rounded,
                size: 36,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Unlock with coins to watch',
              style: textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Tap surface plus the indicators that depend on the player's streams.
class _PlaybackLayer extends StatelessWidget {
  const _PlaybackLayer({
    required this.player,
    required this.intendsToPlay,
    required this.onToggle,
    required this.onRetry,
  });

  final Player player;

  /// What the manager wants: `false` after the viewer tapped to pause.
  final bool intendsToPlay;
  final VoidCallback onToggle;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.paddingOf(context).top;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onToggle,
      child: Stack(
        fit: StackFit.expand,
        children: <Widget>[
          StreamBuilder<bool>(
            stream: player.stream.playing,
            initialData: player.state.playing,
            builder: (BuildContext context, AsyncSnapshot<bool> playing) =>
                StreamBuilder<bool>(
              stream: player.stream.buffering,
              initialData: player.state.buffering,
              builder: (BuildContext context, AsyncSnapshot<bool> buffering) {
                final isPlaying = playing.data ?? false;
                final isBuffering = buffering.data ?? false;
                final Widget indicator;
                if (!intendsToPlay) {
                  indicator = const Icon(
                    Icons.play_arrow_rounded,
                    size: 96,
                    color: Color(0xCCFFFFFF),
                    shadows: <Shadow>[
                      Shadow(color: Color(0x99000000), blurRadius: 24),
                    ],
                  );
                } else if (isBuffering || !isPlaying) {
                  indicator = const SizedBox(
                    width: 40,
                    height: 40,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: AppColors.textPrimary,
                    ),
                  );
                } else {
                  indicator = const SizedBox.shrink();
                }
                return IgnorePointer(
                  child: Center(
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 180),
                      child: indicator,
                    ),
                  ),
                );
              },
            ),
          ),
          StreamBuilder<String>(
            stream: player.stream.error,
            builder: (BuildContext context, AsyncSnapshot<String> error) {
              if (!error.hasData) {
                return const SizedBox.shrink();
              }
              return Positioned(
                top: topInset + 12,
                left: 16,
                right: 16,
                child: _ErrorBanner(message: error.data!, onRetry: onRetry),
              );
            },
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: IgnorePointer(child: _ProgressLine(player: player)),
          ),
        ],
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Material(
      color: const Color(0xE6121212),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 10, 6, 10),
        child: Row(
          children: <Widget>[
            const Icon(
              Icons.error_outline_rounded,
              color: AppColors.brandPrimary,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'Playback failed',
                    style: textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    message,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            TextButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}

class _ProgressLine extends StatelessWidget {
  const _ProgressLine({required this.player});

  final Player player;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Duration>(
      stream: player.stream.duration,
      initialData: player.state.duration,
      builder: (BuildContext context, AsyncSnapshot<Duration> duration) =>
          StreamBuilder<Duration>(
        stream: player.stream.position,
        initialData: player.state.position,
        builder: (BuildContext context, AsyncSnapshot<Duration> position) {
          final total = duration.data?.inMilliseconds ?? 0;
          final elapsed = position.data?.inMilliseconds ?? 0;
          final value = total > 0 ? (elapsed / total).clamp(0.0, 1.0) : 0.0;
          return LinearProgressIndicator(
            value: value,
            minHeight: 2,
            backgroundColor: const Color(0x33FFFFFF),
            color: AppColors.brandPrimary,
          );
        },
      ),
    );
  }
}
