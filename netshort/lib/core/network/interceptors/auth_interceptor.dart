import 'package:dio/dio.dart';

import '../../storage/secure_storage_service.dart';
import '../api_endpoints.dart';
import '../auth_tokens.dart';

/// Attaches the stored Bearer token to every request and transparently
/// recovers from `401 Unauthorized` by refreshing the session once.
///
/// Being a [QueuedInterceptor], Dio runs the error callbacks one at a time.
/// While one request is refreshing, every other 401 waits in the queue; when
/// its turn comes it notices the token in storage has already changed and is
/// simply replayed with the new token, so a burst of expired requests costs a
/// single refresh call.
///
/// The refresh and the replay go through [_refreshDio], a separate client
/// without this interceptor. Sending them through the main client would queue
/// them behind the very error callback that is waiting for them: a deadlock.
final class AuthInterceptor extends QueuedInterceptor {
  AuthInterceptor({
    required this._storage,
    required this._refreshDio,
    this.onSessionExpired,
  });

  /// Set `options.extra[skipAuthExtra] = true` to send a request anonymously.
  static const String skipAuthExtra = 'netshort.auth.skip';

  /// Marks a request that has already been replayed once, so it is never
  /// retried a second time.
  static const String retriedExtra = 'netshort.auth.retried';

  /// Name of the header carrying the Bearer token.
  static const String authorizationHeader = 'Authorization';

  static const String _bearerPrefix = 'Bearer ';

  /// Statuses from the refresh endpoint that mean the session is gone for
  /// good. Anything else (5xx, timeouts) is treated as transient.
  static const Set<int> _rejectedStatuses = <int>{400, 401, 403};

  final ISecureStorageService _storage;
  final Dio _refreshDio;

  /// Invoked once the refresh token has been rejected and the stored tokens
  /// were cleared. The app uses it to drop to the signed-out state.
  final void Function()? onSessionExpired;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (options.extra[skipAuthExtra] == true) {
      handler.next(options);
      return;
    }
    final token = await _storage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers[authorizationHeader] = '$_bearerPrefix$token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (!_isRecoverable(err)) {
      handler.next(err);
      return;
    }

    final options = err.requestOptions;
    final outcome = await _obtainFreshToken(_bearerTokenOf(options));

    switch (outcome) {
      case _Refreshed(:final accessToken):
        options.headers[authorizationHeader] = '$_bearerPrefix$accessToken';
        options.extra[retriedExtra] = true;
        try {
          handler.resolve(await _refreshDio.fetch<dynamic>(options));
        } on DioException catch (replayError) {
          handler.reject(replayError);
        }
      case _Rejected():
        await _storage.clearAll();
        onSessionExpired?.call();
        handler.next(err);
      case _Unavailable():
        handler.next(err);
    }
  }

  bool _isRecoverable(DioException err) {
    final options = err.requestOptions;
    return err.response?.statusCode == 401 &&
        options.extra[retriedExtra] != true &&
        options.extra[skipAuthExtra] != true &&
        !ApiEndpoints.isAuthRefresh(options.path);
  }

  /// Returns a usable access token, refreshing only when nobody else already
  /// did while this request was waiting in the queue.
  Future<_RefreshOutcome> _obtainFreshToken(String? failedToken) async {
    final current = await _storage.getAccessToken();
    if (current != null && current.isNotEmpty && current != failedToken) {
      return _Refreshed(current);
    }

    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      return const _Rejected();
    }

    try {
      final response = await _refreshDio.post<Object?>(
        ApiEndpoints.authRefresh,
        data: <String, String>{'refreshToken': refreshToken},
      );
      final tokens = AuthTokens.tryParse(response.data);
      if (tokens == null) {
        return const _Unavailable();
      }
      await _storage.saveTokens(
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      );
      return _Refreshed(tokens.accessToken);
    } on DioException catch (error) {
      final status = error.response?.statusCode;
      if (status != null && _rejectedStatuses.contains(status)) {
        return const _Rejected();
      }
      return const _Unavailable();
    }
  }

  String? _bearerTokenOf(RequestOptions options) {
    final value = options.headers[authorizationHeader];
    if (value is String && value.startsWith(_bearerPrefix)) {
      return value.substring(_bearerPrefix.length);
    }
    return null;
  }
}

sealed class _RefreshOutcome {
  const _RefreshOutcome();
}

/// A valid access token is available; replay the request with it.
final class _Refreshed extends _RefreshOutcome {
  const _Refreshed(this.accessToken);

  final String accessToken;
}

/// The server refused the refresh token (or there was none): sign out.
final class _Rejected extends _RefreshOutcome {
  const _Rejected();
}

/// The refresh could not complete (offline, 5xx, malformed body): keep the
/// stored session and surface the original error.
final class _Unavailable extends _RefreshOutcome {
  const _Unavailable();
}
