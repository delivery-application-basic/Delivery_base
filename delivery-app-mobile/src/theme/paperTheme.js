/**
 * React Native Paper Theme Configuration
 * Compatible with react-native-paper's theme structure
 */
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { colors, darkColors } from './colors';

// Create a light theme compatible with react-native-paper
export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.white,
    primaryContainer: colors.primaryLight,
    onPrimaryContainer: colors.white,
    secondary: colors.secondary,
    onSecondary: colors.white,
    secondaryContainer: colors.secondaryLight,
    onSecondaryContainer: colors.white,
    tertiary: colors.accent,
    onTertiary: colors.text,
    tertiaryContainer: colors.accentLight,
    onTertiaryContainer: colors.text,
    error: colors.error,
    onError: colors.white,
    errorContainer: colors.errorLight,
    onErrorContainer: colors.error,
    background: colors.background,
    onBackground: colors.text,
    surface: colors.surface,
    onSurface: colors.text,
    surfaceVariant: colors.surfaceDark,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    outlineVariant: colors.borderLight,
    shadow: colors.black,
    scrim: colors.black,
    inverseSurface: colors.text,
    inverseOnSurface: colors.background,
    inversePrimary: colors.primaryLight,
    // Elevation levels (required by react-native-paper)
    elevation: {
      level0: colors.background,
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
};

// Create a dark theme compatible with react-native-paper
export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    onPrimary: colors.white,
    primaryContainer: colors.primaryDark,
    onPrimaryContainer: colors.white,
    secondary: colors.secondary,
    onSecondary: colors.white,
    secondaryContainer: colors.secondaryDark,
    onSecondaryContainer: colors.white,
    tertiary: colors.accent,
    onTertiary: colors.text,
    tertiaryContainer: colors.accentDark,
    onTertiaryContainer: colors.text,
    error: colors.error,
    onError: colors.white,
    errorContainer: colors.errorLight,
    onErrorContainer: colors.error,
    background: darkColors.background,
    onBackground: darkColors.text,
    surface: darkColors.surface,
    onSurface: darkColors.text,
    surfaceVariant: darkColors.surfaceDark,
    onSurfaceVariant: darkColors.textSecondary,
    outline: darkColors.border,
    outlineVariant: darkColors.borderLight,
    shadow: colors.black,
    scrim: colors.black,
    inverseSurface: darkColors.text,
    inverseOnSurface: darkColors.background,
    inversePrimary: colors.primaryLight,
    // Elevation levels (required by react-native-paper)
    elevation: {
      level0: darkColors.background,
      level1: darkColors.surface,
      level2: darkColors.surface,
      level3: darkColors.surface,
      level4: darkColors.surface,
      level5: darkColors.surface,
    },
  },
};

export default paperLightTheme;
