// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'paywall_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// The Hive-backed wallet store.

@ProviderFor(walletLocalDataSource)
final walletLocalDataSourceProvider = WalletLocalDataSourceProvider._();

/// The Hive-backed wallet store.

final class WalletLocalDataSourceProvider
    extends
        $FunctionalProvider<
          WalletLocalDataSource,
          WalletLocalDataSource,
          WalletLocalDataSource
        >
    with $Provider<WalletLocalDataSource> {
  /// The Hive-backed wallet store.
  WalletLocalDataSourceProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'walletLocalDataSourceProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$walletLocalDataSourceHash();

  @$internal
  @override
  $ProviderElement<WalletLocalDataSource> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  WalletLocalDataSource create(Ref ref) {
    return walletLocalDataSource(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(WalletLocalDataSource value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<WalletLocalDataSource>(value),
    );
  }
}

String _$walletLocalDataSourceHash() =>
    r'1cae019113847e4c802b0752511608128d192ef6';

/// Coins, entitlements and the coin store. Override in tests.

@ProviderFor(paywallRepository)
final paywallRepositoryProvider = PaywallRepositoryProvider._();

/// Coins, entitlements and the coin store. Override in tests.

final class PaywallRepositoryProvider
    extends
        $FunctionalProvider<
          PaywallRepository,
          PaywallRepository,
          PaywallRepository
        >
    with $Provider<PaywallRepository> {
  /// Coins, entitlements and the coin store. Override in tests.
  PaywallRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'paywallRepositoryProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$paywallRepositoryHash();

  @$internal
  @override
  $ProviderElement<PaywallRepository> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  PaywallRepository create(Ref ref) {
    return paywallRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(PaywallRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<PaywallRepository>(value),
    );
  }
}

String _$paywallRepositoryHash() => r'f4f02a321c47a3bceffa13ef91bd53b970db94dc';

/// The packages on sale. A repository failure surfaces as the thrown
/// [Failure], which the UI renders as `AsyncError`.

@ProviderFor(coinPackages)
final coinPackagesProvider = CoinPackagesProvider._();

/// The packages on sale. A repository failure surfaces as the thrown
/// [Failure], which the UI renders as `AsyncError`.

final class CoinPackagesProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<CoinPackage>>,
          List<CoinPackage>,
          FutureOr<List<CoinPackage>>
        >
    with
        $FutureModifier<List<CoinPackage>>,
        $FutureProvider<List<CoinPackage>> {
  /// The packages on sale. A repository failure surfaces as the thrown
  /// [Failure], which the UI renders as `AsyncError`.
  CoinPackagesProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'coinPackagesProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$coinPackagesHash();

  @$internal
  @override
  $FutureProviderElement<List<CoinPackage>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<CoinPackage>> create(Ref ref) {
    return coinPackages(ref);
  }
}

String _$coinPackagesHash() => r'9e7fc45100a174a55738e710ef64fc7e929c2e4a';
