/**
 * Card - Container card with optional padding and elevation
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export const Card = ({
  children,
  onPress,
  style,
  contentStyle,
  padding = true,
  elevation = 1,
  ...rest
}) => {
  const cardContentStyle = [
    padding && { padding: layout.cardPadding },
    contentStyle,
  ];

  const cardStyle = [
    styles.card,
    shadows.medium,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.touchable}
        {...rest}
      >
        <View style={cardStyle}>
          <View style={cardContentStyle}>
            {children}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...rest}>
      <View style={cardContentStyle}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Card;
