/**
 * Input - Text input with label and error
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';

export const Input = ({
  label,
  value,
  onChangeText,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  placeholder,
  left,
  right,
  style,
  ...rest
}) => {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      error={!!error}
      disabled={disabled}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      placeholder={placeholder}
      left={left}
      right={right}
      mode="outlined"
      outlineColor={colors.border}
      activeOutlineColor={colors.primary}
      textColor={colors.text}
      style={[styles.input, style]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.white,
    paddingHorizontal: 0,
    marginBottom: 12,
    fontSize: 14,
  },
});

export default Input;
