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
  return (
    <Card onPress={onPress}>
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
              <Text style={styles.rating}>★ {Number(rating).toFixed(1)}</Text>
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
  content: { flexDirection: 'row' },
  imageWrap: { marginRight: layout.cardPadding },
  image: { width: 80, height: 80, borderRadius: 8 },
  placeholder: { backgroundColor: colors.gray[200] },
  info: { flex: 1, justifyContent: 'center' },
  name: { ...typography.h4, color: colors.text, marginBottom: 2 },
  cuisine: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rating: { fontSize: typography.fontSize.sm, color: colors.warning },
  fee: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
});

export default RestaurantCard;
