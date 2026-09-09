import '../../../../core/utils/typedefs.dart';
import '../entities/episode.dart';

/// Source of the vertical feed.
abstract interface class FeedRepository {
  /// The episodes to show, in feed order.
  FutureFailureOr<List<Episode>> fetchFeed();
}
