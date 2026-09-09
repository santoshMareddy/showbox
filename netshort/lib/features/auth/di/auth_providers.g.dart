// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// The Hive-backed profile cache.

@ProviderFor(sessionLocalDataSource)
final sessionLocalDataSourceProvider = SessionLocalDataSourceProvider._();

/// The Hive-backed profile cache.

final class SessionLocalDataSourceProvider
    extends
        $FunctionalProvider<
          SessionLocalDataSource,
          SessionLocalDataSource,
          SessionLocalDataSource
        >
    with $Provider<SessionLocalDataSource> {
  /// The Hive-backed profile cache.
  SessionLocalDataSourceProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'sessionLocalDataSourceProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$sessionLocalDataSourceHash();

  @$internal
  @override
  $ProviderElement<SessionLocalDataSource> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  SessionLocalDataSource create(Ref ref) {
    return sessionLocalDataSource(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(SessionLocalDataSource value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<SessionLocalDataSource>(value),
    );
  }
}

String _$sessionLocalDataSourceHash() =>
    r'af185e7063471570fc82e5aad1926d1361f8f636';

/// The auth repository wired to secure storage and the profile cache.

@ProviderFor(authRepository)
final authRepositoryProvider = AuthRepositoryProvider._();

/// The auth repository wired to secure storage and the profile cache.

final class AuthRepositoryProvider
    extends $FunctionalProvider<AuthRepository, AuthRepository, AuthRepository>
    with $Provider<AuthRepository> {
  /// The auth repository wired to secure storage and the profile cache.
  AuthRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'authRepositoryProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$authRepositoryHash();

  @$internal
  @override
  $ProviderElement<AuthRepository> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  AuthRepository create(Ref ref) {
    return authRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AuthRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AuthRepository>(value),
    );
  }
}

String _$authRepositoryHash() => r'3595a39fcd02d428f2838fe0aacb9e3ef58a125b';
