import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { ORDER_STATUS } from '../../utils/constants';

const STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.READY]: 'Ready',
  [ORDER_STATUS.PICKED_UP]: 'Picked up',
  [ORDER_STATUS.IN_TRANSIT]: 'On the way',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
};

const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#F57C00', // Deep Orange
  [ORDER_STATUS.CONFIRMED]: '#1976D2', // Blue
  [ORDER_STATUS.PREPARING]: '#7B1FA2', // Purple
  [ORDER_STATUS.READY]: '#388E3C', // Green
  [ORDER_STATUS.PICKED_UP]: '#0097A7', // Cyan
  [ORDER_STATUS.IN_TRANSIT]: '#546E7A', // Blue Gray
  [ORDER_STATUS.DELIVERED]: '#43A047', // Green
  [ORDER_STATUS.CANCELLED]: '#D32F2F', // Red
};

export const OrderStatusBadge = ({ status }) => {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || '#757575';

  return (
    <View style={[styles.badge, { backgroundColor: color + '15' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color: color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default OrderStatusBadge;
