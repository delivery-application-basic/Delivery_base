/**
 * TrackOrderScreen - 5-stage tracking. Backend: GET /orders/:id/tracking
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { fetchOrderTracking } from '../../store/slices/orderSlice';
import { OrderTimeline } from '../../components/order/OrderTimeline';
import { DeliveryMap } from '../../components/map/DeliveryMap';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function TrackOrderScreen() {
  const dispatch = useDispatch();
  const route = useRoute();
  const orderId = route.params?.orderId;
  const { orderTracking, isLoading } = useSelector((state) => state.order);

  useEffect(() => {
    if (orderId) dispatch(fetchOrderTracking(orderId));
  }, [dispatch, orderId]);

  if (isLoading && !orderTracking) return <Loader fullScreen />;
  if (!orderTracking) return null;

  const t = orderTracking;
  const timeline = t.timeline || [];
  const restaurantLocation = t.restaurant?.latitude != null ? { latitude: t.restaurant.latitude, longitude: t.restaurant.longitude } : null;
  const deliveryAddress = t.delivery_address?.latitude != null ? { latitude: t.delivery_address.latitude, longitude: t.delivery_address.longitude } : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.current_stage_label ?? 'Tracking'}</Text>
      <OrderTimeline timeline={timeline} />
      {(restaurantLocation || deliveryAddress) && (
        <DeliveryMap restaurantLocation={restaurantLocation} deliveryLocation={deliveryAddress} style={styles.map} />
      )}
      {t.estimated_delivery_at && (
        <Text style={styles.eta}>Estimated: {new Date(t.estimated_delivery_at).toLocaleString()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: layout.screenPadding, backgroundColor: colors.background },
  title: { ...typography.h2, marginBottom: 16 },
  map: { marginTop: 16, height: 200 },
  eta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 16 },
});
