/**
 * CartSummary - Subtotal, delivery fee, total
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/helpers';

export const CartSummary = ({ subtotal, deliveryFee = 0, serviceFee = 0, total }) => {
  const computedTotal = total ?? (subtotal + deliveryFee + serviceFee);
  return (
    <View style={styles.wrap}>
      <Row label="Subtotal" value={subtotal} />
      {deliveryFee > 0 && <Row label="Delivery" value={deliveryFee} />}
      {serviceFee > 0 && <Row label="Service fee" value={serviceFee} />}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(computedTotal)}</Text>
      </View>
    </View>
  );
};

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{formatCurrency(value)}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { paddingVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  value: { fontSize: typography.fontSize.sm, color: colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { ...typography.h4 },
  totalValue: { ...typography.h4, color: colors.primary },
});

export default CartSummary;
