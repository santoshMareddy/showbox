import 'package:fpdart/fpdart.dart';

import '../../../../core/errors/failures.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../../../../core/utils/typedefs.dart';
import '../../domain/entities/user_session.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/session_local_data_source.dart';

/// [AuthRepository] over secure storage (tokens) and the Hive session cache
/// (profile). Every platform error becomes a [CacheFailure].
final class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({
    required this._secureStorage,
    required this._sessionStore,
  });

  final ISecureStorageService _secureStorage;
  final SessionLocalDataSource _sessionStore;

  @override
  FutureFailureOr<UserSession> restoreSession() async {
    try {
      final accessToken = await _secureStorage.getAccessToken();
      if (accessToken == null || accessToken.isEmpty) {
        return left(const AuthFailure('No signed-in session on this device.'));
      }

      final session = await _sessionStore.read();
      if (session == null) {
        // Tokens without a matching profile cannot be trusted: start clean.
        await _secureStorage.clearAll();
        return left(
          const AuthFailure(
            'The stored session is incomplete. Please sign in again.',
          ),
        );
      }

      return right(session);
    } on Object catch (error) {
      return left(
        CacheFailure('The stored session could not be read.', error),
      );
    }
  }

  @override
  FutureFailureOr<UserSession> persistSession({
    required UserSession session,
    required String accessToken,
    required String refreshToken,
  }) async {
    try {
      await _secureStorage.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
      await _sessionStore.write(session);
      return right(session);
    } on Object catch (error) {
      return left(
        CacheFailure('The session could not be saved on this device.', error),
      );
    }
  }

  @override
  FutureFailureOr<Unit> clearSession() async {
    try {
      await _secureStorage.clearAll();
      await _sessionStore.clear();
      return right(unit);
    } on Object catch (error) {
      return left(
        CacheFailure('The stored session could not be removed.', error),
      );
    }
  }
}
