import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:netshort/features/feed/data/repositories/feed_repository_impl.dart';
import 'package:netshort/features/feed/di/feed_providers.dart';
import 'package:netshort/features/feed/domain/entities/episode.dart';
import 'package:netshort/features/feed/presentation/controllers/feed_controller.dart';
import 'package:netshort/features/feed/presentation/controllers/feed_state.dart';
import 'package:netshort/features/paywall/presentation/controllers/unlocked_episodes.dart';

void main() {
  late ProviderContainer container;

  Iterable<String> lockedIds() => container
      .read(feedControllerProvider)
      .loadedEpisodes
      .where((Episode e) => e.isLocked)
      .map((Episode e) => e.id);

  setUp(() {
    container = ProviderContainer.test(
      overrides: [
        feedRepositoryProvider.overrideWithValue(const SampleFeedRepository()),
      ],
    );
    // Keeps the auto-disposed controller alive for the test.
    container.listen<FeedState>(feedControllerProvider, (_, _) {});
  });

  test('loads the sample feed with its two locked episodes', () async {
    await pumpEventQueue();

    expect(container.read(feedControllerProvider).loadedEpisodes, hasLength(10));
    expect(lockedIds(), <String>['saltwater-2', 'saltwater-3']);
  });

  test('a live unlock event flips the episode to unlocked', () async {
    await pumpEventQueue();

    container.read(unlockedEpisodesProvider.notifier).add('saltwater-2');

    expect(lockedIds(), <String>['saltwater-3']);
  });

  test('unlocks known before the feed loads are applied on load', () async {
    container.read(unlockedEpisodesProvider.notifier).add('saltwater-3');

    await pumpEventQueue();

    expect(lockedIds(), <String>['saltwater-2']);
  });

  test('markUnlocked publishes the change without touching other state',
      () async {
    await pumpEventQueue();
    final controller = container.read(feedControllerProvider.notifier);
    controller.setActiveIndex(8);
    controller.toggleLike('saltwater-2');

    controller.markUnlocked('saltwater-2');

    final state = container.read(feedControllerProvider);
    expect(state.activeIndex, 8);
    expect(state.isLiked('saltwater-2'), isTrue);
    expect(lockedIds(), <String>['saltwater-3']);
  });

  test('an unlock for an unknown id leaves the feed untouched', () async {
    await pumpEventQueue();
    final before = container.read(feedControllerProvider).episodes;

    container.read(unlockedEpisodesProvider.notifier).add('nope');

    expect(identical(container.read(feedControllerProvider).episodes, before),
        isTrue);
  });
}
