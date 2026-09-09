// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'storage_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Process-wide secure storage. Override in tests with a fake implementation.

@ProviderFor(secureStorageService)
final secureStorageServiceProvider = SecureStorageServiceProvider._();

/// Process-wide secure storage. Override in tests with a fake implementation.

final class SecureStorageServiceProvider
    extends
        $FunctionalProvider<
          ISecureStorageService,
          ISecureStorageService,
          ISecureStorageService
        >
    with $Provider<ISecureStorageService> {
  /// Process-wide secure storage. Override in tests with a fake implementation.
  SecureStorageServiceProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'secureStorageServiceProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$secureStorageServiceHash();

  @$internal
  @override
  $ProviderElement<ISecureStorageService> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  ISecureStorageService create(Ref ref) {
    return secureStorageService(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(ISecureStorageService value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<ISecureStorageService>(value),
    );
  }
}

String _$secureStorageServiceHash() =>
    r'e79975cbee0feffd946dde9588948c27b6326076';
