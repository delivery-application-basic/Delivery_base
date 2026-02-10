/**
 * OrderDetailsScreen - Order info, update status. Backend: GET /orders/:id, PATCH /orders/:id/status
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { fetchOrderById } from '../../store/slices/orderSlice';
import { orderService } from '../../api/services/orderService';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const NEXT_STATUS = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready' };

export default function OrderDetailsScreen() {
  const dispatch = useDispatch();
  const route = useRoute();
  const orderId = route.params?.orderId;
  const { selectedOrder, isLoading } = useSelector((state) => state.order);

  useEffect(() => {
    if (orderId) dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  const handleUpdateStatus = async () => {
    const next = NEXT_STATUS[selectedOrder?.order_status];
    if (!next || !orderId) return;
    try {
      await orderService.updateOrderStatus(orderId, next);
      dispatch(fetchOrderById(orderId));
    } catch (e) {}
  };

  if (isLoading && !selectedOrder) return <Loader fullScreen />;
  if (!selectedOrder) return null;

  const o = selectedOrder;
  const next = NEXT_STATUS[o.order_status];

  return (
    <ScrollView style={{ flex: 1, padding: layout.screenPadding }}>
      <Text style={typography.h2}>Order #{o.order_id}</Text>
      <OrderStatusBadge status={o.order_status} />
      {next && <Button title={`Mark as ${next}`} onPress={handleUpdateStatus} style={{ marginTop: 16 }} />}
    </ScrollView>
  );
}
