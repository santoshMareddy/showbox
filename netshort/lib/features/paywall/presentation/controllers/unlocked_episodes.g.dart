// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'unlocked_episodes.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Ids of the episodes this device may play: the persisted unlocks loaded
/// with the wallet plus every unlock made in this session.
///
/// The wallet controller adds to it; the feed controller listens and flips
/// `Episode.isLocked` for matching episodes. Neither imports the other.

@ProviderFor(UnlockedEpisodes)
final unlockedEpisodesProvider = UnlockedEpisodesProvider._();

/// Ids of the episodes this device may play: the persisted unlocks loaded
/// with the wallet plus every unlock made in this session.
///
/// The wallet controller adds to it; the feed controller listens and flips
/// `Episode.isLocked` for matching episodes. Neither imports the other.
final class UnlockedEpisodesProvider
    extends $NotifierProvider<UnlockedEpisodes, Set<String>> {
  /// Ids of the episodes this device may play: the persisted unlocks loaded
  /// with the wallet plus every unlock made in this session.
  ///
  /// The wallet controller adds to it; the feed controller listens and flips
  /// `Episode.isLocked` for matching episodes. Neither imports the other.
  UnlockedEpisodesProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'unlockedEpisodesProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$unlockedEpisodesHash();

  @$internal
  @override
  UnlockedEpisodes create() => UnlockedEpisodes();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Set<String> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Set<String>>(value),
    );
  }
}

String _$unlockedEpisodesHash() => r'a516e7048ecd67983b40dafb42537f170494250e';

/// Ids of the episodes this device may play: the persisted unlocks loaded
/// with the wallet plus every unlock made in this session.
///
/// The wallet controller adds to it; the feed controller listens and flips
/// `Episode.isLocked` for matching episodes. Neither imports the other.

abstract class _$UnlockedEpisodes extends $Notifier<Set<String>> {
  Set<String> build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<Set<String>, Set<String>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<Set<String>, Set<String>>,
              Set<String>,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}
