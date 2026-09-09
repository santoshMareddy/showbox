import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../../core/errors/failures.dart';
import '../../../../core/network/network_providers.dart';
import '../../../../core/utils/typedefs.dart';
import '../../di/auth_providers.dart';
import '../../domain/entities/user_session.dart';
import '../../domain/repositories/auth_repository.dart';
import 'auth_state.dart';

part 'auth_controller.g.dart';

/// Owns the [AuthState] for the whole app.
///
/// Kept alive so the state survives navigation. It also listens for the
/// network layer's session-expiry events and drops to signed-out when the
/// refresh token is rejected.
@Riverpod(keepAlive: true)
class AuthController extends _$AuthController {
  @override
  AuthState build() {
    ref.listen<int>(sessionExpiryProvider, (int? previous, int next) {
      if (previous != null && next != previous) {
        handleSessionExpired();
      }
    });
    return const AuthInitial();
  }

  AuthRepository get _repository => ref.read(authRepositoryProvider);

  /// Loads the session saved by the last sign-in. Ends in
  /// [AuthAuthenticated] or [AuthUnauthenticated], never [AuthInitial].
  Future<void> restoreSession() async {
    final result = await _repository.restoreSession();
    state = result.fold<AuthState>(
      (Failure failure) => AuthUnauthenticated(reason: failure),
      AuthAuthenticated.new,
    );
  }

  /// Persists a freshly issued session and makes it current. On a storage
  /// failure the state is left untouched and the failure is returned.
  Future<FailureOr<UserSession>> signIn({
    required UserSession session,
    required String accessToken,
    required String refreshToken,
  }) async {
    final result = await _repository.persistSession(
      session: session,
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
    result.match(
      (Failure _) {},
      (UserSession persisted) => state = AuthAuthenticated(persisted),
    );
    return result;
  }

  /// Forgets the session on this device.
  Future<void> signOut() async {
    await _repository.clearSession();
    state = const AuthUnauthenticated();
  }

  /// Called when the API rejected the refresh token. Secure storage has
  /// already been wiped by the interceptor; this clears the cached profile
  /// and publishes the signed-out state.
  Future<void> handleSessionExpired() async {
    await _repository.clearSession();
    state = const AuthUnauthenticated(reason: AuthFailure());
  }
}
