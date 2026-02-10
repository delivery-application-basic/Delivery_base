/**
 * AvailableOrdersScreen - Accept delivery requests. Backend: GET /drivers/available, POST /drivers/accept/:orderId
 */

import React, { useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchAvailableOrders, acceptOrder } from '../../store/slices/driverSlice';
import { OrderCard } from '../../components/order/OrderCard';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';

export default function AvailableOrdersScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { availableOrders, isLoading } = useSelector((state) => state.driver);

  useEffect(() => {
    dispatch(fetchAvailableOrders());
  }, [dispatch]);

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
