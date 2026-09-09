import 'package:flutter/foundation.dart';

/// The viewer's spendable coins and VIP entitlement.
@immutable
final class Wallet {
  const Wallet({
    required this.coinBalance,
    required this.isVip,
    this.vipExpiresAt,
  }) : assert(coinBalance >= 0, 'coinBalance cannot be negative');

  final int coinBalance;
  final bool isVip;

  /// When the VIP plan lapses; `null` when the viewer never had one.
  final DateTime? vipExpiresAt;

  /// Whether a VIP plan is active right now.
  bool get hasActiveVip => hasActiveVipAt(DateTime.now());

  /// [hasActiveVip] evaluated at [now]; keeps the rule testable.
  bool hasActiveVipAt(DateTime now) =>
      isVip && (vipExpiresAt?.isAfter(now) ?? false);

  bool canAfford(int coinCost) => coinBalance >= coinCost;

  Wallet copyWith({
    int? coinBalance,
    bool? isVip,
    DateTime? vipExpiresAt,
    bool clearVipExpiry = false,
  }) =>
      Wallet(
        coinBalance: coinBalance ?? this.coinBalance,
        isVip: isVip ?? this.isVip,
        vipExpiresAt:
            clearVipExpiry ? null : (vipExpiresAt ?? this.vipExpiresAt),
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Wallet &&
          other.coinBalance == coinBalance &&
          other.isVip == isVip &&
          other.vipExpiresAt == vipExpiresAt;

  @override
  int get hashCode => Object.hash(coinBalance, isVip, vipExpiresAt);

  @override
  String toString() =>
      'Wallet(coins: $coinBalance, vip: $isVip, until: $vipExpiresAt)';
}
