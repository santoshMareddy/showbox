import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../storage/storage_providers.dart';
import 'dio_client.dart';

part 'network_providers.g.dart';

/// Counts the times the API rejected the refresh token and the stored
/// session was wiped. Features listen to it to react to a forced sign-out
/// without the network layer depending on them.
@Riverpod(keepAlive: true)
class SessionExpiry extends _$SessionExpiry {
  @override
  int build() => 0;

  /// Records one more expiry event.
  void notify() => state = state + 1;
}

/// The shared HTTP client. Kept alive for the whole process.
@Riverpod(keepAlive: true)
Dio dio(Ref ref) {
  final client = createDioClient(
    storage: ref.watch(secureStorageServiceProvider),
    enableLogging: kDebugMode,
    onSessionExpired: ref.read(sessionExpiryProvider.notifier).notify,
  );
  ref.onDispose(client.close);
  return client;
}
