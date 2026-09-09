import 'dart:async';
import 'dart:collection';

import 'package:flutter/foundation.dart';
import 'package:media_kit/media_kit.dart';
import 'package:media_kit_video/media_kit_video.dart';

import '../../feed/domain/entities/episode.dart';

/// A decoder for one episode: the [Player] plus the texture it renders into.
///
/// [controller] is `null` only where no texture can exist (unit tests).
final class PlayerSlot {
  const PlayerSlot({required this.player, this.controller});

  final Player player;
  final VideoController? controller;
}

/// Builds the decoder for [episode].
typedef PlayerSlotFactory = PlayerSlot Function(Episode episode);

/// Production [PlayerSlotFactory]: a media_kit [Player] with hardware
/// decoding and a 16 MiB demuxer buffer (one to three minute clips never need
/// more, and three of these are alive at once).
PlayerSlot createMediaKitSlot(Episode episode) {
  final player = Player(
    configuration: const PlayerConfiguration(
      bufferSize: 16 * 1024 * 1024,
      title: 'NetShort',
    ),
  );
  final controller = VideoController(
    player,
    configuration: const VideoControllerConfiguration(
      enableHardwareAcceleration: true,
    ),
  );
  return PlayerSlot(player: player, controller: controller);
}

/// Keeps exactly the decoders the feed needs alive: the episode on screen and
/// its neighbours, `[index - windowRadius, index + windowRadius]`.
///
/// Every hardware decoder holds scarce VRAM and codec instances, so anything
/// outside the window is disposed the moment the window moves, before new
/// decoders are created. Locked episodes never get a decoder: they only show
/// their thumbnail until the unlock flow opens them.
///
/// Listeners are notified after every window change so the page widgets can
/// swap between the thumbnail and the live texture.
final class PreloadManager extends ChangeNotifier {
  PreloadManager({
    this._createSlot = createMediaKitSlot,
    this.windowRadius = 1,
  }) : assert(windowRadius >= 0, 'windowRadius cannot be negative');

  /// How many neighbours on each side of the current index stay decoded.
  final int windowRadius;

  final PlayerSlotFactory _createSlot;
  final Map<int, _DecoderEntry> _entries = <int, _DecoderEntry>{};

  List<Episode> _episodes = const <Episode>[];
  int _currentIndex = 0;
  bool _inForeground = true;
  bool _disposed = false;

  /// The live decoders by feed index. Never more than `2 * windowRadius + 1`.
  UnmodifiableMapView<int, Player> get players => UnmodifiableMapView(
        <int, Player>{
          for (final MapEntry<int, _DecoderEntry> entry in _entries.entries)
            entry.key: entry.value.slot.player,
        },
      );

  /// The index the viewer is looking at.
  int get currentIndex => _currentIndex;

  /// Whether the current episode is meant to be playing.
  bool get isPlaying => _entries[_currentIndex]?.shouldPlay ?? false;

  Player? playerAt(int index) => _entries[index]?.slot.player;

  VideoController? controllerAt(int index) => _entries[index]?.slot.controller;

  /// Replaces the feed. Decoders whose index now points at a different
  /// episode are recreated; the window is re-applied around the current
  /// index, clamped into the new list.
  void setEpisodes(List<Episode> episodes) {
    if (_disposed) {
      return;
    }
    _episodes = List<Episode>.unmodifiable(episodes);
    final lastIndex = _episodes.isEmpty ? 0 : _episodes.length - 1;
    shiftWindow(_currentIndex.clamp(0, lastIndex));
  }

  /// Moves the window to [currentIndex]: evicts every decoder further than
  /// [windowRadius] away, creates the missing ones (current first, then the
  /// next, then the previous), plays the current one and pauses the rest.
  void shiftWindow(int currentIndex) {
    if (_disposed) {
      return;
    }
    _currentIndex = currentIndex;

    final stale = _entries.keys
        .where((int index) => (index - currentIndex).abs() > windowRadius)
        .toList(growable: false);
    for (final index in stale) {
      _evict(index);
    }

    _ensure(currentIndex);
    for (var distance = 1; distance <= windowRadius; distance++) {
      _ensure(currentIndex + distance);
      _ensure(currentIndex - distance);
    }

    for (final MapEntry<int, _DecoderEntry> entry in _entries.entries) {
      if (entry.key == currentIndex && _inForeground) {
        entry.value.play();
      } else {
        entry.value.pause();
      }
    }

    notifyListeners();
  }

  /// Pauses or resumes the current episode (tap on the video).
  void togglePlayback() {
    final entry = _entries[_currentIndex];
    if (entry == null) {
      return;
    }
    if (entry.shouldPlay) {
      entry.pause();
    } else {
      entry.play();
    }
    notifyListeners();
  }

  /// Drops the decoder at [index] and builds it again (after a playback
  /// error). No-op outside the window.
  void retry(int index) {
    if (_disposed || (index - _currentIndex).abs() > windowRadius) {
      return;
    }
    _evict(index);
    shiftWindow(_currentIndex);
  }

  /// App went to the background: nothing may keep decoding.
  void pauseAll() {
    _inForeground = false;
    for (final entry in _entries.values) {
      entry.suspend();
    }
  }

  /// App is back: the current episode resumes if it was playing before.
  void resume() {
    _inForeground = true;
    _entries[_currentIndex]?.restore();
  }

  void _ensure(int index) {
    if (index < 0 || index >= _episodes.length) {
      return;
    }
    final episode = _episodes[index];
    if (episode.isLocked) {
      return;
    }
    final existing = _entries[index];
    if (existing != null) {
      if (existing.episode.id == episode.id) {
        return;
      }
      _evict(index);
    }
    _entries[index] = _DecoderEntry(
      episode: episode,
      slot: _createSlot(episode),
      autoplay: index == _currentIndex && _inForeground,
    );
  }

  void _evict(int index) {
    _entries.remove(index)?.dispose();
  }

  /// Releases every decoder. Safe to call more than once.
  @override
  void dispose() {
    if (_disposed) {
      return;
    }
    _disposed = true;
    for (final index in _entries.keys.toList(growable: false)) {
      _evict(index);
    }
    super.dispose();
  }
}

/// One decoder and the playback intent attached to it. Commands are queued
/// behind the `open` call so play/pause never race the file load.
final class _DecoderEntry {
  _DecoderEntry({
    required this.episode,
    required this.slot,
    required bool autoplay,
  }) : _shouldPlay = autoplay {
    _opened = _open(autoplay);
  }

  final Episode episode;
  final PlayerSlot slot;

  late final Future<void> _opened;
  bool _shouldPlay;
  bool _playingBeforeSuspend = false;
  bool _disposed = false;

  bool get shouldPlay => _shouldPlay;

  Future<void> _open(bool autoplay) async {
    try {
      await slot.player.setPlaylistMode(PlaylistMode.single);
      await slot.player.open(Media(episode.videoUrl), play: autoplay);
    } on Object catch (error) {
      // Surfaced to the UI through `player.stream.error`; the page offers a
      // retry, which rebuilds this entry.
      debugPrint('PreloadManager: could not open ${episode.id}: $error');
    }
  }

  void play() {
    _shouldPlay = true;
    _opened.then((_) {
      if (!_disposed && _shouldPlay) {
        slot.player.play();
      }
    });
  }

  void pause() {
    _shouldPlay = false;
    _opened.then((_) {
      if (!_disposed && !_shouldPlay) {
        slot.player.pause();
      }
    });
  }

  /// Background pause that remembers whether to resume.
  void suspend() {
    _playingBeforeSuspend = _shouldPlay;
    pause();
  }

  void restore() {
    if (_playingBeforeSuspend) {
      play();
    }
  }

  void dispose() {
    _disposed = true;
    _shouldPlay = false;
    unawaited(
      slot.player.dispose().catchError((Object error) {
        debugPrint('PreloadManager: dispose of ${episode.id} failed: $error');
      }),
    );
  }
}
