import 'package:fpdart/fpdart.dart';

import '../../../../core/utils/typedefs.dart';
import '../entities/user_session.dart';

/// Persists and restores the signed-in session on this device.
abstract interface class AuthRepository {
  /// The session saved by the last sign-in, or an `AuthFailure` when there is
  /// none (a `CacheFailure` when storage itself is unreadable).
  FutureFailureOr<UserSession> restoreSession();

  /// Stores the tokens securely and caches the profile, then returns it.
  FutureFailureOr<UserSession> persistSession({
    required UserSession session,
    required String accessToken,
    required String refreshToken,
  });

  /// Forgets the tokens and the cached profile.
  FutureFailureOr<Unit> clearSession();
}
