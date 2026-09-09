import 'package:dio/dio.dart';

import '../config/env_config.dart';
import '../storage/secure_storage_service.dart';
import 'interceptors/auth_interceptor.dart';

/// Builds the application's HTTP client.
///
/// The returned [Dio] carries the 8-second timeouts from [EnvConfig], JSON
/// defaults and an [AuthInterceptor]. The interceptor is given its own plain
/// [Dio] (same base options, no interceptors) for the token refresh and the
/// request replay.
///
/// [httpClientAdapter] is applied to both clients; tests pass a scripted
/// adapter here. [enableLogging] adds a header-free [LogInterceptor] and
/// should only be turned on in debug builds.
Dio createDioClient({
  required ISecureStorageService storage,
  String? baseUrl,
  HttpClientAdapter? httpClientAdapter,
  bool enableLogging = false,
  void Function()? onSessionExpired,
}) {
  BaseOptions baseOptions() => BaseOptions(
        baseUrl: baseUrl ?? EnvConfig.apiBaseUrl,
        connectTimeout: EnvConfig.connectTimeout,
        receiveTimeout: EnvConfig.receiveTimeout,
        sendTimeout: EnvConfig.sendTimeout,
        responseType: ResponseType.json,
        contentType: Headers.jsonContentType,
        headers: <String, Object?>{
          Headers.acceptHeader: Headers.jsonContentType,
        },
      );

  final refreshDio = Dio(baseOptions());
  final dio = Dio(baseOptions());

  if (httpClientAdapter != null) {
    refreshDio.httpClientAdapter = httpClientAdapter;
    dio.httpClientAdapter = httpClientAdapter;
  }

  dio.interceptors.add(
    AuthInterceptor(
      storage: storage,
      refreshDio: refreshDio,
      onSessionExpired: onSessionExpired,
    ),
  );

  if (enableLogging) {
    dio.interceptors.add(
      LogInterceptor(
        requestHeader: false,
        requestBody: false,
        responseHeader: false,
        responseBody: false,
      ),
    );
  }

  return dio;
}
