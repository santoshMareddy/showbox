import 'package:flutter/foundation.dart';

import '../../domain/entities/wallet.dart';
import '../../domain/paywall_rules.dart';

/// Persistence shape of [Wallet] for the Hive key-value box.
@immutable
final class WalletModel {
  const WalletModel({
    required this.coinBalance,
    required this.isVip,
    this.vipExpiresAt,
  });

  /// What a brand-new user starts with.
  const WalletModel.initial()
      : this(coinBalance: PaywallRules.newUserCoins, isVip: false);

  factory WalletModel.fromEntity(Wallet wallet) => WalletModel(
        coinBalance: wallet.coinBalance,
        isVip: wallet.isVip,
        vipExpiresAt: wallet.vipExpiresAt,
      );

  /// Throws a [FormatException] when [map] does not describe a wallet.
  factory WalletModel.fromMap(Map<Object?, Object?> map) {
    final Object? coinBalance = map[_coinBalanceKey];
    final Object? isVip = map[_isVipKey];
    final Object? vipExpiresAt = map[_vipExpiresAtKey];

    if (coinBalance is! int || coinBalance < 0 || isVip is! bool) {
      throw FormatException('Stored wallet is malformed', map);
    }

    DateTime? expiry;
    if (vipExpiresAt != null) {
      if (vipExpiresAt is! String) {
        throw FormatException('Stored VIP expiry is malformed', map);
      }
      expiry = DateTime.tryParse(vipExpiresAt);
      if (expiry == null) {
        throw FormatException('Stored VIP expiry is malformed', map);
      }
    }

    return WalletModel(
      coinBalance: coinBalance,
      isVip: isVip,
      vipExpiresAt: expiry,
    );
  }

  static const String _coinBalanceKey = 'coinBalance';
  static const String _isVipKey = 'isVip';
  static const String _vipExpiresAtKey = 'vipExpiresAt';

  final int coinBalance;
  final bool isVip;
  final DateTime? vipExpiresAt;

  Map<String, Object?> toMap() => <String, Object?>{
        _coinBalanceKey: coinBalance,
        _isVipKey: isVip,
        _vipExpiresAtKey: vipExpiresAt?.toUtc().toIso8601String(),
      };

  Wallet toEntity() => Wallet(
        coinBalance: coinBalance,
        isVip: isVip,
        vipExpiresAt: vipExpiresAt,
      );

  WalletModel copyWith({int? coinBalance, bool? isVip, DateTime? vipExpiresAt}) =>
      WalletModel(
        coinBalance: coinBalance ?? this.coinBalance,
        isVip: isVip ?? this.isVip,
        vipExpiresAt: vipExpiresAt ?? this.vipExpiresAt,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is WalletModel &&
          other.coinBalance == coinBalance &&
          other.isVip == isVip &&
          other.vipExpiresAt == vipExpiresAt;

  @override
  int get hashCode => Object.hash(coinBalance, isVip, vipExpiresAt);
}
