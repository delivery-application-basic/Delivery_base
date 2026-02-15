/**
 * MenuItemCard - Single menu item for list. Shows food image or placeholder.
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { moderateScale } from '../../utils/scaling';
import { Card } from '../common/Card';
import { Text } from '../common/Text';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/helpers';

export const MenuItemCard = ({
  name,
  description,
  price,
  imageUrl,
  onPress,
  unavailable,
}) => {
  return (
    <Card onPress={unavailable ? undefined : onPress}>
      <View style={styles.content}>
        <View style={styles.text}>
          <Text 
            style={[styles.name, unavailable && styles.unavailable]} 
            numberOfLines={2}
            allowFontScaling={false}
            ellipsizeMode="tail"
          >
            {name || 'Menu Item'}
          </Text>
          {description ? (
            <Text 
              style={styles.desc} 
              numberOfLines={2}
              allowFontScaling={false}
              ellipsizeMode="tail"
            >
              {description}
            </Text>
          ) : null}
          <Text style={styles.price} allowFontScaling={false}>
            {formatCurrency(price)}
          </Text>
        </View>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon source="food" size={28} color={colors.gray[300]} />
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1 },
  name: { 
    fontSize: 14,
    fontWeight: '600',
    color: colors.text, 
    marginBottom: moderateScale(4),
    includeFontPadding: false,
    lineHeight: 22,
  },
  desc: { 
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary, 
    marginBottom: moderateScale(4),
    includeFontPadding: false,
    lineHeight: 18,
  },
  price: { 
    fontSize: 14,
    fontWeight: '600', 
    color: colors.primary,
    includeFontPadding: false,
  },
  unavailable: { color: colors.textLight },
  imageContainer: { marginLeft: layout.cardPadding },
  image: { width: 60, height: 60, borderRadius: 8 },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MenuItemCard;
