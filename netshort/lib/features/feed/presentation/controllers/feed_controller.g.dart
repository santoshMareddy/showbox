// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'feed_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Loads the feed and tracks the viewer's position and interactions in it.
///
/// Entitlements come in through `unlockedEpisodesProvider`: every episode
/// whose id is in that set is published with `isLocked == false`, whether
/// the unlock was persisted earlier or happened a moment ago in the paywall.
///
/// Auto-disposed with the feed screen, so returning to the feed starts from
/// the first episode with a fresh load.

@ProviderFor(FeedController)
final feedControllerProvider = FeedControllerProvider._();

/// Loads the feed and tracks the viewer's position and interactions in it.
///
/// Entitlements come in through `unlockedEpisodesProvider`: every episode
/// whose id is in that set is published with `isLocked == false`, whether
/// the unlock was persisted earlier or happened a moment ago in the paywall.
///
/// Auto-disposed with the feed screen, so returning to the feed starts from
/// the first episode with a fresh load.
final class FeedControllerProvider
    extends $NotifierProvider<FeedController, FeedState> {
  /// Loads the feed and tracks the viewer's position and interactions in it.
  ///
  /// Entitlements come in through `unlockedEpisodesProvider`: every episode
  /// whose id is in that set is published with `isLocked == false`, whether
  /// the unlock was persisted earlier or happened a moment ago in the paywall.
  ///
  /// Auto-disposed with the feed screen, so returning to the feed starts from
  /// the first episode with a fresh load.
  FeedControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'feedControllerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$feedControllerHash();

  @$internal
  @override
  FeedController create() => FeedController();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(FeedState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<FeedState>(value),
    );
  }
}

String _$feedControllerHash() => r'9c5da7e10b5d9cf5751992dd2071585dcc1f6ff7';

/// Loads the feed and tracks the viewer's position and interactions in it.
///
/// Entitlements come in through `unlockedEpisodesProvider`: every episode
/// whose id is in that set is published with `isLocked == false`, whether
/// the unlock was persisted earlier or happened a moment ago in the paywall.
///
/// Auto-disposed with the feed screen, so returning to the feed starts from
/// the first episode with a fresh load.

abstract class _$FeedController extends $Notifier<FeedState> {
  FeedState build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<FeedState, FeedState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<FeedState, FeedState>,
              FeedState,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}
