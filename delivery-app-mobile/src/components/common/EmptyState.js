/**
 * EmptyState - Shown when list or content is empty
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const EmptyState = ({
  message = 'No items to show',
  icon = 'inbox-outline',
  iconSize = 64,
  action,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon source={icon} size={iconSize} color={colors.gray[300]} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 300,
    paddingVertical: spacing.xxl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  message: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  action: {
    marginTop: spacing.xl,
  },
});

export default EmptyState;
