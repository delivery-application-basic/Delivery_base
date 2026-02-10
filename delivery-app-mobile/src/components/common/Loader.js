/**
 * Loader - Full screen or inline loading indicator
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const Loader = ({ fullScreen = false, size = 'large', color }) => {
  const loaderColor = color || colors.primary;

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={loaderColor} />
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={loaderColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  inline: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Loader;
