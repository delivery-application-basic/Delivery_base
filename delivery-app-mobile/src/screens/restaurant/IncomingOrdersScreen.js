/**
 * IncomingOrdersScreen - New orders (pending). Real-time: order:created
 */

import React, { useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchOrders } from '../../store/slices/orderSlice';
import { useSocket } from '../../hooks/useSocket';
import { OrderCard } from '../../components/order/OrderCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';

export default function IncomingOrdersScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  const restaurantId = user?.restaurant_id ?? user?.id;
  const { orders, isLoading } = useSelector((state) => state.order);
  const incoming = orders.filter((o) => o.order_status === 'pending');
  const { joinRestaurantRoom, leaveRestaurantRoom, subscribeToNewOrders } = useSocket();

  useEffect(() => {
    dispatch(fetchOrders({}));
  }, [dispatch]);

  useEffect(() => {
    if (restaurantId == null) return;
    joinRestaurantRoom(restaurantId);
    const unsubscribe = subscribeToNewOrders(() => {
      dispatch(fetchOrders({}));
    });
    return () => {
      unsubscribe();
      leaveRestaurantRoom(restaurantId);
    };
  }, [restaurantId, joinRestaurantRoom, leaveRestaurantRoom, subscribeToNewOrders, dispatch]);

  if (isLoading && !orders.length) return <Loader fullScreen />;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={incoming}
        keyExtractor={(o) => String(o.order_id)}
        renderItem={({ item }) => (
          <OrderCard
            orderId={item.order_id}
            status={item.order_status}
            totalAmount={item.total_amount}
            createdAt={item.order_date}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.order_id })}
          />
        )}
        ListEmptyComponent={<EmptyState message="No incoming orders" />}
      />
    </View>
  );
}
