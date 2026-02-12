import { normalizeFont } from '../utils/scaling';

// Typography configuration
export const typography = {
  // Font families
  fontFamily: {
    regular: 'System', // iOS: San Francisco, Android: Roboto
    medium: 'System',
    bold: 'System',
  },
  
  // Font sizes - using normalizeFont for better consistency
  fontSize: {
    xs: normalizeFont(12),
    sm: normalizeFont(14),
    md: normalizeFont(16),
    lg: normalizeFont(18),
    xl: normalizeFont(20),
    xxl: normalizeFont(24),
    xxxl: normalizeFont(32),
    display: normalizeFont(40),
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
    fontSize: normalizeFont(32),
    fontWeight: '700',
    lineHeight: 1.2,
  },
  h2: {
    fontSize: normalizeFont(24),
    fontWeight: '700',
    lineHeight: 1.3,
  },
  h3: {
    fontSize: normalizeFont(20),
    fontWeight: '600',
    lineHeight: 1.4,
  },
  h4: {
    fontSize: normalizeFont(18),
    fontWeight: '600',
    lineHeight: 1.4,
  },
  body: {
    fontSize: normalizeFont(16),
    fontWeight: '400',
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: normalizeFont(14),
    fontWeight: '400',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: normalizeFont(12),
    fontWeight: '400',
    lineHeight: 1.4,
  },
  button: {
    fontSize: normalizeFont(16),
    fontWeight: '600',
    lineHeight: 1.5,
  },
};
