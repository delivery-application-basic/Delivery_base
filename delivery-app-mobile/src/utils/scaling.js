import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Clamp scaling to prevent extreme sizes
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const scale = (size) => {
  const scaled = (width / guidelineBaseWidth) * size;
  // Clamp to reasonable bounds (0.8x to 1.3x of original)
  return clamp(scaled, size * 0.8, size * 1.3);
};

const verticalScale = (size) => {
  const scaled = (height / guidelineBaseHeight) * size;
  // Clamp to reasonable bounds (0.8x to 1.3x of original)
  return clamp(scaled, size * 0.8, size * 1.3);
};

const moderateScale = (size, factor = 0.5) => {
  const scaled = size + (scale(size) - size) * factor;
  // Ensure minimum size for readability
  return Math.max(scaled, size * 0.9);
};

const normalizeFont = (size) => {
  const newSize = moderateScale(size, 0.3); // Use moderate scaling for fonts
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
};

export { scale, verticalScale, moderateScale, normalizeFont };
