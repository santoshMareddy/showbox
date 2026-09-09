import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../../core/errors/failures.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../../auth/presentation/controllers/auth_state.dart';
import '../../di/feed_providers.dart';
import '../../domain/entities/episode.dart';
import '../../domain/entities/episode_comment.dart';
import 'feed_state.dart';

part 'feed_controller.g.dart';

/// Loads the feed and tracks the viewer's position and interactions in it.
///
/// Auto-disposed with the feed screen, so returning to the feed starts from
/// the first episode with a fresh load.
@riverpod
class FeedController extends _$FeedController {
  @override
  FeedState build() {
    Future<void>.microtask(_load);
    return const FeedState();
  }

  Future<void> _load() async {
    final result = await ref.read(feedRepositoryProvider).fetchFeed();
    if (!ref.mounted) {
      return;
    }
    state = state.copyWith(
      episodes: result.fold<AsyncValue<List<Episode>>>(
        (Failure failure) =>
            AsyncValue<List<Episode>>.error(failure, StackTrace.current),
        (List<Episode> episodes) => AsyncValue<List<Episode>>.data(episodes),
      ),
    );
  }

  /// Reloads the feed from the start.
  Future<void> refresh() async {
    state = state.copyWith(
      episodes: const AsyncValue<List<Episode>>.loading(),
      activeIndex: 0,
    );
    await _load();
  }

  /// Records the page snapped in the viewport.
  void setActiveIndex(int index) {
    if (index == state.activeIndex) {
      return;
    }
    state = state.copyWith(activeIndex: index);
  }

  void toggleLike(String episodeId) {
    final liked = Set<String>.of(state.likedEpisodeIds);
    if (!liked.remove(episodeId)) {
      liked.add(episodeId);
    }
    state = state.copyWith(likedEpisodeIds: liked);
  }

  /// Appends a comment under the signed-in user's name (or "Guest").
  /// Blank text is ignored.
  void addComment(String episodeId, String text) {
    final trimmed = text.trim();
    if (trimmed.isEmpty) {
      return;
    }
    final now = DateTime.now();
    final author =
        ref.read(authControllerProvider).session?.email ?? 'Guest';
    final comment = EpisodeComment(
      id: '$episodeId-${now.microsecondsSinceEpoch}',
      episodeId: episodeId,
      author: author,
      text: trimmed,
      createdAt: now,
    );
    final comments = Map<String, List<EpisodeComment>>.of(state.comments);
    comments[episodeId] = List<EpisodeComment>.unmodifiable(
      <EpisodeComment>[...state.commentsFor(episodeId), comment],
    );
    state = state.copyWith(comments: comments);
  }
}
