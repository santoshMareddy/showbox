import 'package:flutter/foundation.dart';

import '../../../../core/errors/failures.dart';
import '../../domain/entities/user_session.dart';

/// Where the app stands with respect to sign-in.
@immutable
sealed class AuthState {
  const AuthState();
}

/// Nothing is known yet; the splash screen is restoring the session.
final class AuthInitial extends AuthState {
  const AuthInitial();
}

/// A user is signed in.
final class AuthAuthenticated extends AuthState {
  const AuthAuthenticated(this.session);

  final UserSession session;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthAuthenticated && other.session == session;

  @override
  int get hashCode => session.hashCode;

  @override
  String toString() => 'AuthAuthenticated($session)';
}

/// Nobody is signed in. [reason] explains why when the state was reached
/// through an error (expired session, unreadable storage).
final class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated({this.reason});

  final Failure? reason;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthUnauthenticated && other.reason == reason;

  @override
  int get hashCode => reason.hashCode;

  @override
  String toString() => 'AuthUnauthenticated(reason: $reason)';
}

extension AuthStateX on AuthState {
  bool get isAuthenticated => this is AuthAuthenticated;

  /// The signed-in user, or `null`.
  UserSession? get session => switch (this) {
        AuthAuthenticated(:final session) => session,
        AuthInitial() || AuthUnauthenticated() => null,
      };
}
