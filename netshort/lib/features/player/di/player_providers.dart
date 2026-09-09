import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../services/preload_manager.dart';

part 'player_providers.g.dart';

/// The feed's decoder window. Auto-disposed with the feed screen, which
/// releases every hardware decoder as soon as the feed is left.
@riverpod
PreloadManager preloadManager(Ref ref) {
  final manager = PreloadManager();
  ref.onDispose(manager.dispose);
  return manager;
}
