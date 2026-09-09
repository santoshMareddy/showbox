import 'package:flutter/foundation.dart';

/// The signed-in user as the rest of the app sees them.
@immutable
final class UserSession {
  const UserSession({
    required this.userId,
    required this.email,
    required this.coinBalance,
    required this.isVip,
  }) : assert(coinBalance >= 0, 'coinBalance cannot be negative');

  final String userId;
  final String email;

  /// Spendable coins, including any bonus coins.
  final int coinBalance;

  /// Whether an active VIP plan unlocks every episode.
  final bool isVip;

  UserSession copyWith({
    String? userId,
    String? email,
    int? coinBalance,
    bool? isVip,
  }) =>
      UserSession(
        userId: userId ?? this.userId,
        email: email ?? this.email,
        coinBalance: coinBalance ?? this.coinBalance,
        isVip: isVip ?? this.isVip,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserSession &&
          other.userId == userId &&
          other.email == email &&
          other.coinBalance == coinBalance &&
          other.isVip == isVip;

  @override
  int get hashCode => Object.hash(userId, email, coinBalance, isVip);

  @override
  String toString() => 'UserSession(userId: $userId, email: $email, '
      'coinBalance: $coinBalance, isVip: $isVip)';
}
