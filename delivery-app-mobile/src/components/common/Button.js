/**
 * Button - Primary action button
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';

export const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  mode = 'contained',
  icon,
  style,
  contentStyle,
  labelStyle,
  ...rest
}) => {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      style={[styles.button, style]}
      contentStyle={[styles.content, contentStyle]}
      labelStyle={[styles.label, labelStyle]}
      buttonColor={mode === 'contained' ? colors.primary : undefined}
      textColor={mode === 'contained' ? colors.white : colors.primary}
      {...rest}
    >
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 2,
  },
  content: {
    paddingVertical: layout.buttonPadding,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
