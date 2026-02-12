/**
 * MenuItemCard - Single menu item for list
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { moderateScale } from '../../utils/scaling';
import { Card } from '../common/Card';
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
          <Text style={[styles.name, unavailable && styles.unavailable]} numberOfLines={2}>
            {name}
          </Text>
          {description ? (
            <Text style={styles.desc} numberOfLines={2}>{description}</Text>
          ) : null}
          <Text style={styles.price}>{formatCurrency(price)}</Text>
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
  name: { ...typography.h4, color: colors.text, marginBottom: moderateScale(4) },
  desc: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: moderateScale(4) },
  price: { fontSize: typography.fontSize.md, fontWeight: '600', color: colors.primary },
  unavailable: { color: colors.textLight },
  image: { width: moderateScale(72), height: moderateScale(72), borderRadius: moderateScale(8), marginLeft: layout.cardPadding },
});

export default MenuItemCard;
