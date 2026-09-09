import 'package:flutter/material.dart';

/// The NetShort palette. The app is dark-only: every scaffold is pure black
/// and crimson is the single accent.
abstract final class AppColors {
  static const Color pureBlack = Color(0xFF000000);
  static const Color surfaceDark = Color(0xFF121212);
  static const Color surfaceRaised = Color(0xFF1C1C1E);

  static const Color brandPrimary = Color(0xFFE11D48);
  static const Color brandPrimaryDeep = Color(0xFF9F1239);

  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xB3FFFFFF);
  static const Color textTertiary = Color(0x80FFFFFF);

  static const Color outline = Color(0x1FFFFFFF);
  static const Color error = Color(0xFFFF6B6B);
}
