import 'package:flutter/foundation.dart';

/// A domain-level error returned on the `Left` side of `Either<Failure, T>`.
///
/// Failures are plain values: they carry a human-readable [message] and, when
/// useful for diagnostics, the underlying [cause]. Equality ignores [cause] so
/// two failures of the same kind and message compare equal in tests.
///
/// Implements [Exception] so a failure can also travel through an
/// `AsyncValue.error` when a provider has no `Either` to return.
@immutable
sealed class Failure implements Exception {
  const Failure(this.message, {this.cause});

  /// Short description suitable for logging or showing to the user.
  final String message;

  /// The low-level error that produced this failure, if any.
  final Object? cause;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Failure &&
          other.runtimeType == runtimeType &&
          other.message == message;

  @override
  int get hashCode => Object.hash(runtimeType, message);

  @override
  String toString() => '$runtimeType: $message';
}

/// The API answered, but with an error status or an unusable body.
final class ServerFailure extends Failure {
  const ServerFailure(super.message, {this.statusCode, super.cause});

  /// HTTP status code of the failed response, when one was received.
  final int? statusCode;

  @override
  bool operator ==(Object other) =>
      super == other && other is ServerFailure && other.statusCode == statusCode;

  @override
  int get hashCode => Object.hash(super.hashCode, statusCode);

  @override
  String toString() =>
      'ServerFailure${statusCode == null ? '' : '($statusCode)'}: $message';
}

/// The request never reached the API: offline, DNS, TLS or a timeout.
final class NetworkFailure extends Failure {
  const NetworkFailure([
    super.message = 'Network unavailable. Check your connection and try again.',
    Object? cause,
  ]) : super(cause: cause);
}

/// The user is not signed in, or the stored credentials were rejected.
final class AuthFailure extends Failure {
  const AuthFailure([
    super.message = 'Your session has expired. Please sign in again.',
    Object? cause,
  ]) : super(cause: cause);
}

/// Local persistence (secure storage or the Hive cache) could not be read or written.
final class CacheFailure extends Failure {
  const CacheFailure([
    super.message = 'Stored data could not be read.',
    Object? cause,
  ]) : super(cause: cause);
}
