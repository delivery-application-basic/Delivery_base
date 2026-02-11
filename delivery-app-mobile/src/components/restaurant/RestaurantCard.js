/**
 * RestaurantCard - Displays restaurant summary for lists
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing, layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';
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

  return (
    <Card onPress={handlePress}>
      <View style={styles.content}>
        <View style={styles.imageWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholder]} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {cuisine && (
            <Text style={styles.cuisine} numberOfLines={1}>{cuisine}</Text>
          )}
          <View style={styles.meta}>
            {rating != null && (
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>★ {Number(rating).toFixed(1)}</Text>
              </View>
            )}
            {deliveryFee != null && (
              <Text style={styles.fee}>{formatCurrency(deliveryFee)} delivery</Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrap: { 
    marginRight: layout.cardPadding,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { 
    width: 90, 
    height: 90, 
    borderRadius: 12,
    backgroundColor: colors.gray[100],
  },
  placeholder: { 
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { 
    flex: 1, 
    justifyContent: 'center',
    paddingVertical: 4,
  },
  name: { 
    ...typography.h4, 
    color: colors.text, 
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 18,
  },
  cuisine: { 
    fontSize: typography.fontSize.sm, 
    color: colors.textSecondary, 
    marginBottom: 8,
    fontWeight: '400',
  },
  meta: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: spacing.md,
  },
  ratingContainer: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rating: { 
    fontSize: typography.fontSize.sm, 
    color: colors.warning,
    fontWeight: '700',
  },
  fee: { 
    fontSize: typography.fontSize.sm, 
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default RestaurantCard;
