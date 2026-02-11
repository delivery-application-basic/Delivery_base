/**
 * RestaurantCard - Displays restaurant summary for lists
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing, layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { formatCurrency } from '../../utils/helpers';

export const RestaurantCard = ({
  name,
  cuisine,
  imageUrl,
  rating,
  deliveryFee,
  onPress,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const deliveryTime = '25-35 min'; // Mock estimation

  return (
    <Card onPress={handlePress} style={styles.card}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Icon source="silverware-variant" size={40} color={colors.gray[300]} />
          </View>
        )}
        <View style={styles.badgeContainer}>
          <View style={styles.ratingBadge}>
            <Icon source="star" size={14} color={colors.warning} />
            <Text style={styles.ratingText}>{Number(rating || 4.5).toFixed(1)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.fee}>{deliveryFee > 0 ? formatCurrency(deliveryFee) : 'FREE'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.cuisine} numberOfLines={1}>{cuisine || 'International'}</Text>
          <View style={styles.dot} />
          <Text style={styles.time}>{deliveryTime}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    ...shadows.small,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  info: {
    padding: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  fee: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cuisine: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
    marginHorizontal: 8,
  },
  time: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default RestaurantCard;
