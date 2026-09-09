import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/errors/failures.dart';
import '../data/datasources/wallet_local_data_source.dart';
import '../data/repositories/paywall_repository_impl.dart';
import '../domain/entities/coin_package.dart';
import '../domain/repositories/paywall_repository.dart';

part 'paywall_providers.g.dart';

/// The Hive-backed wallet store.
@Riverpod(keepAlive: true)
WalletLocalDataSource walletLocalDataSource(Ref ref) =>
    HiveWalletLocalDataSource();

/// Coins, entitlements and the coin store. Override in tests.
@Riverpod(keepAlive: true)
PaywallRepository paywallRepository(Ref ref) =>
    PaywallRepositoryImpl(store: ref.watch(walletLocalDataSourceProvider));

/// The packages on sale. A repository failure surfaces as the thrown
/// [Failure], which the UI renders as `AsyncError`.
@riverpod
Future<List<CoinPackage>> coinPackages(Ref ref) async {
  final result = await ref.watch(paywallRepositoryProvider).getCoinPackages();
  return result.getOrElse((Failure failure) => throw failure);
}
