import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../domain/entities/episode.dart';

/// The chrome drawn over a feed page: title block bottom-left, action rail
/// bottom-right, and a legibility scrim. Nothing here paints a background, so
/// the video shows through and taps outside the controls reach the player.
class FeedHudOverlay extends StatelessWidget {
  const FeedHudOverlay({
    required this.episode,
    required this.isLiked,
    required this.commentCount,
    required this.onLike,
    required this.onComment,
    required this.onShare,
    super.key,
  });

  final Episode episode;
  final bool isLiked;
  final int commentCount;
  final VoidCallback onLike;
  final VoidCallback onComment;
  final VoidCallback onShare;

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    final textTheme = Theme.of(context).textTheme;

    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        const Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          height: 280,
          child: IgnorePointer(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: <Color>[Colors.transparent, Color(0xCC000000)],
                ),
              ),
            ),
          ),
        ),
        Positioned(
          left: 16,
          right: 92,
          bottom: bottomInset + 28,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Row(
                children: <Widget>[
                  _Chip(
                    label: 'EP ${episode.episodeNumber}',
                    background: AppColors.brandPrimary,
                  ),
                  if (episode.isLocked) ...<Widget>[
                    const SizedBox(width: 8),
                    const _Chip(
                      label: 'LOCKED',
                      background: Color(0x33FFFFFF),
                      icon: Icons.lock_rounded,
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 10),
              Text(
                episode.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                  height: 1.2,
                  shadows: const <Shadow>[
                    Shadow(color: Color(0x99000000), blurRadius: 12),
                  ],
                ),
              ),
            ],
          ),
        ),
        Positioned(
          right: 6,
          bottom: bottomInset + 20,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              _RailButton(
                icon: isLiked ? Icons.favorite : Icons.favorite_border,
                label: isLiked ? 'Liked' : 'Like',
                color: isLiked ? AppColors.brandPrimary : AppColors.textPrimary,
                tooltip: isLiked ? 'Remove like' : 'Like this episode',
                onTap: onLike,
              ),
              _RailButton(
                icon: Icons.mode_comment_outlined,
                label: commentCount > 0 ? '$commentCount' : 'Comment',
                tooltip: 'Comments',
                onTap: onComment,
              ),
              _RailButton(
                icon: Icons.share_outlined,
                label: 'Share',
                tooltip: 'Copy link',
                onTap: onShare,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.background, this.icon});

  final String label;
  final Color background;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          if (icon != null) ...<Widget>[
            Icon(icon, size: 12, color: AppColors.textPrimary),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
            ),
          ),
        ],
      ),
    );
  }
}

class _RailButton extends StatelessWidget {
  const _RailButton({
    required this.icon,
    required this.label,
    required this.tooltip,
    required this.onTap,
    this.color = AppColors.textPrimary,
  });

  final IconData icon;
  final String label;
  final String tooltip;
  final VoidCallback onTap;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: tooltip,
      child: InkResponse(
        onTap: onTap,
        radius: 36,
        containedInkWell: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(
                icon,
                size: 30,
                color: color,
                shadows: const <Shadow>[
                  Shadow(color: Color(0x99000000), blurRadius: 10),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  shadows: <Shadow>[
                    Shadow(color: Color(0x99000000), blurRadius: 8),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
