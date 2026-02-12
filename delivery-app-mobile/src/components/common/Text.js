/**
 * Custom Text Component - Disables system font scaling for consistent display
 * Use this instead of React Native's Text component throughout the app
 */

import React from 'react';
import { Text as RNText, Platform } from 'react-native';

export const Text = ({ children, style, allowFontScaling = false, ...props }) => {
  // Android-specific: disable font padding for consistent rendering
  const androidStyle = Platform.OS === 'android' ? { includeFontPadding: false } : {};
  
  return (
    <RNText
      allowFontScaling={allowFontScaling}
      style={[androidStyle, style]}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;
