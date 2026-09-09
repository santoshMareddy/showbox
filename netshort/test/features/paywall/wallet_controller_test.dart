import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fpdart/fpdart.dart';
import 'package:netshort/core/errors/failures.dart';
import 'package:netshort/core/utils/typedefs.dart';
import 'package:netshort/features/paywall/data/models/wallet_model.dart';
import 'package:netshort/features/paywall/data/repositories/paywall_repository_impl.dart';
import 'package:netshort/features/paywall/di/paywall_providers.dart';
import 'package:netshort/features/paywall/domain/entities/coin_package.dart';
import 'package:netshort/features/paywall/domain/entities/wallet.dart';
import 'package:netshort/features/paywall/domain/paywall_rules.dart';
import 'package:netshort/features/paywall/domain/repositories/paywall_repository.dart';
import 'package:netshort/features/paywall/presentation/controllers/unlocked_episodes.dart';
import 'package:netshort/features/paywall/presentation/controllers/wallet_controller.dart';

import 'in_memory_wallet_local_data_source.dart';

void main() {
  late InMemoryWalletLocalDataSource store;

  ProviderContainer containerWith(PaywallRepository repository) =>
      ProviderContainer.test(
        overrides: [
          paywallRepositoryProvider.overrideWithValue(repository),
        ],
      );

  ProviderContainer container() => containerWith(
        PaywallRepositoryImpl(
          store: store,
          unlockLatency: Duration.zero,
          adLatency: Duration.zero,
        ),
      );

  setUp(() {
    store = InMemoryWalletLocalDataSource();
  });

  test('loads the new-user balance of 100 coins', () async {
    final c = container();
    final controller = c.read(walletControllerProvider.notifier);

    await controller.loadWallet();

    final wallet = c.read(walletControllerProvider).value;
    expect(wallet, const Wallet(coinBalance: 100, isVip: false));
    expect(wallet!.coinBalance, PaywallRules.newUserCoins);
    expect(wallet.hasActiveVip, isFalse);
    expect(store.wallet, const WalletModel.initial(),
        reason: 'the seed is persisted on first load');
  });

  test('restores the persisted balance and unlocks', () async {
    store = InMemoryWalletLocalDataSource(
      wallet: const WalletModel(coinBalance: 42, isVip: false),
      unlocked: <String>{'saltwater-2'},
    );
    final c = container();

    await c.read(walletControllerProvider.notifier).loadWallet();

    expect(c.read(walletControllerProvider).value?.coinBalance, 42);
    expect(c.read(unlockedEpisodesProvider), <String>{'saltwater-2'});
  });

  test('unlockEpisodeWithCoins deducts exactly 10 coins and returns true',
      () async {
    final c = container();
    final controller = c.read(walletControllerProvider.notifier);
    await controller.loadWallet();

    final unlocked = await controller.unlockEpisodeWithCoins(
      'saltwater-2',
      PaywallRules.episodeUnlockCost,
    );

    expect(unlocked, isTrue);
    expect(c.read(walletControllerProvider).value?.coinBalance, 90);
    expect(controller.lastFailure, isNull);
    expect(c.read(unlockedEpisodesProvider), contains('saltwater-2'));
    expect(store.wallet?.coinBalance, 90, reason: 'persisted');
    expect(store.unlocked, contains('saltwater-2'));
  });

  test('unlockEpisodeWithCoins returns false and keeps the balance when '
      'coins are insufficient', () async {
    store = InMemoryWalletLocalDataSource(
      wallet: const WalletModel(coinBalance: 5, isVip: false),
    );
    final c = container();
    final controller = c.read(walletControllerProvider.notifier);
    await controller.loadWallet();

    final unlocked = await controller.unlockEpisodeWithCoins('saltwater-2', 10);

    expect(unlocked, isFalse);
    expect(c.read(walletControllerProvider).value?.coinBalance, 5);
    expect(controller.lastFailure, const ServerFailure('Insufficient coins'));
    expect(c.read(unlockedEpisodesProvider), isEmpty);
    expect(store.unlocked, isEmpty);
  });

  test('the repository also refuses an unaffordable unlock', () async {
    store = InMemoryWalletLocalDataSource(
      wallet: const WalletModel(coinBalance: 5, isVip: false),
    );
    final repository = PaywallRepositoryImpl(
      store: store,
      unlockLatency: Duration.zero,
    );

    final result = await repository.unlockWithCoins(
      episodeId: 'saltwater-2',
      coinCost: 10,
    );

    expect(result, left<Failure, Wallet>(const ServerFailure('Insufficient coins')));
    expect(store.wallet?.coinBalance, 5);
  });

  test('rolls the optimistic deduction back when the repository fails',
      () async {
    final c = containerWith(_RejectingRepository());
    final controller = c.read(walletControllerProvider.notifier);
    await controller.loadWallet();
    final balances = <int>[];
    c.listen<AsyncValue<Wallet>>(
      walletControllerProvider,
      (AsyncValue<Wallet>? previous, AsyncValue<Wallet> next) {
        final balance = next.value?.coinBalance;
        if (balance != null) {
          balances.add(balance);
        }
      },
      fireImmediately: true,
    );

    final unlocked = await controller.unlockEpisodeWithCoins('saltwater-2', 10);

    expect(unlocked, isFalse);
    expect(balances, <int>[100, 90, 100],
        reason: 'deducted immediately, restored after the failure');
    expect(controller.lastFailure, isA<ServerFailure>());
    expect(c.read(unlockedEpisodesProvider), isEmpty);
  });

  test('an episode that is already unlocked is never charged twice',
      () async {
    final c = container();
    final controller = c.read(walletControllerProvider.notifier);
    await controller.loadWallet();

    expect(await controller.unlockEpisodeWithCoins('saltwater-2', 10), isTrue);
    expect(await controller.unlockEpisodeWithCoins('saltwater-2', 10), isTrue);

    expect(c.read(walletControllerProvider).value?.coinBalance, 90);
  });

  test('unlockEpisodeWithAd unlocks without spending coins', () async {
    final c = container();
    final controller = c.read(walletControllerProvider.notifier);
    await controller.loadWallet();

    final unlocked = await controller.unlockEpisodeWithAd('saltwater-3');

    expect(unlocked, isTrue);
    expect(c.read(walletControllerProvider).value?.coinBalance, 100);
    expect(c.read(unlockedEpisodesProvider), contains('saltwater-3'));
    expect(store.unlocked, contains('saltwater-3'));
  });

  test('buyPackage credits coins plus bonus', () async {
    final c = container();
    final controller = c.read(walletControllerProvider.notifier);
    await controller.loadWallet();
    final popular = PaywallRepositoryImpl.packages[1];
    expect(popular.badgeTag, 'POPULAR');

    await controller.buyPackage(popular);

    expect(c.read(walletControllerProvider).value?.coinBalance, 100 + 500 + 50);
    expect(controller.lastFailure, isNull);
    expect(store.wallet?.coinBalance, 650);
  });

  test('the coin store offers the three packages, cheapest first', () async {
    final c = container();

    final packages = await c.read(coinPackagesProvider.future);

    expect(packages.map((CoinPackage p) => p.totalCoins), <int>[100, 550, 1400]);
    expect(packages.map((CoinPackage p) => p.priceUsd), <double>[1.99, 7.99, 14.99]);
    expect(packages.map((CoinPackage p) => p.badgeTag),
        <String?>[null, 'POPULAR', 'BEST VALUE']);
  });
}

/// Serves a 100-coin wallet but refuses every unlock after a tick, so the
/// optimistic state is observable before the rollback.
final class _RejectingRepository implements PaywallRepository {
  @override
  FutureFailureOr<Wallet> getWallet() async =>
      right(const Wallet(coinBalance: 100, isVip: false));

  @override
  FutureFailureOr<Set<String>> getUnlockedEpisodeIds() async =>
      right(const <String>{});

  @override
  FutureFailureOr<Wallet> unlockWithCoins({
    required String episodeId,
    required int coinCost,
  }) async {
    await Future<void>.delayed(Duration.zero);
    return left(const ServerFailure('Payment service unavailable', statusCode: 503));
  }

  @override
  FutureFailureOr<Wallet> unlockWithRewardedAd({
    required String episodeId,
  }) async =>
      left(const ServerFailure('Ad inventory unavailable'));

  @override
  FutureFailureOr<List<CoinPackage>> getCoinPackages() async =>
      right(PaywallRepositoryImpl.packages);

  @override
  FutureFailureOr<Wallet> purchaseCoinPackage(CoinPackage package) async =>
      left(const ServerFailure('Store unavailable'));
}
