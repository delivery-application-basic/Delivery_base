/**
 * DriverDashboardScreen - Earnings, deliveries today. Backend: GET /orders (driver's orders)
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchOrders } from '../../store/slices/orderSlice';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export default function DriverDashboardScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { orders, isLoading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders({}));
  }, [dispatch]);

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.order_date).toDateString() === today);

  if (isLoading && !orders.length) return <Loader fullScreen />;

  return (
    <View style={{ flex: 1, padding: layout.screenPadding }}>
      <Text style={typography.h2}>Dashboard</Text>
      <Text style={typography.body}>{orders.length} total deliveries</Text>
      <Text style={typography.bodySmall}>{todayOrders.length} today</Text>
      <Button title="Available orders" onPress={() => navigation.navigate('AvailableOrders')} style={{ marginTop: 16 }} />
      <Button title="Delivery history" onPress={() => navigation.navigate('DeliveryHistory')} mode="outlined" style={{ marginTop: 12 }} />
    </View>
  );
}
