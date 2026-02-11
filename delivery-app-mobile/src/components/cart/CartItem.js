import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
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
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        <Text style={styles.price}>{formatCurrency(price)} per unit</Text>
      </View>

      <View style={styles.rightSide}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={onDecrease}
            style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
            disabled={quantity <= 1}
          >
            <Icon source="minus" size={18} color={quantity <= 1 ? colors.gray[300] : colors.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity onPress={onIncrease} style={styles.qtyBtn}>
            <Icon source="plus" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.totalText}>{formatCurrency(total)}</Text>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
            <Icon source="close" size={16} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  info: { flex: 1, marginRight: 12 },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '500',
  },
  rightSide: {
    alignItems: 'flex-end',
    gap: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 2,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  totalText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  removeBtn: {
    position: 'absolute',
    top: -30,
    right: -5,
    padding: 4,
  },
});

export default CartItem;
