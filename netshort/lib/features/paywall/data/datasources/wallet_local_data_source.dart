import 'package:hive_ce/hive_ce.dart';

import '../models/wallet_model.dart';

/// Device-local store of the wallet and the unlocked episode ids.
abstract interface class WalletLocalDataSource {
  /// The stored wallet, or `null` before the first write.
  Future<WalletModel?> readWallet();

  Future<void> writeWallet(WalletModel wallet);

  Future<Set<String>> readUnlockedEpisodeIds();

  Future<void> writeUnlockedEpisodeIds(Set<String> episodeIds);
}

/// [WalletLocalDataSource] in the Hive box `wallet_box`. `Hive.initFlutter()`
/// (or `Hive.init` in tests) must have run before the first call.
final class HiveWalletLocalDataSource implements WalletLocalDataSource {
  HiveWalletLocalDataSource({HiveInterface? hive}) : _hive = hive ?? Hive;

  /// Name of the Hive box.
  static const String boxName = 'wallet_box';

  static const String _walletKey = 'wallet';
  static const String _unlockedKey = 'unlocked_episodes';

  final HiveInterface _hive;

  Future<Box<dynamic>> _openBox() async {
    if (_hive.isBoxOpen(boxName)) {
      return _hive.box<dynamic>(boxName);
    }
    return _hive.openBox<dynamic>(boxName);
  }

  @override
  Future<WalletModel?> readWallet() async {
    final box = await _openBox();
    final Object? raw = box.get(_walletKey);
    if (raw == null) {
      return null;
    }
    if (raw is! Map) {
      throw FormatException('Stored wallet is not a map', raw);
    }
    return WalletModel.fromMap(raw);
  }

  @override
  Future<void> writeWallet(WalletModel wallet) async {
    final box = await _openBox();
    await box.put(_walletKey, wallet.toMap());
  }

  @override
  Future<Set<String>> readUnlockedEpisodeIds() async {
    final box = await _openBox();
    final Object? raw = box.get(_unlockedKey);
    if (raw is! List) {
      return <String>{};
    }
    return raw.whereType<String>().toSet();
  }

  @override
  Future<void> writeUnlockedEpisodeIds(Set<String> episodeIds) async {
    final box = await _openBox();
    await box.put(_unlockedKey, episodeIds.toList(growable: false));
  }
}
