import 'package:flutter_test/flutter_test.dart';
import 'package:media_kit/media_kit.dart';
import 'package:netshort/features/feed/domain/entities/episode.dart';
import 'package:netshort/features/player/services/preload_manager.dart';

void main() {
  late List<FakePlatformPlayer> created;
  late PreloadManager manager;

  List<Episode> episodes(int count, {Set<int> locked = const <int>{}}) =>
      List<Episode>.generate(
        count,
        (int index) => Episode(
          id: 'ep-$index',
          showId: 'show',
          episodeNumber: index + 1,
          videoUrl: 'https://cdn.example.com/ep-$index.mp4',
          thumbnailUrl: 'https://cdn.example.com/ep-$index.jpg',
          title: 'Episode ${index + 1}',
          isLocked: locked.contains(index),
        ),
      );

  FakePlatformPlayer fakeFor(int index) =>
      created.singleWhere((FakePlatformPlayer p) => p.index == index);

  setUp(() {
    created = <FakePlatformPlayer>[];
    manager = PreloadManager(
      createSlot: (Episode episode) {
        final fake = FakePlatformPlayer(
          index: int.parse(episode.id.split('-').last),
        );
        created.add(fake);
        return PlayerSlot(player: Player(platformPlayer: fake));
      },
    );
  });

  tearDown(() => manager.dispose());

  test('opens the first episode and its next neighbour on load', () async {
    manager.setEpisodes(episodes(10));
    await pumpEventQueue();

    expect(manager.players.keys, unorderedEquals(<int>[0, 1]));
    expect(fakeFor(0).openedUrl, 'https://cdn.example.com/ep-0.mp4');
    expect(fakeFor(0).openedWithPlay, isTrue);
    expect(fakeFor(1).openedWithPlay, isFalse);
    expect(fakeFor(1).pauseCalls, greaterThanOrEqualTo(1));
    expect(fakeFor(0).playlistMode, PlaylistMode.single);
  });

  test('shiftWindow keeps only [index - 1, index, index + 1] alive', () async {
    manager.setEpisodes(episodes(10));
    manager.shiftWindow(5);
    await pumpEventQueue();

    expect(manager.players.keys, unorderedEquals(<int>[4, 5, 6]));
    expect(fakeFor(0).disposed, isTrue);
    expect(fakeFor(1).disposed, isTrue);
    expect(fakeFor(5).playCalls, greaterThanOrEqualTo(1));
    expect(fakeFor(4).playCalls, 0);
    expect(fakeFor(6).playCalls, 0);
  });

  test('moving one page reuses two decoders and evicts the farthest',
      () async {
    manager.setEpisodes(episodes(10));
    manager.shiftWindow(5);
    await pumpEventQueue();
    final before = created.length;

    manager.shiftWindow(6);
    await pumpEventQueue();

    expect(manager.players.keys, unorderedEquals(<int>[5, 6, 7]));
    expect(created.length - before, 1, reason: 'only index 7 is new');
    expect(fakeFor(4).disposed, isTrue);
    expect(fakeFor(5).disposed, isFalse);
    expect(fakeFor(5).pauseCalls, greaterThanOrEqualTo(1));
    expect(fakeFor(6).playCalls, greaterThanOrEqualTo(1));
    expect(identical(manager.playerAt(6), manager.playerAt(6)), isTrue);
  });

  test('never holds more than three decoders while sweeping the feed',
      () async {
    manager.setEpisodes(episodes(10));
    for (var index = 0; index < 10; index++) {
      manager.shiftWindow(index);
      await pumpEventQueue();
      expect(manager.players.length, lessThanOrEqualTo(3));
      final alive = created.where((p) => !p.disposed).length;
      expect(alive, lessThanOrEqualTo(3));
    }
    expect(manager.players.keys, unorderedEquals(<int>[8, 9]));
  });

  test('locked episodes never get a decoder', () async {
    manager.setEpisodes(episodes(10, locked: <int>{8, 9}));
    manager.shiftWindow(8);
    await pumpEventQueue();

    expect(manager.players.keys, <int>[7]);
    expect(
      created.map((p) => p.index),
      isNot(anyElement(anyOf(8, 9))),
    );
  });

  test('pauseAll suspends playback and resume restores only the current',
      () async {
    manager.setEpisodes(episodes(10));
    manager.shiftWindow(3);
    await pumpEventQueue();
    final current = fakeFor(3);
    final playsBefore = current.playCalls;

    manager.pauseAll();
    await pumpEventQueue();
    expect(current.pauseCalls, greaterThanOrEqualTo(1));
    expect(manager.isPlaying, isFalse);

    manager.resume();
    await pumpEventQueue();
    expect(current.playCalls, playsBefore + 1);
    expect(fakeFor(2).playCalls, 0);
    expect(fakeFor(4).playCalls, 0);
    expect(manager.isPlaying, isTrue);
  });

  test('togglePlayback pauses and resumes the current episode', () async {
    manager.setEpisodes(episodes(3));
    await pumpEventQueue();

    manager.togglePlayback();
    await pumpEventQueue();
    expect(manager.isPlaying, isFalse);
    expect(fakeFor(0).pauseCalls, greaterThanOrEqualTo(1));

    manager.togglePlayback();
    await pumpEventQueue();
    expect(manager.isPlaying, isTrue);
    expect(fakeFor(0).playCalls, greaterThanOrEqualTo(2));
  });

  test('retry rebuilds the decoder for an index inside the window', () async {
    manager.setEpisodes(episodes(5));
    await pumpEventQueue();
    final first = fakeFor(0);

    manager.retry(0);
    await pumpEventQueue();

    expect(first.disposed, isTrue);
    final rebuilt = created.where((p) => p.index == 0).toList();
    expect(rebuilt, hasLength(2));
    expect(rebuilt.last.openedWithPlay, isTrue);
    expect(manager.players.keys, unorderedEquals(<int>[0, 1]));
  });

  test('setEpisodes with a changed list recreates mismatched decoders',
      () async {
    manager.setEpisodes(episodes(4));
    await pumpEventQueue();
    final original0 = fakeFor(0);
    final original1 = fakeFor(1);

    // Same indices, different episode ids: the window must be rebuilt.
    final recut = episodes(4)
        .map((e) => e.copyWith(id: 'recut-${e.id}', title: 'Re-cut'))
        .toList();
    manager.setEpisodes(recut);
    await pumpEventQueue();

    expect(original0.disposed, isTrue);
    expect(original1.disposed, isTrue);
    expect(manager.players.keys, unorderedEquals(<int>[0, 1]));
    final alive = created.where((p) => !p.disposed).toList();
    expect(alive.map((p) => p.index), unorderedEquals(<int>[0, 1]));
    expect(alive.singleWhere((p) => p.index == 0).openedWithPlay, isTrue);
    expect(alive.singleWhere((p) => p.index == 1).openedWithPlay, isFalse);
  });

  test('setEpisodes with the same list keeps the decoders it has', () async {
    manager.setEpisodes(episodes(4));
    await pumpEventQueue();
    final before = created.length;

    manager.setEpisodes(episodes(4));
    await pumpEventQueue();

    expect(created.length, before);
    expect(created.where((p) => p.disposed), isEmpty);
  });

  test('dispose releases every decoder and is idempotent', () async {
    manager.setEpisodes(episodes(10));
    manager.shiftWindow(4);
    await pumpEventQueue();

    manager.dispose();
    await pumpEventQueue();

    expect(created.every((p) => p.disposed), isTrue);
    expect(manager.players, isEmpty);
    expect(manager.dispose, returnsNormally);
  });
}

/// Records the commands the manager issues instead of driving libmpv.
final class FakePlatformPlayer extends PlatformPlayer {
  FakePlatformPlayer({required this.index})
      : super(configuration: const PlayerConfiguration());

  final int index;
  String? openedUrl;
  bool? openedWithPlay;
  PlaylistMode? playlistMode;
  int playCalls = 0;
  int pauseCalls = 0;
  bool disposed = false;

  @override
  Future<void> open(Playable playable, {bool play = true}) async {
    openedUrl = (playable as Media).uri;
    openedWithPlay = play;
  }

  @override
  Future<void> play() async {
    playCalls++;
  }

  @override
  Future<void> pause() async {
    pauseCalls++;
  }

  @override
  Future<void> setPlaylistMode(PlaylistMode playlistMode) async {
    this.playlistMode = playlistMode;
  }

  @override
  Future<void> dispose() async {
    disposed = true;
    await super.dispose();
  }
}
