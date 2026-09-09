import 'package:netshort/features/paywall/data/datasources/wallet_local_data_source.dart';
import 'package:netshort/features/paywall/data/models/wallet_model.dart';

/// [WalletLocalDataSource] that lives in memory; records every write.
final class InMemoryWalletLocalDataSource implements WalletLocalDataSource {
  InMemoryWalletLocalDataSource({
    this._wallet,
    Set<String> unlocked = const <String>{},
  }) : _unlocked = <String>{...unlocked};

  WalletModel? _wallet;
  Set<String> _unlocked;
  int walletWrites = 0;
  int unlockedWrites = 0;

  WalletModel? get wallet => _wallet;
  Set<String> get unlocked => Set<String>.unmodifiable(_unlocked);

  @override
  Future<WalletModel?> readWallet() async => _wallet;

  @override
  Future<void> writeWallet(WalletModel wallet) async {
    _wallet = wallet;
    walletWrites++;
  }

  @override
  Future<Set<String>> readUnlockedEpisodeIds() async =>
      Set<String>.of(_unlocked);

  @override
  Future<void> writeUnlockedEpisodeIds(Set<String> episodeIds) async {
    _unlocked = Set<String>.of(episodeIds);
    unlockedWrites++;
  }
}
