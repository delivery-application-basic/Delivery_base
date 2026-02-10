/**
 * OrderCard - Order summary for list
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { OrderStatusBadge } from './OrderStatusBadge';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

export const OrderCard = ({
  orderId,
  status,
  totalAmount,
  createdAt,
  restaurantName,
  onPress,
}) => {
  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{orderId}</Text>
        <OrderStatusBadge status={status} />
      </View>
      {restaurantName && (
        <Text style={styles.restaurant} numberOfLines={1}>{restaurantName}</Text>
      )}
      <View style={styles.footer}>
        <Text style={styles.date}>{formatDateTime(createdAt)}</Text>
        <Text style={styles.total}>{formatCurrency(totalAmount)}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { ...typography.h4, color: colors.text },
  restaurant: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  total: { fontSize: typography.fontSize.md, fontWeight: '600', color: colors.primary },
});

export default OrderCard;
