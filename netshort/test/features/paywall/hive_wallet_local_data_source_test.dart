import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:hive_ce/hive_ce.dart';
import 'package:netshort/features/paywall/data/datasources/wallet_local_data_source.dart';
import 'package:netshort/features/paywall/data/models/wallet_model.dart';

void main() {
  late Directory directory;

  setUp(() async {
    directory = await Directory.systemTemp.createTemp('netshort_wallet_box_');
    Hive.init(directory.path);
  });

  tearDown(() async {
    await Hive.close();
    await directory.delete(recursive: true);
  });

  test('a fresh box has no wallet and no unlocks', () async {
    final source = HiveWalletLocalDataSource();

    expect(await source.readWallet(), isNull);
    expect(await source.readUnlockedEpisodeIds(), isEmpty);
  });

  test('round-trips the wallet, including the VIP expiry', () async {
    final source = HiveWalletLocalDataSource();
    final wallet = WalletModel(
      coinBalance: 260,
      isVip: true,
      vipExpiresAt: DateTime.utc(2027, 1, 31, 12),
    );

    await source.writeWallet(wallet);
    await Hive.box<dynamic>(HiveWalletLocalDataSource.boxName).close();

    expect(await HiveWalletLocalDataSource().readWallet(), wallet);
  });

  test('round-trips the unlocked episode ids', () async {
    final source = HiveWalletLocalDataSource();

    await source.writeUnlockedEpisodeIds(<String>{'ashfall-3', 'saltwater-2'});

    expect(
      await source.readUnlockedEpisodeIds(),
      <String>{'ashfall-3', 'saltwater-2'},
    );
  });

  test('rejects a malformed stored wallet', () async {
    final box = await Hive.openBox<dynamic>(HiveWalletLocalDataSource.boxName);
    await box.put('wallet', <String, Object?>{'coinBalance': 'lots'});

    expect(HiveWalletLocalDataSource().readWallet, throwsFormatException);
  });
}
