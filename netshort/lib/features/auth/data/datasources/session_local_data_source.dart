import 'package:hive_ce/hive_ce.dart';

import '../../domain/entities/user_session.dart';
import '../models/user_session_mapper.dart';

/// Device-local cache of the signed-in profile (not secret: the tokens live in
/// secure storage).
abstract interface class SessionLocalDataSource {
  Future<UserSession?> read();

  Future<void> write(UserSession session);

  Future<void> clear();
}

/// [SessionLocalDataSource] stored in a Hive box. `Hive.initFlutter()` must
/// have run before the first call.
final class HiveSessionLocalDataSource implements SessionLocalDataSource {
  HiveSessionLocalDataSource({HiveInterface? hive}) : _hive = hive ?? Hive;

  /// Name of the Hive box holding the session.
  static const String boxName = 'netshort_session';

  static const String _currentKey = 'current';

  final HiveInterface _hive;

  Future<Box<Map<dynamic, dynamic>>> _openBox() async {
    if (_hive.isBoxOpen(boxName)) {
      return _hive.box<Map<dynamic, dynamic>>(boxName);
    }
    return _hive.openBox<Map<dynamic, dynamic>>(boxName);
  }

  @override
  Future<UserSession?> read() async {
    final box = await _openBox();
    final raw = box.get(_currentKey);
    if (raw == null) {
      return null;
    }
    return UserSessionMapper.fromMap(raw);
  }

  @override
  Future<void> write(UserSession session) async {
    final box = await _openBox();
    await box.put(_currentKey, UserSessionMapper.toMap(session));
  }

  @override
  Future<void> clear() async {
    final box = await _openBox();
    await box.delete(_currentKey);
  }
}
