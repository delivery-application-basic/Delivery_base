import { normalizeFont } from '../utils/scaling';

// Typography configuration
export const typography = {
  // Font families
  fontFamily: {
    regular: 'System', // iOS: San Francisco, Android: Roboto
    medium: 'System',
    bold: 'System',
  },
  
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
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 1.2,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 1.3,
  },
  h3: {
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
    fontWeight: '400',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 1.4,
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 1.5,
  },
};
