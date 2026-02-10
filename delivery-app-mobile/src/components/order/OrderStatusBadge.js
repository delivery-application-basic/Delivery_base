/**
 * OrderStatusBadge - Status chip for order
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
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
  [ORDER_STATUS.PENDING]: colors.orderPending,
  [ORDER_STATUS.CONFIRMED]: colors.orderConfirmed,
  [ORDER_STATUS.PREPARING]: colors.orderPreparing,
  [ORDER_STATUS.READY]: colors.success,
  [ORDER_STATUS.PICKED_UP]: colors.info,
  [ORDER_STATUS.IN_TRANSIT]: colors.primary,
  [ORDER_STATUS.DELIVERED]: colors.orderDelivered,
  [ORDER_STATUS.CANCELLED]: colors.orderCancelled,
};

export const OrderStatusBadge = ({ status }) => {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || colors.gray[500];

  return (
    <Chip
      style={[styles.chip, { backgroundColor: color }]}
      textStyle={styles.text}
      compact
    >
      {label}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: { height: 28 },
  text: { color: colors.white, fontSize: 12, fontWeight: '600' },
});

export default OrderStatusBadge;
