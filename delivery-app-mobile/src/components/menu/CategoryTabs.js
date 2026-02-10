/**
 * CategoryTabs - Horizontal category tabs for menu
 */

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';

export const CategoryTabs = ({ categories, selected, onSelect }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.content}>
    {(categories || ['All']).map((cat) => (
      <Chip
        key={cat}
        selected={selected === cat}
        onPress={() => onSelect?.(cat)}
        style={styles.chip}
        selectedColor={colors.white}
      >
        {cat}
      </Chip>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: { maxHeight: 48 },
  content: { paddingVertical: spacing.sm, gap: spacing.sm },
  chip: { marginRight: spacing.sm },
});

export default CategoryTabs;
