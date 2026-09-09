import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../data/repositories/feed_repository_impl.dart';
import '../domain/repositories/feed_repository.dart';

part 'feed_providers.g.dart';

/// The feed source. Swap the implementation here when the feed API lands.
@Riverpod(keepAlive: true)
FeedRepository feedRepository(Ref ref) => const SampleFeedRepository();
