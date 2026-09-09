import '../../../../core/utils/typedefs.dart';
import '../entities/coin_package.dart';
import '../entities/wallet.dart';

/// Coins, entitlements and the coin store.
abstract interface class PaywallRepository {
  /// The current wallet, created with the new-user balance on first use.
  FutureFailureOr<Wallet> getWallet();

  /// Ids of every episode this device has unlocked.
  FutureFailureOr<Set<String>> getUnlockedEpisodeIds();

  /// Spends [coinCost] on [episodeId]. Fails with a `ServerFailure` when the
  /// balance is too low. Unlocking an episode that is already owned is free.
  FutureFailureOr<Wallet> unlockWithCoins({
    required String episodeId,
    required int coinCost,
  });

  /// Unlocks [episodeId] after a rewarded ad; the balance is unchanged.
  FutureFailureOr<Wallet> unlockWithRewardedAd({required String episodeId});

  /// The packages on sale, cheapest first.
  FutureFailureOr<List<CoinPackage>> getCoinPackages();

  /// Credits [package]'s coins and bonus to the wallet.
  FutureFailureOr<Wallet> purchaseCoinPackage(CoinPackage package);
}
