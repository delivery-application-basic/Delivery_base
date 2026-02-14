/**
 * OrderSummary - Order totals breakdown
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/helpers';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const OrderSummary = ({ subtotal, deliveryFee, serviceFee, total }) => (
  <View style={styles.wrap}>
    <Row label="Subtotal" value={subtotal} />
    <Row label="Delivery" value={deliveryFee} />
    <Row label="Service fee" value={serviceFee} />
    <View style={styles.total}>
      <Text style={styles.totalLabel}>Total</Text>
      <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
    </View>
  </View>
);

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{formatCurrency(value)}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { paddingVertical: 8, paddingBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  value: { fontSize: typography.fontSize.sm },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    paddingBottom: 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.h4,
    lineHeight: (typography?.h4?.fontSize || 16) + 6,
  },
  totalValue: {
    ...typography.h4,
    color: colors.primary,
    lineHeight: (typography?.h4?.fontSize || 16) + 6,
  },
});

export default OrderSummary;
