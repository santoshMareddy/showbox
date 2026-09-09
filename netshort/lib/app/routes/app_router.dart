import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/feed/presentation/screens/feed_screen.dart';
import 'app_routes.dart';
import 'route_error_screen.dart';

part 'app_router.g.dart';

/// The application's [GoRouter]. Kept alive so the navigation stack survives
/// for the life of the process and the root widget never rebuilds.
@Riverpod(keepAlive: true)
GoRouter appRouter(Ref ref) {
  final router = GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: kDebugMode,
    routes: <RouteBase>[
      GoRoute(
        path: AppRoutes.splash,
        name: AppRoutes.splashName,
        builder: (BuildContext context, GoRouterState state) =>
            const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.feed,
        name: AppRoutes.feedName,
        pageBuilder: (BuildContext context, GoRouterState state) =>
            CustomTransitionPage<void>(
          key: state.pageKey,
          child: const FeedScreen(),
          transitionDuration: const Duration(milliseconds: 350),
          transitionsBuilder: (
            BuildContext context,
            Animation<double> animation,
            Animation<double> secondaryAnimation,
            Widget child,
          ) =>
              FadeTransition(
            opacity: CurveTween(curve: Curves.easeOut).animate(animation),
            child: child,
          ),
        ),
      ),
    ],
    errorBuilder: (BuildContext context, GoRouterState state) =>
        RouteErrorScreen(error: state.error),
  );
  ref.onDispose(router.dispose);
  return router;
}
