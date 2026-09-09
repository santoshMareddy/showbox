import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/routes/app_routes.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../paywall/presentation/controllers/wallet_controller.dart';
import '../controllers/auth_controller.dart';

/// First screen. Shows the NetShort brand while the stored session is
/// restored, then moves on to the feed.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  /// The brand stays on screen at least this long, even when storage answers
  /// instantly, so the launch never flashes.
  static const Duration _minimumDisplay = Duration(milliseconds: 1400);
  static const Duration _revealDuration = Duration(milliseconds: 900);

  late final AnimationController _reveal;
  late final Animation<double> _opacity;
  late final Animation<Offset> _offset;

  @override
  void initState() {
    super.initState();
    _reveal = AnimationController(vsync: this, duration: _revealDuration)
      ..forward();
    final curve = CurvedAnimation(parent: _reveal, curve: Curves.easeOutCubic);
    _opacity = curve;
    _offset = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(curve);
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final auth = ref.read(authControllerProvider.notifier);
    final wallet = ref.read(walletControllerProvider.notifier);
    await Future.wait<void>(<Future<void>>[
      auth.restoreSession(),
      wallet.loadWallet(),
      Future<void>.delayed(_minimumDisplay),
    ]);
    if (!mounted) {
      return;
    }
    context.go(AppRoutes.feed);
  }

  @override
  void dispose() {
    _reveal.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    return Scaffold(
      backgroundColor: AppColors.pureBlack,
      body: Stack(
        fit: StackFit.expand,
        children: <Widget>[
          const _BackdropGlow(),
          Center(
            child: FadeTransition(
              opacity: _opacity,
              child: SlideTransition(
                position: _offset,
                child: const _Wordmark(),
              ),
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: bottomInset + 48,
            child: FadeTransition(
              opacity: _opacity,
              child: const _LoadingFooter(),
            ),
          ),
        ],
      ),
    );
  }
}

class _BackdropGlow extends StatelessWidget {
  const _BackdropGlow();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: RadialGradient(
          center: const Alignment(0, -0.2),
          radius: 0.9,
          colors: <Color>[
            AppColors.brandPrimary.withValues(alpha: 0.22),
            AppColors.pureBlack,
          ],
        ),
      ),
    );
  }
}

class _Wordmark extends StatelessWidget {
  const _Wordmark();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        const _LogoMark(),
        const SizedBox(height: 24),
        Text.rich(
          const TextSpan(
            children: <InlineSpan>[
              TextSpan(
                text: 'Net',
                style: TextStyle(color: AppColors.textPrimary),
              ),
              TextSpan(
                text: 'Short',
                style: TextStyle(color: AppColors.brandPrimary),
              ),
            ],
          ),
          style: textTheme.displaySmall?.copyWith(
            fontWeight: FontWeight.w800,
            letterSpacing: -1.2,
            height: 1,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'SHORT DRAMAS. BIG FEELINGS.',
          style: textTheme.labelSmall?.copyWith(
            color: AppColors.textSecondary,
            letterSpacing: 2.4,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _LogoMark extends StatelessWidget {
  const _LogoMark();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 88,
      height: 88,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(26),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[AppColors.brandPrimary, AppColors.brandPrimaryDeep],
        ),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: AppColors.brandPrimary.withValues(alpha: 0.45),
            blurRadius: 32,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: const Icon(
        Icons.play_arrow_rounded,
        size: 52,
        color: AppColors.textPrimary,
      ),
    );
  }
}

class _LoadingFooter extends StatelessWidget {
  const _LoadingFooter();

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        SizedBox(
          width: 88,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: const LinearProgressIndicator(
              minHeight: 3,
              backgroundColor: AppColors.outline,
              color: AppColors.brandPrimary,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'Preparing your feed',
          style: textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
        ),
      ],
    );
  }
}
