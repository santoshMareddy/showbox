import 'package:flutter/foundation.dart';

/// One vertical episode in the feed.
@immutable
final class Episode {
  const Episode({
    required this.id,
    required this.showId,
    required this.episodeNumber,
    required this.videoUrl,
    required this.thumbnailUrl,
    required this.title,
    required this.isLocked,
  }) : assert(episodeNumber > 0, 'episodeNumber starts at 1');

  final String id;
  final String showId;
  final int episodeNumber;
  final String videoUrl;
  final String thumbnailUrl;
  final String title;

  /// Locked episodes show their thumbnail only; the unlock flow spends coins.
  final bool isLocked;

  Episode copyWith({
    String? id,
    String? showId,
    int? episodeNumber,
    String? videoUrl,
    String? thumbnailUrl,
    String? title,
    bool? isLocked,
  }) =>
      Episode(
        id: id ?? this.id,
        showId: showId ?? this.showId,
        episodeNumber: episodeNumber ?? this.episodeNumber,
        videoUrl: videoUrl ?? this.videoUrl,
        thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
        title: title ?? this.title,
        isLocked: isLocked ?? this.isLocked,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Episode &&
          other.id == id &&
          other.showId == showId &&
          other.episodeNumber == episodeNumber &&
          other.videoUrl == videoUrl &&
          other.thumbnailUrl == thumbnailUrl &&
          other.title == title &&
          other.isLocked == isLocked;

  @override
  int get hashCode => Object.hash(
        id,
        showId,
        episodeNumber,
        videoUrl,
        thumbnailUrl,
        title,
        isLocked,
      );

  @override
  String toString() =>
      'Episode($id, show: $showId, ep: $episodeNumber, locked: $isLocked)';
}
