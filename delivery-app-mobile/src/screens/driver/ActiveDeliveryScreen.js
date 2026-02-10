/**
 * ActiveDeliveryScreen - Current delivery, status updates. Backend: PATCH /deliveries/:id/status, POST /deliveries/:orderId/verify
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export default function ActiveDeliveryScreen() {
  const { activeDelivery } = useSelector((state) => state.driver);

  if (!activeDelivery) {
    return <EmptyState message="No active delivery" />;
  }

  const o = activeDelivery;
  return (
    <View style={{ padding: layout.screenPadding }}>
      <Text style={typography.h2}>Order #{o.order_id}</Text>
      <OrderStatusBadge status={o.order_status} />
      {o.restaurant && <Text style={typography.body}>Restaurant: {o.restaurant.restaurant_name}</Text>}
      <Text style={typography.bodySmall}>Update status via backend / delivery flow</Text>
    </View>
  );
}
