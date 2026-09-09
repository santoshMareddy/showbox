/// Pricing rules shared by the paywall UI and the wallet logic.
abstract final class PaywallRules {
  /// Coins charged to unlock one episode.
  static const int episodeUnlockCost = 10;

  /// Coins a brand-new wallet starts with.
  static const int newUserCoins = 100;
}
