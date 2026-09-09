import 'package:flutter/foundation.dart';

/// A purchasable bundle of coins.
@immutable
final class CoinPackage {
  const CoinPackage({
    required this.id,
    required this.coins,
    required this.bonusCoins,
    required this.priceUsd,
    this.badgeTag,
  })  : assert(coins > 0, 'a package must contain coins'),
        assert(bonusCoins >= 0, 'bonusCoins cannot be negative'),
        assert(priceUsd >= 0, 'priceUsd cannot be negative');

  final String id;
  final int coins;
  final int bonusCoins;
  final double priceUsd;

  /// Marketing label such as "POPULAR"; `null` for an unlabelled pack.
  final String? badgeTag;

  /// Coins credited when the package is bought.
  int get totalCoins => coins + bonusCoins;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CoinPackage &&
          other.id == id &&
          other.coins == coins &&
          other.bonusCoins == bonusCoins &&
          other.priceUsd == priceUsd &&
          other.badgeTag == badgeTag;

  @override
  int get hashCode => Object.hash(id, coins, bonusCoins, priceUsd, badgeTag);

  @override
  String toString() =>
      'CoinPackage($id: $coins+$bonusCoins coins for \$$priceUsd)';
}
