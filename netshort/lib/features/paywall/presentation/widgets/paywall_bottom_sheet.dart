import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../core/errors/failures.dart';
import '../../../feed/domain/entities/episode.dart';
import '../../di/paywall_providers.dart';
import '../../domain/entities/coin_package.dart';
import '../../domain/entities/wallet.dart';
import '../../domain/paywall_rules.dart';
import '../controllers/wallet_controller.dart';

/// What is currently in flight, so exactly one control shows a spinner.
enum _Busy { none, coins, ad }

/// The slide-up paywall for a locked episode.
///
/// Pops with `true` as soon as the episode is unlocked, by coins or by the
/// rewarded ad. Dismissing it any other way pops with `null`. The build is
/// deliberately flat and mostly `const` so the sheet's slide animation never
/// competes with layout work.
class PaywallBottomSheet extends ConsumerStatefulWidget {
  const PaywallBottomSheet({
    required this.episode,
    this.coinCost = PaywallRules.episodeUnlockCost,
    super.key,
  });

  final Episode episode;
  final int coinCost;

  /// Slides the sheet up. Resolves to `true` when the episode was unlocked.
  static Future<bool?> show(BuildContext context, {required Episode episode}) =>
      showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        useSafeArea: true,
        backgroundColor: Colors.transparent,
        barrierColor: const Color(0x99000000),
        builder: (BuildContext context) => PaywallBottomSheet(episode: episode),
      );

  @override
  ConsumerState<PaywallBottomSheet> createState() => _PaywallBottomSheetState();
}

class _PaywallBottomSheetState extends ConsumerState<PaywallBottomSheet> {
  _Busy _busy = _Busy.none;
  String? _purchasingPackageId;
  String? _error;

  bool get _isIdle => _busy == _Busy.none && _purchasingPackageId == null;

  WalletController get _wallet => ref.read(walletControllerProvider.notifier);

  Future<void> _unlockWithCoins() async {
    if (!_isIdle) {
      return;
    }
    setState(() {
      _busy = _Busy.coins;
      _error = null;
    });
    final unlocked = await _wallet.unlockEpisodeWithCoins(
      widget.episode.id,
      widget.coinCost,
    );
    if (!mounted) {
      return;
    }
    if (unlocked) {
      Navigator.of(context).pop(true);
      return;
    }
    setState(() {
      _busy = _Busy.none;
      _error = _wallet.lastFailure?.message ??
          'The episode could not be unlocked. Please try again.';
    });
  }

  Future<void> _unlockWithAd() async {
    if (!_isIdle) {
      return;
    }
    setState(() {
      _busy = _Busy.ad;
      _error = null;
    });
    final unlocked = await _wallet.unlockEpisodeWithAd(widget.episode.id);
    if (!mounted) {
      return;
    }
    if (unlocked) {
      Navigator.of(context).pop(true);
      return;
    }
    setState(() {
      _busy = _Busy.none;
      _error = _wallet.lastFailure?.message ??
          'The ad could not be completed. Please try again.';
    });
  }

  Future<void> _buy(CoinPackage package) async {
    if (!_isIdle) {
      return;
    }
    setState(() {
      _purchasingPackageId = package.id;
      _error = null;
    });
    await _wallet.buyPackage(package);
    if (!mounted) {
      return;
    }
    setState(() {
      _purchasingPackageId = null;
      _error = _wallet.lastFailure?.message;
    });
  }

  @override
  Widget build(BuildContext context) {
    final wallet = ref.watch(walletControllerProvider);
    final packages = ref.watch(coinPackagesProvider);
    final textTheme = Theme.of(context).textTheme;
    final balance = wallet.value?.coinBalance;
    final shortfall = balance == null ? 0 : widget.coinCost - balance;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.sheetBackground,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            const _DragHandle(),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      _LockedChip(episodeNumber: widget.episode.episodeNumber),
                      const SizedBox(height: 10),
                      Text(
                        widget.episode.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                          height: 1.2,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                _CoinBadge(wallet: wallet),
              ],
            ),
            const SizedBox(height: 22),
            FilledButton(
              onPressed: _isIdle ? _unlockWithCoins : null,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.brandPrimary,
                disabledBackgroundColor: AppColors.brandPrimary.withValues(
                  alpha: 0.55,
                ),
                foregroundColor: AppColors.textPrimary,
                disabledForegroundColor: AppColors.textPrimary,
              ),
              child: _busy == _Busy.coins
                  ? const _ButtonSpinner()
                  : Text(
                      'Unlock Episode (${widget.coinCost} Coins)',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
            ),
            if (shortfall > 0) ...<Widget>[
              const SizedBox(height: 8),
              Text(
                'You need $shortfall more coins. Top up below.',
                textAlign: TextAlign.center,
                style: textTheme.bodySmall?.copyWith(color: AppColors.coinGold),
              ),
            ],
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: _isIdle ? _unlockWithAd : null,
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(52),
                foregroundColor: AppColors.textPrimary,
                side: const BorderSide(color: Color(0x55FFFFFF)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              icon: _busy == _Busy.ad
                  ? const SizedBox.shrink()
                  : const Icon(Icons.play_circle_outline_rounded),
              label: _busy == _Busy.ad
                  ? const _ButtonSpinner()
                  : const Text(
                      'Watch Short Ad to Unlock (+Free)',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
            ),
            if (_error != null) ...<Widget>[
              const SizedBox(height: 12),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: textTheme.bodySmall?.copyWith(
                  color: AppColors.brandPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
            const SizedBox(height: 26),
            Text(
              'Top up coins',
              style: textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.w700,
                letterSpacing: 0.4,
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 136,
              child: switch (packages) {
                AsyncData<List<CoinPackage>>(:final value) =>
                  ListView.separated(
                    scrollDirection: Axis.horizontal,
                    clipBehavior: Clip.none,
                    itemCount: value.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 12),
                    itemBuilder: (BuildContext context, int index) {
                      final package = value[index];
                      return _PackageCard(
                        package: package,
                        busy: _purchasingPackageId == package.id,
                        enabled: _isIdle,
                        onTap: () => _buy(package),
                      );
                    },
                  ),
                AsyncError<List<CoinPackage>>(:final error) => Center(
                    child: Text(
                      error is Failure
                          ? error.message
                          : 'The coin store is unavailable right now.',
                      style: textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                _ => const Center(
                    child: SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
              },
            ),
            const SizedBox(height: 10),
            Text(
              'Prices in USD.',
              style: textTheme.bodySmall?.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DragHandle extends StatelessWidget {
  const _DragHandle();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 40,
        height: 4,
        decoration: BoxDecoration(
          color: const Color(0x4DFFFFFF),
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }
}

class _LockedChip extends StatelessWidget {
  const _LockedChip({required this.episodeNumber});

  final int episodeNumber;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0x26E11D48),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0x66E11D48)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          const Icon(
            Icons.lock_rounded,
            size: 12,
            color: AppColors.brandPrimary,
          ),
          const SizedBox(width: 5),
          Text(
            'Episode $episodeNumber Locked',
            style: const TextStyle(
              color: AppColors.brandPrimary,
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.6,
            ),
          ),
        ],
      ),
    );
  }
}

/// The live coin balance in gold; a spinner while the wallet loads.
class _CoinBadge extends StatelessWidget {
  const _CoinBadge({required this.wallet});

  final AsyncValue<Wallet> wallet;

  @override
  Widget build(BuildContext context) {
    final Widget value = switch (wallet) {
      AsyncData<Wallet>(:final value) => Text(
          '${value.coinBalance}',
          style: const TextStyle(
            color: AppColors.coinGold,
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
        ),
      AsyncError<Wallet>() => const Text(
          '--',
          style: TextStyle(
            color: AppColors.coinGold,
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
        ),
      _ => const SizedBox(
          width: 14,
          height: 14,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: AppColors.coinGold,
          ),
        ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0x1AFBBF24),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: const Color(0x55FBBF24)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          const Icon(
            Icons.monetization_on_rounded,
            size: 18,
            color: AppColors.coinGold,
          ),
          const SizedBox(width: 6),
          value,
        ],
      ),
    );
  }
}

class _PackageCard extends StatelessWidget {
  const _PackageCard({
    required this.package,
    required this.busy,
    required this.enabled,
    required this.onTap,
  });

  final CoinPackage package;
  final bool busy;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final tag = package.badgeTag;
    final highlighted = tag != null;

    return Material(
      color: AppColors.surfaceRaised,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: enabled ? onTap : null,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: 148,
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: highlighted ? const Color(0x88FBBF24) : AppColors.outline,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              SizedBox(
                height: 18,
                child: tag == null
                    ? null
                    : Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: AppColors.coinGold,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          tag,
                          style: const TextStyle(
                            color: AppColors.pureBlack,
                            fontSize: 9.5,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.6,
                          ),
                        ),
                      ),
              ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: <Widget>[
                  Text(
                    '${package.coins}',
                    style: textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: AppColors.coinGold,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'coins',
                    style: textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              Text(
                package.bonusCoins > 0
                    ? '+${package.bonusCoins} bonus'
                    : 'no bonus',
                style: textTheme.bodySmall?.copyWith(
                  color: package.bonusCoins > 0
                      ? AppColors.coinGold
                      : AppColors.textTertiary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              Container(
                height: 30,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0x14FFFFFF),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: busy
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(
                        '\$${package.priceUsd.toStringAsFixed(2)}',
                        style: textTheme.labelLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ButtonSpinner extends StatelessWidget {
  const _ButtonSpinner();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 20,
      height: 20,
      child: CircularProgressIndicator(
        strokeWidth: 2.2,
        color: AppColors.textPrimary,
      ),
    );
  }
}
