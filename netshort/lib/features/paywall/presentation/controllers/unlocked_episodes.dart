import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'unlocked_episodes.g.dart';

/// Ids of the episodes this device may play: the persisted unlocks loaded
/// with the wallet plus every unlock made in this session.
///
/// The wallet controller adds to it; the feed controller listens and flips
/// `Episode.isLocked` for matching episodes. Neither imports the other.
@Riverpod(keepAlive: true)
class UnlockedEpisodes extends _$UnlockedEpisodes {
  @override
  Set<String> build() => const <String>{};

  void add(String episodeId) {
    if (state.contains(episodeId)) {
      return;
    }
    state = Set<String>.unmodifiable(<String>{...state, episodeId});
  }

  void merge(Set<String> episodeIds) {
    if (state.containsAll(episodeIds)) {
      return;
    }
    state = Set<String>.unmodifiable(<String>{...state, ...episodeIds});
  }
}
