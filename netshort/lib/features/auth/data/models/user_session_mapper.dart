import '../../domain/entities/user_session.dart';

/// Converts [UserSession] to and from the map stored in the Hive session box.
abstract final class UserSessionMapper {
  static const String _userId = 'userId';
  static const String _email = 'email';
  static const String _coinBalance = 'coinBalance';
  static const String _isVip = 'isVip';

  static Map<String, Object?> toMap(UserSession session) => <String, Object?>{
        _userId: session.userId,
        _email: session.email,
        _coinBalance: session.coinBalance,
        _isVip: session.isVip,
      };

  /// Throws a [FormatException] when [map] does not describe a valid session.
  static UserSession fromMap(Map<Object?, Object?> map) {
    final Object? userId = map[_userId];
    final Object? email = map[_email];
    final Object? coinBalance = map[_coinBalance];
    final Object? isVip = map[_isVip];

    if (userId is! String ||
        userId.isEmpty ||
        email is! String ||
        coinBalance is! int ||
        coinBalance < 0 ||
        isVip is! bool) {
      throw FormatException('Stored session is malformed', map);
    }

    return UserSession(
      userId: userId,
      email: email,
      coinBalance: coinBalance,
      isVip: isVip,
    );
  }
}
