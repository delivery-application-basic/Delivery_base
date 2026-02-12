import { moderateScale } from '../utils/scaling';

// Typography configuration
export const typography = {
  // Font families
  fontFamily: {
    regular: 'System', // iOS: San Francisco, Android: Roboto
    medium: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: moderateScale(12),
    sm: moderateScale(14),
    md: moderateScale(16),
    lg: moderateScale(18),
    xl: moderateScale(20),
    xxl: moderateScale(24),
    xxxl: moderateScale(32),
    display: moderateScale(40),
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Text styles
  h1: {
    fontSize: moderateScale(32),
    fontWeight: '700',
    lineHeight: 1.2,
  },
  h2: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    lineHeight: 1.3,
  },
  h3: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    lineHeight: 1.4,
  },
  h4: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    lineHeight: 1.4,
  },
  body: {
    fontSize: moderateScale(16),
    fontWeight: '400',
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: moderateScale(12),
    fontWeight: '400',
    lineHeight: 1.4,
  },
  button: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    lineHeight: 1.5,
  },
};
