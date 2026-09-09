import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../core/errors/failures.dart';
import '../../../player/di/player_providers.dart';
import '../../../player/services/preload_manager.dart';
import '../../../player/widgets/episode_player.dart';
import '../../domain/entities/episode.dart';
import '../controllers/feed_controller.dart';
import '../controllers/feed_state.dart';
import '../widgets/comments_sheet.dart';
import '../widgets/feed_hud_overlay.dart';

/// The vertical feed: one full-screen episode per page, snapped.
///
/// Every page change updates the [FeedController] and moves the
/// [PreloadManager] window, which is what keeps the decoder count bounded.
/// The screen also owns the app-lifecycle hook so nothing decodes while the
/// app is in the background.
class FeedScreen extends ConsumerStatefulWidget {
  const FeedScreen({super.key});

  @override
  ConsumerState<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends ConsumerState<FeedScreen>
    with WidgetsBindingObserver {
  final PageController _pageController = PageController();

  /// Keeps the auto-disposed manager alive for as long as this screen is.
  late final ProviderSubscription<PreloadManager> _manager;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _manager = ref.listenManual<PreloadManager>(
      preloadManagerProvider,
      (PreloadManager? previous, PreloadManager next) {},
    );
    ref.listenManual<AsyncValue<List<Episode>>>(
      feedControllerProvider.select((FeedState state) => state.episodes),
      (AsyncValue<List<Episode>>? previous, AsyncValue<List<Episode>> next) {
        if (next case AsyncData<List<Episode>>(:final value)) {
          _manager.read().setEpisodes(value);
        }
      },
      fireImmediately: true,
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _pageController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final manager = _manager.read();
    switch (state) {
      case AppLifecycleState.resumed:
        manager.resume();
      case AppLifecycleState.inactive:
      case AppLifecycleState.hidden:
      case AppLifecycleState.paused:
      case AppLifecycleState.detached:
        manager.pauseAll();
    }
  }

  void _onPageChanged(int index) {
    ref.read(feedControllerProvider.notifier).setActiveIndex(index);
    _manager.read().shiftWindow(index);
  }

  Future<void> _refresh() async {
    if (_pageController.hasClients) {
      _pageController.jumpToPage(0);
    }
    await ref.read(feedControllerProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final episodes = ref.watch(
      feedControllerProvider.select((FeedState state) => state.episodes),
    );

    return Scaffold(
      backgroundColor: AppColors.pureBlack,
      body: switch (episodes) {
        AsyncData<List<Episode>>(:final value) when value.isEmpty =>
          _FeedMessage(
            icon: Icons.movie_filter_outlined,
            title: 'Nothing to watch yet',
            message: 'Pull the feed again in a moment.',
            actionLabel: 'Refresh',
            onAction: _refresh,
          ),
        AsyncData<List<Episode>>(:final value) => PageView.builder(
            controller: _pageController,
            scrollDirection: Axis.vertical,
            physics: const ClampingScrollPhysics(),
            itemCount: value.length,
            onPageChanged: _onPageChanged,
            itemBuilder: (BuildContext context, int index) =>
                _FeedPage(episode: value[index], index: index),
          ),
        AsyncError<List<Episode>>(:final error) => _FeedMessage(
            icon: Icons.cloud_off_rounded,
            title: 'Could not load the feed',
            message: error is Failure
                ? error.message
                : 'Something went wrong. Please try again.',
            actionLabel: 'Try again',
            onAction: _refresh,
          ),
        _ => const Center(child: CircularProgressIndicator()),
      },
    );
  }
}

/// Video underneath, HUD on top. Rebuilds only when its own episode's
/// active / liked / comment state changes.
class _FeedPage extends ConsumerWidget {
  const _FeedPage({required this.episode, required this.index});

  final Episode episode;
  final int index;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isActive = ref.watch(
      feedControllerProvider.select((FeedState s) => s.activeIndex == index),
    );
    final isLiked = ref.watch(
      feedControllerProvider.select((FeedState s) => s.isLiked(episode.id)),
    );
    final commentCount = ref.watch(
      feedControllerProvider.select(
        (FeedState s) => s.commentsFor(episode.id).length,
      ),
    );

    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        EpisodePlayer(episode: episode, index: index, isActive: isActive),
        FeedHudOverlay(
          episode: episode,
          isLiked: isLiked,
          commentCount: commentCount,
          onLike: () =>
              ref.read(feedControllerProvider.notifier).toggleLike(episode.id),
          onComment: () => CommentsSheet.show(context, episode),
          onShare: () => _shareEpisode(context, episode),
        ),
      ],
    );
  }

  Future<void> _shareEpisode(BuildContext context, Episode episode) async {
    final link =
        'https://netshort.app/watch/${episode.showId}/${episode.episodeNumber}';
    await Clipboard.setData(ClipboardData(text: link));
    if (!context.mounted) {
      return;
    }
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        const SnackBar(
          content: Text('Link copied to clipboard'),
          duration: Duration(seconds: 2),
        ),
      );
  }
}

class _FeedMessage extends StatelessWidget {
  const _FeedMessage({
    required this.icon,
    required this.title,
    required this.message,
    required this.actionLabel,
    required this.onAction,
  });

  final IconData icon;
  final String title;
  final String message;
  final String actionLabel;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(icon, size: 52, color: AppColors.brandPrimary),
              const SizedBox(height: 18),
              Text(
                title,
                textAlign: TextAlign.center,
                style: textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: 200,
                child: FilledButton(
                  onPressed: onAction,
                  child: Text(actionLabel),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
