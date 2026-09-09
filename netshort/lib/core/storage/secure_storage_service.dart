import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Encrypted, device-local storage for the authentication tokens.
///
/// Implementations must never log token values. Every method may throw a
/// platform error (for example a corrupted Android keystore); callers in the
/// data layer translate those into a `CacheFailure`.
abstract interface class ISecureStorageService {
  /// The short-lived API token, or `null` when nobody is signed in.
  Future<String?> getAccessToken();

  /// The long-lived token used to mint a new access token, or `null`.
  Future<String?> getRefreshToken();

  /// Replaces both tokens atomically from the caller's point of view.
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  });

  /// Removes every value owned by this service.
  Future<void> clearAll();
}

/// [ISecureStorageService] backed by the platform keystore / keychain via
/// `flutter_secure_storage`.
final class SecureStorageService implements ISecureStorageService {
  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ?? _defaultStorage;

  /// Android: AES-GCM values wrapped with an RSA-OAEP keystore key (the
  /// package default). iOS: keychain items readable after the first unlock
  /// and never migrated to another device through a backup.
  static const FlutterSecureStorage _defaultStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  /// Storage key of the access token.
  static const String accessTokenKey = 'netshort.auth.access_token';

  /// Storage key of the refresh token.
  static const String refreshTokenKey = 'netshort.auth.refresh_token';

  final FlutterSecureStorage _storage;

  @override
  Future<String?> getAccessToken() => _storage.read(key: accessTokenKey);

  @override
  Future<String?> getRefreshToken() => _storage.read(key: refreshTokenKey);

  @override
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: accessTokenKey, value: accessToken);
    await _storage.write(key: refreshTokenKey, value: refreshToken);
  }

  @override
  Future<void> clearAll() async {
    await _storage.delete(key: accessTokenKey);
    await _storage.delete(key: refreshTokenKey);
  }
}
