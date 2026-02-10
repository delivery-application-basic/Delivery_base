/**
 * CuisineChip - Single cuisine filter chip
 */

import React from 'react';
import { Chip } from 'react-native-paper';
import { colors } from '../../theme/colors';

export const CuisineChip = ({ label, selected, onPress }) => (
  <Chip selected={selected} onPress={onPress} selectedColor={colors.white}>
    {label}
  </Chip>
);

export default CuisineChip;
