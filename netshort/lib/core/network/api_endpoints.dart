/// REST paths, relative to `EnvConfig.apiBaseUrl`.
abstract final class ApiEndpoints {
  // Auth
  static const String authLogin = '/auth/login';
  static const String authRegister = '/auth/register';
  static const String authRefresh = '/auth/refresh';
  static const String authLogout = '/auth/logout';

  // Current user
  static const String me = '/users/me';
  static const String walletBalance = '/wallet/balance';
  static const String walletUnlock = '/wallet/unlock';

  // Catalogue
  static const String showsFeed = '/shows/feed';
  static const String showsTrending = '/shows/trending';

  static String show(String showId) => '/shows/$showId';

  static String showEpisodes(String showId) => '/shows/$showId/episodes';

  static String episodePlayback(String episodeId) =>
      '/episodes/$episodeId/playback';

  /// Whether [path] is the token refresh call (which must never itself be
  /// retried through the auth interceptor).
  static bool isAuthRefresh(String path) => path.endsWith(authRefresh);
}
