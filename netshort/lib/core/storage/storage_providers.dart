import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'secure_storage_service.dart';

part 'storage_providers.g.dart';

/// Process-wide secure storage. Override in tests with a fake implementation.
@Riverpod(keepAlive: true)
ISecureStorageService secureStorageService(Ref ref) => SecureStorageService();
