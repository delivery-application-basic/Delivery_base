/**
 * CartItem - Single cart line item with quantity controls
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/helpers';

export const CartItem = ({
  name,
  price,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  const total = price * quantity;

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        <Text style={styles.price}>{formatCurrency(price)} × {quantity}</Text>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
      </View>
      <View style={styles.actions}>
        <View style={styles.quantityRow}>
          <IconButton
            icon="minus"
            size={20}
            onPress={onDecrease}
            iconColor={colors.primary}
          />
          <Text style={styles.qty}>{quantity}</Text>
          <IconButton
            icon="plus"
            size={20}
            onPress={onIncrease}
            iconColor={colors.primary}
          />
        </View>
        {onRemove && (
          <IconButton
            icon="delete-outline"
            size={20}
            onPress={onRemove}
            iconColor={colors.error}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: layout.itemSpacing,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  info: { flex: 1 },
  name: { ...typography.body, fontWeight: '500', marginBottom: 2 },
  price: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  total: { fontSize: typography.fontSize.md, fontWeight: '600', marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  quantityRow: { flexDirection: 'row', alignItems: 'center' },
  qty: { minWidth: 24, textAlign: 'center', fontWeight: '600' },
});

export default CartItem;
