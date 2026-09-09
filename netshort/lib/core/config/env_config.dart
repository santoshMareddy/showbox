/// Deployment environments NetShort can be built against.
///
/// The active environment is chosen at build time with a Dart define:
///
/// ```sh
/// flutter run --dart-define=NETSHORT_ENV=staging
/// ```
///
/// When the define is absent or unknown the app falls back to [Environment.dev].
enum Environment {
  dev('dev', 'https://api-dev.netshort.app/v1'),
  staging('staging', 'https://api-staging.netshort.app/v1'),
  prod('prod', 'https://api.netshort.app/v1');

  const Environment(this.flag, this.apiBaseUrl);

  /// Value accepted by the [EnvConfig.environmentDefine] Dart define.
  final String flag;

  /// Root URL of the REST API for this environment (no trailing slash).
  final String apiBaseUrl;

  /// Resolves [flag] case-insensitively, defaulting to [Environment.dev].
  static Environment fromFlag(String flag) {
    final normalized = flag.trim().toLowerCase();
    for (final environment in Environment.values) {
      if (environment.flag == normalized) {
        return environment;
      }
    }
    return Environment.dev;
  }
}

/// Static, build-time configuration shared by every layer of the app.
abstract final class EnvConfig {
  /// Name of the `--dart-define` that selects the [Environment].
  static const String environmentDefine = 'NETSHORT_ENV';

  static const String _flag = String.fromEnvironment(
    environmentDefine,
    defaultValue: 'dev',
  );

  /// The environment this build targets.
  static final Environment current = Environment.fromFlag(_flag);

  /// Root URL of the REST API for [current].
  static String get apiBaseUrl => current.apiBaseUrl;

  /// Whether this build talks to production services.
  static bool get isProduction => current == Environment.prod;

  /// Time allowed to open a connection to the API.
  static const Duration connectTimeout = Duration(seconds: 8);

  /// Time allowed between two consecutive chunks of a response.
  static const Duration receiveTimeout = Duration(seconds: 8);

  /// Time allowed to upload a request body.
  static const Duration sendTimeout = Duration(seconds: 8);
}
