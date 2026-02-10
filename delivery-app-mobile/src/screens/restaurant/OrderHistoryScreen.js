import React, { useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchOrders } from '../../store/slices/orderSlice';
import { OrderCard } from '../../components/order/OrderCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';

export default function OrderHistoryScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { orders, isLoading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders({}));
  }, [dispatch]);

  if (isLoading && !orders.length) return <Loader fullScreen />;

  return (
    <FlatList
      data={orders}
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
      ListEmptyComponent={<EmptyState message="No orders" />}
    />
  );
}
