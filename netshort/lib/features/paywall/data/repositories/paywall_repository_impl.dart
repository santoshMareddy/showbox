import 'package:fpdart/fpdart.dart';

import '../../../../core/errors/failures.dart';
import '../../../../core/utils/typedefs.dart';
import '../../domain/entities/coin_package.dart';
import '../../domain/entities/wallet.dart';
import '../../domain/repositories/paywall_repository.dart';
import '../datasources/wallet_local_data_source.dart';
import '../models/wallet_model.dart';

/// [PaywallRepository] over the local wallet store.
///
/// Until the billing API exists every operation settles on the device: the
/// wallet is seeded with the new-user balance on first read, unlocks and
/// purchases are written to Hive, and the two unlock paths wait a short,
/// configurable latency so the UI's loading states are exercised.
final class PaywallRepositoryImpl implements PaywallRepository {
  PaywallRepositoryImpl({
    required this._store,
    this.unlockLatency = const Duration(milliseconds: 200),
    this.adLatency = const Duration(milliseconds: 300),
  });

  /// The coin store, cheapest first.
  static const List<CoinPackage> packages = <CoinPackage>[
    CoinPackage(
      id: 'coins-100',
      coins: 100,
      bonusCoins: 0,
      priceUsd: 1.99,
    ),
    CoinPackage(
      id: 'coins-500',
      coins: 500,
      bonusCoins: 50,
      priceUsd: 7.99,
      badgeTag: 'POPULAR',
    ),
    CoinPackage(
      id: 'coins-1200',
      coins: 1200,
      bonusCoins: 200,
      priceUsd: 14.99,
      badgeTag: 'BEST VALUE',
    ),
  ];

  final WalletLocalDataSource _store;

  /// Simulated round trip of a coin unlock.
  final Duration unlockLatency;

  /// Simulated length of the rewarded ad.
  final Duration adLatency;

  @override
  FutureFailureOr<Wallet> getWallet() async {
    try {
      return right((await _currentWallet()).toEntity());
    } on Object catch (error) {
      return left(CacheFailure('The wallet could not be read.', error));
    }
  }

  @override
  FutureFailureOr<Set<String>> getUnlockedEpisodeIds() async {
    try {
      return right(await _store.readUnlockedEpisodeIds());
    } on Object catch (error) {
      return left(CacheFailure('Unlocked episodes could not be read.', error));
    }
  }

  @override
  FutureFailureOr<Wallet> unlockWithCoins({
    required String episodeId,
    required int coinCost,
  }) async {
    if (coinCost < 0) {
      return left(const ServerFailure('Invalid coin cost'));
    }
    try {
      final wallet = await _currentWallet();
      final unlocked = await _store.readUnlockedEpisodeIds();
      if (unlocked.contains(episodeId)) {
        return right(wallet.toEntity());
      }
      if (wallet.coinBalance < coinCost) {
        return left(const ServerFailure('Insufficient coins'));
      }

      final updated = wallet.copyWith(coinBalance: wallet.coinBalance - coinCost);
      await _store.writeWallet(updated);
      await _store.writeUnlockedEpisodeIds(<String>{...unlocked, episodeId});
      await Future<void>.delayed(unlockLatency);
      return right(updated.toEntity());
    } on Object catch (error) {
      return left(CacheFailure('The unlock could not be saved.', error));
    }
  }

  @override
  FutureFailureOr<Wallet> unlockWithRewardedAd({
    required String episodeId,
  }) async {
    try {
      await Future<void>.delayed(adLatency);
      final wallet = await _currentWallet();
      final unlocked = await _store.readUnlockedEpisodeIds();
      if (!unlocked.contains(episodeId)) {
        await _store.writeUnlockedEpisodeIds(<String>{...unlocked, episodeId});
      }
      return right(wallet.toEntity());
    } on Object catch (error) {
      return left(CacheFailure('The unlock could not be saved.', error));
    }
  }

  @override
  FutureFailureOr<List<CoinPackage>> getCoinPackages() async => right(packages);

  @override
  FutureFailureOr<Wallet> purchaseCoinPackage(CoinPackage package) async {
    try {
      final wallet = await _currentWallet();
      final updated = wallet.copyWith(
        coinBalance: wallet.coinBalance + package.totalCoins,
      );
      await _store.writeWallet(updated);
      return right(updated.toEntity());
    } on Object catch (error) {
      return left(CacheFailure('The purchase could not be saved.', error));
    }
  }

  /// The stored wallet, seeding the new-user balance on first use.
  Future<WalletModel> _currentWallet() async {
    final stored = await _store.readWallet();
    if (stored != null) {
      return stored;
    }
    const seed = WalletModel.initial();
    await _store.writeWallet(seed);
    return seed;
  }
}
