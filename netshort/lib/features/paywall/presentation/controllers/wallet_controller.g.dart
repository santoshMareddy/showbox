// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Owns the wallet for the whole app and performs every coin operation.
///
/// Coin deductions are optimistic: the new balance is published before the
/// repository answers and restored if it refuses. Each action method returns
/// whether it succeeded; the reason for a failure is in [lastFailure].

@ProviderFor(WalletController)
final walletControllerProvider = WalletControllerProvider._();

/// Owns the wallet for the whole app and performs every coin operation.
///
/// Coin deductions are optimistic: the new balance is published before the
/// repository answers and restored if it refuses. Each action method returns
/// whether it succeeded; the reason for a failure is in [lastFailure].
final class WalletControllerProvider
    extends $NotifierProvider<WalletController, AsyncValue<Wallet>> {
  /// Owns the wallet for the whole app and performs every coin operation.
  ///
  /// Coin deductions are optimistic: the new balance is published before the
  /// repository answers and restored if it refuses. Each action method returns
  /// whether it succeeded; the reason for a failure is in [lastFailure].
  WalletControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'walletControllerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$walletControllerHash();

  @$internal
  @override
  WalletController create() => WalletController();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AsyncValue<Wallet> value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AsyncValue<Wallet>>(value),
    );
  }
}

String _$walletControllerHash() => r'd9b88281d652dcce88e927a60ab7eb39fe1b1078';

/// Owns the wallet for the whole app and performs every coin operation.
///
/// Coin deductions are optimistic: the new balance is published before the
/// repository answers and restored if it refuses. Each action method returns
/// whether it succeeded; the reason for a failure is in [lastFailure].

abstract class _$WalletController extends $Notifier<AsyncValue<Wallet>> {
  AsyncValue<Wallet> build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<AsyncValue<Wallet>, AsyncValue<Wallet>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<Wallet>, AsyncValue<Wallet>>,
              AsyncValue<Wallet>,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}
