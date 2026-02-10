/**
 * OrderDetailScreen - Full order info. Real-time status updates via socket.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchOrderById, cancelOrder } from '../../store/slices/orderSlice';
import { useSocket } from '../../hooks/useSocket';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { OrderSummary } from '../../components/order/OrderSummary';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';
import { formatDateTime } from '../../utils/helpers';

export default function OrderDetailScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = route.params?.orderId;
  const { selectedOrder, isLoading } = useSelector((state) => state.order);
  const { subscribeToOrderTracking } = useSocket();

  useEffect(() => {
    if (orderId) dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = subscribeToOrderTracking(orderId, () => {
      dispatch(fetchOrderById(orderId));
    });
    return unsubscribe;
  }, [orderId, subscribeToOrderTracking, dispatch]);

  if (isLoading && !selectedOrder) return <Loader fullScreen />;
  if (!selectedOrder) return null;

  const o = selectedOrder;
  const canCancel = o.order_status === 'pending' || o.order_status === 'confirmed';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.id}>Order #{o.order_id}</Text>
        <OrderStatusBadge status={o.order_status} />
      </View>
      <Text style={styles.date}>{formatDateTime(o.order_date)}</Text>
      {o.restaurant && <Text style={styles.restaurant}>{o.restaurant.restaurant_name}</Text>}
      {o.items?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {o.items.map((item) => (
            <Text key={item.order_item_id}>{item.quantity}x {item.menu_item?.item_name ?? item.item_name}</Text>
          ))}
        </View>
      )}
      <OrderSummary subtotal={o.subtotal} deliveryFee={o.delivery_fee} serviceFee={o.service_fee} total={o.total_amount} />
      {canCancel && (
        <Button title="Cancel order" onPress={() => dispatch(cancelOrder({ orderId: o.order_id, reason: 'User requested' }))} mode="outlined" />
      )}
      <Button title="Track order" onPress={() => navigation.navigate('TrackOrder', { orderId: o.order_id })} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: layout.screenPadding, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  id: { ...typography.h2 },
  date: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 8 },
  restaurant: { ...typography.body, marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { ...typography.h4, marginBottom: 8 },
  btn: { marginTop: 16 },
});
