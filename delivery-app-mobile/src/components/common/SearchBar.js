/**
 * SearchBar - Search input with icon
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { colors } from '../../theme/colors';

export const SearchBar = ({ value, onChangeText, placeholder = 'Search...', ...rest }) => (
  <Searchbar
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    style={styles.bar}
    iconColor={colors.gray[500]}
    {...rest}
  />
);

const styles = StyleSheet.create({
  bar: { marginBottom: 8, elevation: 0, backgroundColor: colors.gray[100] },
});

export default SearchBar;
