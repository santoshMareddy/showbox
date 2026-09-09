import 'package:fpdart/fpdart.dart';

import '../../../../core/utils/typedefs.dart';
import '../../domain/entities/episode.dart';
import '../../domain/repositories/feed_repository.dart';

/// Stage 2 feed source: a fixed catalogue of ten episodes backed by the
/// public Google sample videos, so the player engine can be exercised before
/// the feed API exists. Titles and shows are fictional.
///
/// The clips are served over HTTPS (Android blocks cleartext HTTP by
/// default) from the same bucket as the commonly cited
/// `commondatastorage.googleapis.com` URLs.
final class SampleFeedRepository implements FeedRepository {
  const SampleFeedRepository();

  static const String _videoBase =
      'https://storage.googleapis.com/gtv-videos-bucket/sample';
  static const String _imageBase = '$_videoBase/images';

  static const List<Episode> episodes = <Episode>[
    Episode(
      id: 'quiet-orbit-1',
      showId: 'quiet-orbit',
      episodeNumber: 1,
      videoUrl: '$_videoBase/BigBuckBunny.mp4',
      thumbnailUrl: '$_imageBase/BigBuckBunny.jpg',
      title: 'The Quiet Orbit: The Signal',
      isLocked: false,
    ),
    Episode(
      id: 'quiet-orbit-2',
      showId: 'quiet-orbit',
      episodeNumber: 2,
      videoUrl: '$_videoBase/ElephantsDream.mp4',
      thumbnailUrl: '$_imageBase/ElephantsDream.jpg',
      title: 'The Quiet Orbit: Two Hundred Miles Up',
      isLocked: false,
    ),
    Episode(
      id: 'quiet-orbit-3',
      showId: 'quiet-orbit',
      episodeNumber: 3,
      videoUrl: '$_videoBase/ForBiggerBlazes.mp4',
      thumbnailUrl: '$_imageBase/ForBiggerBlazes.jpg',
      title: 'The Quiet Orbit: Dead Air',
      isLocked: false,
    ),
    Episode(
      id: 'quiet-orbit-4',
      showId: 'quiet-orbit',
      episodeNumber: 4,
      videoUrl: '$_videoBase/ForBiggerEscapes.mp4',
      thumbnailUrl: '$_imageBase/ForBiggerEscapes.jpg',
      title: 'The Quiet Orbit: Re-entry',
      isLocked: false,
    ),
    Episode(
      id: 'ashfall-1',
      showId: 'ashfall',
      episodeNumber: 1,
      videoUrl: '$_videoBase/ForBiggerFun.mp4',
      thumbnailUrl: '$_imageBase/ForBiggerFun.jpg',
      title: 'Ashfall: The Last Warm Day',
      isLocked: false,
    ),
    Episode(
      id: 'ashfall-2',
      showId: 'ashfall',
      episodeNumber: 2,
      videoUrl: '$_videoBase/ForBiggerJoyrides.mp4',
      thumbnailUrl: '$_imageBase/ForBiggerJoyrides.jpg',
      title: 'Ashfall: Grey Morning',
      isLocked: false,
    ),
    Episode(
      id: 'ashfall-3',
      showId: 'ashfall',
      episodeNumber: 3,
      videoUrl: '$_videoBase/ForBiggerMeltdowns.mp4',
      thumbnailUrl: '$_imageBase/ForBiggerMeltdowns.jpg',
      title: 'Ashfall: What the River Kept',
      isLocked: false,
    ),
    Episode(
      id: 'saltwater-1',
      showId: 'saltwater',
      episodeNumber: 1,
      videoUrl: '$_videoBase/Sintel.mp4',
      thumbnailUrl: '$_imageBase/Sintel.jpg',
      title: 'Saltwater: Low Tide',
      isLocked: false,
    ),
    Episode(
      id: 'saltwater-2',
      showId: 'saltwater',
      episodeNumber: 2,
      videoUrl: '$_videoBase/SubaruOutbackOnStreetAndDirt.mp4',
      thumbnailUrl: '$_imageBase/SubaruOutbackOnStreetAndDirt.jpg',
      title: 'Saltwater: The Ferry Home',
      isLocked: true,
    ),
    Episode(
      id: 'saltwater-3',
      showId: 'saltwater',
      episodeNumber: 3,
      videoUrl: '$_videoBase/TearsOfSteel.mp4',
      thumbnailUrl: '$_imageBase/TearsOfSteel.jpg',
      title: 'Saltwater: Undertow',
      isLocked: true,
    ),
  ];

  @override
  FutureFailureOr<List<Episode>> fetchFeed() async => right(episodes);
}
