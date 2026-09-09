import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:netshort/core/network/api_endpoints.dart';
import 'package:netshort/core/network/dio_client.dart';
import 'package:netshort/core/network/interceptors/auth_interceptor.dart';
import 'package:netshort/core/storage/secure_storage_service.dart';

void main() {
  late FakeSecureStorage storage;
  late int expiredCalls;

  setUp(() {
    storage = FakeSecureStorage();
    expiredCalls = 0;
  });

  Dio client(ScriptedAdapter adapter) => createDioClient(
        storage: storage,
        httpClientAdapter: adapter,
        onSessionExpired: () => expiredCalls++,
      );

  group('AuthInterceptor onRequest', () {
    test('injects the stored access token as a Bearer header', () async {
      storage.accessToken = 'access-1';
      storage.refreshToken = 'refresh-1';
      final adapter = ScriptedAdapter((_) => jsonResponse(200, {'ok': true}));

      final response =
          await client(adapter).get<dynamic>(ApiEndpoints.showsFeed);

      expect(response.statusCode, 200);
      expect(adapter.requests, hasLength(1));
      expect(adapter.requests.single.authorization, 'Bearer access-1');
    });

    test('sends no Authorization header when no token is stored', () async {
      final adapter = ScriptedAdapter((_) => jsonResponse(200, {'ok': true}));

      await client(adapter).get<dynamic>(ApiEndpoints.showsFeed);

      expect(adapter.requests.single.authorization, isNull);
    });

    test('leaves the header out when the request opts out of auth', () async {
      storage.accessToken = 'access-1';
      final adapter = ScriptedAdapter((_) => jsonResponse(200, {'ok': true}));

      await client(adapter).get<dynamic>(
        ApiEndpoints.showsTrending,
        options: Options(extra: {AuthInterceptor.skipAuthExtra: true}),
      );

      expect(adapter.requests.single.authorization, isNull);
    });
  });

  group('AuthInterceptor onError (401 recovery)', () {
    // Server that only accepts `access-2` and issues it from /auth/refresh.
    ResponseBody expiringScript(RequestOptions options) {
      if (options.path == ApiEndpoints.authRefresh) {
        return jsonResponse(200, {
          'accessToken': 'access-2',
          'refreshToken': 'refresh-2',
        });
      }
      final authorized = options.headers[AuthInterceptor.authorizationHeader] ==
          'Bearer access-2';
      return authorized
          ? jsonResponse(200, {'ok': true})
          : jsonResponse(401, {'error': 'token_expired'});
    }

    test('refreshes once, stores the new tokens and replays the request',
        () async {
      storage.accessToken = 'access-1';
      storage.refreshToken = 'refresh-1';
      final adapter = ScriptedAdapter(expiringScript);

      final response =
          await client(adapter).get<dynamic>(ApiEndpoints.showsFeed);

      expect(response.statusCode, 200);
      expect(
        adapter.requests.map((r) => r.path),
        [
          ApiEndpoints.showsFeed,
          ApiEndpoints.authRefresh,
          ApiEndpoints.showsFeed,
        ],
      );
      expect(adapter.requests[0].authorization, 'Bearer access-1');
      expect(adapter.requests[1].authorization, isNull);
      expect(adapter.requests[1].data, containsPair('refreshToken', 'refresh-1'));
      expect(adapter.requests[2].authorization, 'Bearer access-2');
      expect(storage.accessToken, 'access-2');
      expect(storage.refreshToken, 'refresh-2');
      expect(storage.saveCount, 1);
      expect(expiredCalls, 0);
    });

    test('shares a single refresh between concurrent 401 responses', () async {
      storage.accessToken = 'access-1';
      storage.refreshToken = 'refresh-1';
      final adapter = ScriptedAdapter(expiringScript);
      final dio = client(adapter);

      final responses = await Future.wait<Response<dynamic>>([
        dio.get<dynamic>(ApiEndpoints.showsFeed),
        dio.get<dynamic>(ApiEndpoints.showsTrending),
        dio.get<dynamic>(ApiEndpoints.me),
      ]);

      expect(responses.map((r) => r.statusCode), everyElement(200));
      expect(
        adapter.requests.where((r) => r.path == ApiEndpoints.authRefresh),
        hasLength(1),
      );
      expect(storage.saveCount, 1);
      expect(expiredCalls, 0);
    });

    test('clears the session and surfaces the 401 when the refresh is rejected',
        () async {
      storage.accessToken = 'access-1';
      storage.refreshToken = 'refresh-1';
      final adapter = ScriptedAdapter(
        (options) => options.path == ApiEndpoints.authRefresh
            ? jsonResponse(401, {'error': 'invalid_grant'})
            : jsonResponse(401, {'error': 'token_expired'}),
      );

      await expectLater(
        client(adapter).get<dynamic>(ApiEndpoints.showsFeed),
        throwsA(
          isA<DioException>()
              .having((e) => e.response?.statusCode, 'status', 401)
              .having(
                (e) => e.requestOptions.path,
                'path',
                ApiEndpoints.showsFeed,
              ),
        ),
      );

      expect(storage.accessToken, isNull);
      expect(storage.refreshToken, isNull);
      expect(storage.clearCount, 1);
      expect(expiredCalls, 1);
      expect(
        adapter.requests.map((r) => r.path),
        [ApiEndpoints.showsFeed, ApiEndpoints.authRefresh],
      );
    });

    test('keeps the stored session when the refresh endpoint is unavailable',
        () async {
      storage.accessToken = 'access-1';
      storage.refreshToken = 'refresh-1';
      final adapter = ScriptedAdapter(
        (options) => options.path == ApiEndpoints.authRefresh
            ? jsonResponse(503, {'error': 'maintenance'})
            : jsonResponse(401, {'error': 'token_expired'}),
      );

      await expectLater(
        client(adapter).get<dynamic>(ApiEndpoints.showsFeed),
        throwsA(
          isA<DioException>()
              .having((e) => e.response?.statusCode, 'status', 401),
        ),
      );

      expect(storage.accessToken, 'access-1');
      expect(storage.refreshToken, 'refresh-1');
      expect(storage.clearCount, 0);
      expect(expiredCalls, 0);
    });

    test('never retries a failed refresh call itself', () async {
      storage.accessToken = 'access-1';
      storage.refreshToken = 'refresh-1';
      final adapter =
          ScriptedAdapter((_) => jsonResponse(401, {'error': 'invalid_grant'}));

      await expectLater(
        client(adapter).post<dynamic>(
          ApiEndpoints.authRefresh,
          data: {'refreshToken': 'refresh-1'},
        ),
        throwsA(isA<DioException>()),
      );

      expect(adapter.requests, hasLength(1));
      expect(storage.accessToken, 'access-1');
      expect(expiredCalls, 0);
    });
  });
}

/// In-memory stand-in for the platform keystore.
final class FakeSecureStorage implements ISecureStorageService {
  String? accessToken;
  String? refreshToken;
  int saveCount = 0;
  int clearCount = 0;

  @override
  Future<String?> getAccessToken() async => accessToken;

  @override
  Future<String?> getRefreshToken() async => refreshToken;

  @override
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    saveCount++;
  }

  @override
  Future<void> clearAll() async {
    accessToken = null;
    refreshToken = null;
    clearCount++;
  }
}

/// What the adapter saw for one request, copied before the interceptor
/// mutates the same [RequestOptions] for a replay.
final class RecordedRequest {
  RecordedRequest(RequestOptions options)
      : method = options.method,
        path = options.path,
        data = options.data,
        headers = Map<String, Object?>.of(options.headers);

  final String method;
  final String path;
  final Object? data;
  final Map<String, Object?> headers;

  String? get authorization {
    for (final entry in headers.entries) {
      if (entry.key.toLowerCase() == 'authorization') {
        return entry.value as String?;
      }
    }
    return null;
  }
}

typedef ResponseScript = ResponseBody Function(RequestOptions options);

/// [HttpClientAdapter] that answers from [ResponseScript] and records every
/// request, so no socket is ever opened.
final class ScriptedAdapter implements HttpClientAdapter {
  ScriptedAdapter(this._script);

  final ResponseScript _script;
  final List<RecordedRequest> requests = <RecordedRequest>[];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(RecordedRequest(options));
    return _script(options);
  }

  @override
  void close({bool force = false}) {}
}

ResponseBody jsonResponse(int statusCode, Object body) =>
    ResponseBody.fromString(
      jsonEncode(body),
      statusCode,
      headers: <String, List<String>>{
        Headers.contentTypeHeader: <String>[Headers.jsonContentType],
      },
    );
