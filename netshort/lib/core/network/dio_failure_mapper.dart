import 'package:dio/dio.dart';

import '../errors/failures.dart';

/// Translates a [DioException] into the domain [Failure] a repository returns.
Failure mapDioException(DioException error) {
  switch (error.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
    case DioExceptionType.transformTimeout:
      return NetworkFailure('The request timed out. Please try again.', error);
    case DioExceptionType.connectionError:
      return NetworkFailure(
        'Network unavailable. Check your connection and try again.',
        error,
      );
    case DioExceptionType.badCertificate:
      return NetworkFailure(
        'The secure connection could not be verified.',
        error,
      );
    case DioExceptionType.cancel:
      return ServerFailure('The request was cancelled.', cause: error);
    case DioExceptionType.badResponse:
      final status = error.response?.statusCode;
      if (status == 401 || status == 403) {
        return AuthFailure(
          'Your session has expired. Please sign in again.',
          error,
        );
      }
      return ServerFailure(
        _messageFor(status, error.response?.data),
        statusCode: status,
        cause: error,
      );
    case DioExceptionType.unknown:
      return ServerFailure(
        error.message ?? 'Something went wrong. Please try again.',
        cause: error,
      );
  }
}

String _messageFor(int? status, Object? body) {
  if (body is Map) {
    final Object? message = body['message'] ?? body['error'];
    if (message is String && message.isNotEmpty) {
      return message;
    }
  }
  if (status == null) {
    return 'The server returned an invalid response.';
  }
  if (status >= 500) {
    return 'The service is temporarily unavailable. Please try again.';
  }
  return 'The request failed with status $status.';
}
