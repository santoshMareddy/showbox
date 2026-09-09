// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Owns the [AuthState] for the whole app.
///
/// Kept alive so the state survives navigation. It also listens for the
/// network layer's session-expiry events and drops to signed-out when the
/// refresh token is rejected.

@ProviderFor(AuthController)
final authControllerProvider = AuthControllerProvider._();

/// Owns the [AuthState] for the whole app.
///
/// Kept alive so the state survives navigation. It also listens for the
/// network layer's session-expiry events and drops to signed-out when the
/// refresh token is rejected.
final class AuthControllerProvider
    extends $NotifierProvider<AuthController, AuthState> {
  /// Owns the [AuthState] for the whole app.
  ///
  /// Kept alive so the state survives navigation. It also listens for the
  /// network layer's session-expiry events and drops to signed-out when the
  /// refresh token is rejected.
  AuthControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'authControllerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$authControllerHash();

  @$internal
  @override
  AuthController create() => AuthController();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AuthState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AuthState>(value),
    );
  }
}

String _$authControllerHash() => r'8cc5e414da60081d68bbf2f62b0d3a7b69c29ae9';

/// Owns the [AuthState] for the whole app.
///
/// Kept alive so the state survives navigation. It also listens for the
/// network layer's session-expiry events and drops to signed-out when the
/// refresh token is rejected.

abstract class _$AuthController extends $Notifier<AuthState> {
  AuthState build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<AuthState, AuthState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AuthState, AuthState>,
              AuthState,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}
