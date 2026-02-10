/**
 * AvailableOrdersScreen - Accept delivery requests. Real-time: driver:assignment
 */

import React, { useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchAvailableOrders, acceptOrder } from '../../store/slices/driverSlice';
import { useSocket } from '../../hooks/useSocket';
import { OrderCard } from '../../components/order/OrderCard';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';

export default function AvailableOrdersScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  const driverId = user?.driver_id ?? user?.id;
  const { availableOrders, isLoading } = useSelector((state) => state.driver);
  const { joinDriverRoom, leaveDriverRoom, subscribeToDriverAssignment } = useSocket();

  useEffect(() => {
    dispatch(fetchAvailableOrders());
  }, [dispatch]);

  useEffect(() => {
    if (driverId == null) return;
    joinDriverRoom(driverId);
    const unsubscribe = subscribeToDriverAssignment(() => {
      dispatch(fetchAvailableOrders());
    });
    return () => {
      unsubscribe();
      leaveDriverRoom(driverId);
    };
  }, [driverId, joinDriverRoom, leaveDriverRoom, subscribeToDriverAssignment, dispatch]);

  const handleAccept = async (orderId) => {
    try {
      await dispatch(acceptOrder(orderId)).unwrap();
      navigation.navigate('ActiveDelivery');
    } catch (e) {}
  };

  if (isLoading && !availableOrders.length) return <Loader fullScreen />;

  return (
    <FlatList
      data={availableOrders}
      keyExtractor={(o) => String(o.order_id)}
      renderItem={({ item }) => (
        <View style={{ marginBottom: 8 }}>
          <OrderCard
            orderId={item.order_id}
            status={item.order_status}
            totalAmount={item.total_amount}
            createdAt={item.order_date}
            restaurantName={item.restaurant?.restaurant_name}
          />
          <Button title="Accept" onPress={() => handleAccept(item.order_id)} />
        </View>
      )}
      ListEmptyComponent={<EmptyState message="No available orders" />}
    />
  );
}
