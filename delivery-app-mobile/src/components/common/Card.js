/**
 * Card - Container card with optional padding and elevation
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
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

  return (
    <PaperCard
      onPress={onPress}
      style={[styles.card, shadows.medium, style]}
      contentStyle={cardContentStyle}
      elevation={elevation}
      {...rest}
    >
      {children}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
});

export default Card;
