import 'package:flutter/foundation.dart';

/// A viewer comment on one episode.
@immutable
final class EpisodeComment {
  const EpisodeComment({
    required this.id,
    required this.episodeId,
    required this.author,
    required this.text,
    required this.createdAt,
  });

  final String id;
  final String episodeId;
  final String author;
  final String text;
  final DateTime createdAt;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is EpisodeComment &&
          other.id == id &&
          other.episodeId == episodeId &&
          other.author == author &&
          other.text == text &&
          other.createdAt == createdAt;

  @override
  int get hashCode => Object.hash(id, episodeId, author, text, createdAt);

  @override
  String toString() => 'EpisodeComment($id on $episodeId by $author)';
}
