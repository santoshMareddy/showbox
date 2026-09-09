import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/episode.dart';
import '../../domain/entities/episode_comment.dart';

/// Everything the feed screen renders from.
@immutable
final class FeedState {
  const FeedState({
    this.episodes = const AsyncValue<List<Episode>>.loading(),
    this.activeIndex = 0,
    this.likedEpisodeIds = const <String>{},
    this.comments = const <String, List<EpisodeComment>>{},
  });

  /// The feed, while it loads, once loaded, or the failure that stopped it.
  final AsyncValue<List<Episode>> episodes;

  /// Index of the page snapped in the viewport.
  final int activeIndex;

  /// Ids of the episodes the viewer liked in this session.
  final Set<String> likedEpisodeIds;

  /// Comments written in this session, by episode id, oldest first.
  final Map<String, List<EpisodeComment>> comments;

  /// The loaded episodes, or an empty list while loading or after an error.
  List<Episode> get loadedEpisodes => switch (episodes) {
        AsyncData<List<Episode>>(:final value) => value,
        _ => const <Episode>[],
      };

  /// The episode snapped in the viewport, if the feed has loaded.
  Episode? get activeEpisode {
    final loaded = loadedEpisodes;
    if (activeIndex < 0 || activeIndex >= loaded.length) {
      return null;
    }
    return loaded[activeIndex];
  }

  bool isLiked(String episodeId) => likedEpisodeIds.contains(episodeId);

  List<EpisodeComment> commentsFor(String episodeId) =>
      comments[episodeId] ?? const <EpisodeComment>[];

  FeedState copyWith({
    AsyncValue<List<Episode>>? episodes,
    int? activeIndex,
    Set<String>? likedEpisodeIds,
    Map<String, List<EpisodeComment>>? comments,
  }) =>
      FeedState(
        episodes: episodes ?? this.episodes,
        activeIndex: activeIndex ?? this.activeIndex,
        likedEpisodeIds: likedEpisodeIds ?? this.likedEpisodeIds,
        comments: comments ?? this.comments,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is FeedState &&
          other.episodes == episodes &&
          other.activeIndex == activeIndex &&
          setEquals(other.likedEpisodeIds, likedEpisodeIds) &&
          mapEquals(other.comments, comments);

  @override
  int get hashCode => Object.hash(
        episodes,
        activeIndex,
        Object.hashAllUnordered(likedEpisodeIds),
        Object.hashAll(comments.keys),
      );

  @override
  String toString() => 'FeedState(episodes: $episodes, activeIndex: '
      '$activeIndex, liked: ${likedEpisodeIds.length}, '
      'comments: ${comments.length})';
}
