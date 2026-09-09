import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/storage/storage_providers.dart';
import '../data/datasources/session_local_data_source.dart';
import '../data/repositories/auth_repository_impl.dart';
import '../domain/repositories/auth_repository.dart';

part 'auth_providers.g.dart';

/// The Hive-backed profile cache.
@Riverpod(keepAlive: true)
SessionLocalDataSource sessionLocalDataSource(Ref ref) =>
    HiveSessionLocalDataSource();

/// The auth repository wired to secure storage and the profile cache.
@Riverpod(keepAlive: true)
AuthRepository authRepository(Ref ref) => AuthRepositoryImpl(
      secureStorage: ref.watch(secureStorageServiceProvider),
      sessionStore: ref.watch(sessionLocalDataSourceProvider),
    );
