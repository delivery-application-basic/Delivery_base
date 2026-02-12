/**
 * RestaurantCard - Displays restaurant summary for lists
 */

import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { moderateScale, scale, verticalScale } from '../../utils/scaling';
import { Card } from '../common/Card';
import { Text } from '../common/Text';
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
  
  // Ensure name is always a valid string - handle all edge cases
  const displayName = (() => {
    if (!name) return 'Restaurant';
    const trimmed = String(name).trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      return 'Restaurant';
    }
    return trimmed;
  })();

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
          <Text 
            style={styles.name} 
            numberOfLines={1} 
            ellipsizeMode="tail"
            allowFontScaling={false}
          >
            {displayName}
          </Text>
          <Text style={styles.fee} allowFontScaling={false}>
            {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'FREE'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text 
            style={styles.cuisine} 
            numberOfLines={1} 
            ellipsizeMode="tail"
            allowFontScaling={false}
          >
            {cuisine || 'International'}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.time} allowFontScaling={false}>
            {deliveryTime}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
    borderRadius: moderateScale(20),
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: verticalScale(160),
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
    bottom: moderateScale(12),
    right: moderateScale(12),
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    ...shadows.small,
    gap: moderateScale(4),
  },
  ratingText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.text,
    includeFontPadding: false,
  },
  info: {
    padding: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: moderateScale(4),
    minHeight: 24, // Ensure minimum height for text
  },
  name: {
<<<<<<< HEAD
    fontSize: 18, // Fixed size for consistency
    fontWeight: '700',
    color: colors.text,
=======
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
>>>>>>> 764fb5e (fixed the ui text on all pages)
    flex: 1,
    marginRight: moderateScale(8),
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 22, // Fixed line height
  },
  fee: {
<<<<<<< HEAD
    fontSize: typography.fontSize.sm,
=======
    fontSize: 12,
>>>>>>> 764fb5e (fixed the ui text on all pages)
    fontWeight: '700',
    color: colors.primary,
    includeFontPadding: false,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cuisine: {
<<<<<<< HEAD
    fontSize: typography.fontSize.sm,
=======
    fontSize: 12,
>>>>>>> 764fb5e (fixed the ui text on all pages)
    color: colors.textSecondary,
    fontWeight: '500',
    includeFontPadding: false,
  },
  dot: {
    width: moderateScale(4),
    height: moderateScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: colors.gray[300],
    marginHorizontal: moderateScale(8),
  },
  time: {
<<<<<<< HEAD
    fontSize: typography.fontSize.sm,
=======
    fontSize: 12,
>>>>>>> 764fb5e (fixed the ui text on all pages)
    color: colors.textSecondary,
    fontWeight: '500',
    includeFontPadding: false,
  },
});

export default RestaurantCard;
