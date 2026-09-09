import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_colors.dart';
import 'app_routes.dart';

/// Shown by the router for unknown locations, in the app's own dark style.
class RouteErrorScreen extends StatelessWidget {
  const RouteErrorScreen({required this.error, super.key});

  final Exception? error;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Scaffold(
      backgroundColor: AppColors.pureBlack,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const Icon(
                Icons.explore_off_rounded,
                size: 56,
                color: AppColors.brandPrimary,
              ),
              const SizedBox(height: 20),
              Text(
                'This page does not exist',
                style: textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                error?.toString() ??
                    'The link you followed is not part of NetShort.',
                style: textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),
              FilledButton(
                onPressed: () => context.go(AppRoutes.feed),
                child: const Text('Back to the feed'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
