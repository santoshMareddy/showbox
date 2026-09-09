import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../../core/errors/failures.dart';
import '../../di/paywall_providers.dart';
import '../../domain/entities/coin_package.dart';
import '../../domain/entities/wallet.dart';
import '../../domain/repositories/paywall_repository.dart';
import 'unlocked_episodes.dart';

part 'wallet_controller.g.dart';

/// Owns the wallet for the whole app and performs every coin operation.
///
/// Coin deductions are optimistic: the new balance is published before the
/// repository answers and restored if it refuses. Each action method returns
/// whether it succeeded; the reason for a failure is in [lastFailure].
@Riverpod(keepAlive: true)
class WalletController extends _$WalletController {
  Failure? _lastFailure;

  /// Why the most recent action failed, or `null` after a success.
  Failure? get lastFailure => _lastFailure;

  @override
  AsyncValue<Wallet> build() {
    Future<void>.microtask(loadWallet);
    return const AsyncValue<Wallet>.loading();
  }

  PaywallRepository get _repository => ref.read(paywallRepositoryProvider);

  UnlockedEpisodes get _unlocked => ref.read(unlockedEpisodesProvider.notifier);

  /// Loads the wallet and the persisted unlocks.
  Future<void> loadWallet() async {
    final walletFuture = _repository.getWallet();
    final unlockedFuture = _repository.getUnlockedEpisodeIds();
    final walletResult = await walletFuture;
    final unlockedResult = await unlockedFuture;
    if (!ref.mounted) {
      return;
    }
    unlockedResult.match((Failure _) {}, _unlocked.merge);
    state = walletResult.fold<AsyncValue<Wallet>>(
      (Failure failure) =>
          AsyncValue<Wallet>.error(failure, StackTrace.current),
      AsyncValue<Wallet>.data,
    );
  }

  /// Spends [cost] coins on [episodeId]. Returns `true` once the episode is
  /// unlocked; the balance is reduced immediately and rolled back on failure.
  Future<bool> unlockEpisodeWithCoins(String episodeId, int cost) async {
    _lastFailure = null;
    final current = await _ensureWallet();
    if (current == null) {
      return false;
    }
    if (!current.canAfford(cost)) {
      _lastFailure = const ServerFailure('Insufficient coins');
      return false;
    }

    state = AsyncValue<Wallet>.data(
      current.copyWith(coinBalance: current.coinBalance - cost),
    );

    final result = await _repository.unlockWithCoins(
      episodeId: episodeId,
      coinCost: cost,
    );
    if (!ref.mounted) {
      return false;
    }
    return result.fold<bool>(
      (Failure failure) {
        state = AsyncValue<Wallet>.data(current);
        _lastFailure = failure;
        return false;
      },
      (Wallet wallet) {
        state = AsyncValue<Wallet>.data(wallet);
        _unlocked.add(episodeId);
        return true;
      },
    );
  }

  /// Unlocks [episodeId] after the rewarded ad completes.
  Future<bool> unlockEpisodeWithAd(String episodeId) async {
    _lastFailure = null;
    final result = await _repository.unlockWithRewardedAd(episodeId: episodeId);
    if (!ref.mounted) {
      return false;
    }
    return result.fold<bool>(
      (Failure failure) {
        _lastFailure = failure;
        return false;
      },
      (Wallet wallet) {
        state = AsyncValue<Wallet>.data(wallet);
        _unlocked.add(episodeId);
        return true;
      },
    );
  }

  /// Buys [package]. Coins are credited only after the purchase succeeds;
  /// a failure is reported through [lastFailure].
  Future<void> buyPackage(CoinPackage package) async {
    _lastFailure = null;
    final result = await _repository.purchaseCoinPackage(package);
    if (!ref.mounted) {
      return;
    }
    result.match(
      (Failure failure) {
        _lastFailure = failure;
      },
      (Wallet wallet) {
        state = AsyncValue<Wallet>.data(wallet);
      },
    );
  }

  /// The loaded wallet, loading it first if needed. `null` (with
  /// [lastFailure] set) when the store is unreadable.
  Future<Wallet?> _ensureWallet() async {
    final current = state.value;
    if (current != null) {
      return current;
    }
    await loadWallet();
    final loaded = state.value;
    if (loaded == null) {
      final Object? error = state.error;
      _lastFailure = error is Failure
          ? error
          : const CacheFailure('The wallet is not available.');
    }
    return loaded;
  }
}
