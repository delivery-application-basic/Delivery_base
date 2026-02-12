import { moderateScale } from '../utils/scaling';

// Spacing scale (8px base unit)
export const spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
  xxxl: moderateScale(64),
};

// Specific spacing values
export const layout = {
  screenPadding: spacing.md,
  cardPadding: spacing.md,
  sectionSpacing: spacing.lg,
  itemSpacing: spacing.sm,
  buttonPadding: spacing.md,
  inputPadding: spacing.md,
};
