/**
 * RestaurantFilter - Filter chips for cuisine / open now etc.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const DEFAULT_CUISINES = ['Ethiopian', 'Fast Food', 'Italian', 'Chinese', 'All'];

export const RestaurantFilter = ({
  selectedCuisine,
  onCuisineChange,
  cuisines = DEFAULT_CUISINES,
  showOpenNow = false,
  openNow,
  onOpenNowChange,
}) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {cuisines.map((c) => (
          <Chip
            key={c}
            selected={selectedCuisine === c}
            onPress={() => onCuisineChange?.(c)}
            style={styles.chip}
            selectedColor={colors.white}
          >
            {c}
          </Chip>
        ))}
      </View>
      {showOpenNow && (
        <Chip
          selected={openNow}
          onPress={() => onOpenNowChange?.(!openNow)}
          style={styles.chip}
          selectedColor={colors.white}
        >
          Open now
        </Chip>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { marginRight: spacing.sm, marginBottom: spacing.sm },
});

export default RestaurantFilter;
