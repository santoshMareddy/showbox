// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'network_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Counts the times the API rejected the refresh token and the stored
/// session was wiped. Features listen to it to react to a forced sign-out
/// without the network layer depending on them.

@ProviderFor(SessionExpiry)
final sessionExpiryProvider = SessionExpiryProvider._();

/// Counts the times the API rejected the refresh token and the stored
/// session was wiped. Features listen to it to react to a forced sign-out
/// without the network layer depending on them.
final class SessionExpiryProvider
    extends $NotifierProvider<SessionExpiry, int> {
  /// Counts the times the API rejected the refresh token and the stored
  /// session was wiped. Features listen to it to react to a forced sign-out
  /// without the network layer depending on them.
  SessionExpiryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'sessionExpiryProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$sessionExpiryHash();

  @$internal
  @override
  SessionExpiry create() => SessionExpiry();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(int value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<int>(value),
    );
  }
}

String _$sessionExpiryHash() => r'd08c3b441520fe1ac025b67261914223b516ca7d';

/// Counts the times the API rejected the refresh token and the stored
/// session was wiped. Features listen to it to react to a forced sign-out
/// without the network layer depending on them.

abstract class _$SessionExpiry extends $Notifier<int> {
  int build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<int, int>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<int, int>,
              int,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}

/// The shared HTTP client. Kept alive for the whole process.

@ProviderFor(dio)
final dioProvider = DioProvider._();

/// The shared HTTP client. Kept alive for the whole process.

final class DioProvider extends $FunctionalProvider<Dio, Dio, Dio>
    with $Provider<Dio> {
  /// The shared HTTP client. Kept alive for the whole process.
  DioProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'dioProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$dioHash();

  @$internal
  @override
  $ProviderElement<Dio> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  Dio create(Ref ref) {
    return dio(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Dio value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Dio>(value),
    );
  }
}

String _$dioHash() => r'd9172949279297865e30a1c9610f5643bde04ade';
