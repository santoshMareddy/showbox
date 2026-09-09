// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'player_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// The feed's decoder window. Auto-disposed with the feed screen, which
/// releases every hardware decoder as soon as the feed is left.

@ProviderFor(preloadManager)
final preloadManagerProvider = PreloadManagerProvider._();

/// The feed's decoder window. Auto-disposed with the feed screen, which
/// releases every hardware decoder as soon as the feed is left.

final class PreloadManagerProvider
    extends $FunctionalProvider<PreloadManager, PreloadManager, PreloadManager>
    with $Provider<PreloadManager> {
  /// The feed's decoder window. Auto-disposed with the feed screen, which
  /// releases every hardware decoder as soon as the feed is left.
  PreloadManagerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'preloadManagerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$preloadManagerHash();

  @$internal
  @override
  $ProviderElement<PreloadManager> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  PreloadManager create(Ref ref) {
    return preloadManager(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(PreloadManager value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<PreloadManager>(value),
    );
  }
}

String _$preloadManagerHash() => r'9bd441409ad7a09403b66e76972a85dc57383fca';
