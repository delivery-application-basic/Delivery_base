/**
 * RestaurantDashboardScreen - Orders overview. Backend: GET /orders (restaurant's orders)
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchOrders } from '../../store/slices/orderSlice';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function RestaurantDashboardScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const { orders, isLoading } = useSelector((state) => state.order);
  const restaurantId = user?.restaurant_id ?? user?.id;

  useEffect(() => {
    if (restaurantId) dispatch(fetchOrders({}));
  }, [dispatch, restaurantId]);

  const pending = orders.filter((o) => o.order_status === 'pending' || o.order_status === 'confirmed').length;

  if (isLoading && !orders.length) return <Loader fullScreen />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.count}>{orders.length} total orders</Text>
      <Text style={styles.pending}>{pending} pending</Text>
      <Button title="Incoming orders" onPress={() => navigation.navigate('IncomingOrders')} style={styles.btn} />
      <Button title="Active orders" onPress={() => navigation.navigate('ActiveOrders')} mode="outlined" style={styles.btn} />
      <Button title="Menu management" onPress={() => navigation.navigate('MenuManagement')} mode="outlined" style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: layout.screenPadding, backgroundColor: colors.background },
  title: { ...typography.h2, marginBottom: 8 },
  count: { ...typography.body, marginBottom: 4 },
  pending: { ...typography.bodySmall, color: colors.primary, marginBottom: 24 },
  btn: { marginBottom: 12 },
});
