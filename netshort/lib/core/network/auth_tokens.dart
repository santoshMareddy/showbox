import 'package:flutter/foundation.dart';

/// An access / refresh token pair as issued by the auth endpoints.
@immutable
final class AuthTokens {
  const AuthTokens({required this.accessToken, required this.refreshToken});

  final String accessToken;
  final String refreshToken;

  /// Parses the body of a token-issuing response.
  ///
  /// Accepts camelCase (`accessToken`) and snake_case (`access_token`) keys,
  /// optionally wrapped in a `data` envelope. Returns `null` when either token
  /// is missing or empty.
  static AuthTokens? tryParse(Object? body) {
    if (body is! Map) {
      return null;
    }
    final Object? envelope = body['data'];
    final Map<Object?, Object?> payload = envelope is Map ? envelope : body;

    final Object? access = payload['accessToken'] ?? payload['access_token'];
    final Object? refresh =
        payload['refreshToken'] ?? payload['refresh_token'];

    if (access is! String ||
        access.isEmpty ||
        refresh is! String ||
        refresh.isEmpty) {
      return null;
    }
    return AuthTokens(accessToken: access, refreshToken: refresh);
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthTokens &&
          other.accessToken == accessToken &&
          other.refreshToken == refreshToken;

  @override
  int get hashCode => Object.hash(accessToken, refreshToken);

  /// Never prints the token values.
  @override
  String toString() => 'AuthTokens(accessToken: <redacted>, '
      'refreshToken: <redacted>)';
}
