import { normalizeFont } from '../utils/scaling';

// Typography configuration
export const typography = {
  // Font families
  fontFamily: {
    regular: 'System', // iOS: San Francisco, Android: Roboto
    medium: 'System',
    bold: 'System',
  },
  
<<<<<<< HEAD
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
=======
  // Font sizes - scaled for better readability
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 28,
>>>>>>> 764fb5e (fixed the ui text on all pages)
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
  
  // Text styles - adjusted for mobile scaling
  h1: {
<<<<<<< HEAD
    fontSize: normalizeFont(32),
=======
    fontSize: 24,
>>>>>>> 764fb5e (fixed the ui text on all pages)
    fontWeight: '700',
    lineHeight: 1.2,
  },
  h2: {
<<<<<<< HEAD
    fontSize: normalizeFont(24),
=======
    fontSize: 20,
>>>>>>> 764fb5e (fixed the ui text on all pages)
    fontWeight: '700',
    lineHeight: 1.3,
  },
  h3: {
<<<<<<< HEAD
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
=======
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 1.4,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 1.4,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: 12,
>>>>>>> 764fb5e (fixed the ui text on all pages)
    fontWeight: '400',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 1.4,
  },
  button: {
<<<<<<< HEAD
    fontSize: normalizeFont(16),
=======
    fontSize: 14,
>>>>>>> 764fb5e (fixed the ui text on all pages)
    fontWeight: '600',
    lineHeight: 1.5,
  },
};
