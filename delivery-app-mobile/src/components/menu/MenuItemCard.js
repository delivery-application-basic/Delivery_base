/**
 * MenuItemCard - Single menu item for list
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
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
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  content: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1 },
  name: { 
    fontSize: 18,
    fontWeight: '700',
    color: colors.text, 
    marginBottom: moderateScale(4),
    includeFontPadding: false,
    lineHeight: 22,
  },
  desc: { 
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary, 
    marginBottom: moderateScale(4),
    includeFontPadding: false,
    lineHeight: 18,
  },
  price: { 
    fontSize: 16,
    fontWeight: '700', 
    color: colors.primary,
    includeFontPadding: false,
  },
  unavailable: { color: colors.textLight },
  image: { width: moderateScale(72), height: moderateScale(72), borderRadius: moderateScale(8), marginLeft: layout.cardPadding },
});

export default MenuItemCard;
