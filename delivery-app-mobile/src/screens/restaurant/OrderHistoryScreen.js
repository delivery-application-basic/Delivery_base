import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { fetchOwnerOrders } from '../../store/slices/orderSlice';
import { OrderCard } from '../../components/order/OrderCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';

export default function OrderHistoryScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { restaurantId: paramResId, branchName } = route.params || {};

  const { orders, isLoading } = useSelector((state) => state.order);
  const filteredOrders = orders.filter(o => {
    if (paramResId) return o.restaurant_id === paramResId;
    return true;
  });

  useEffect(() => {
    dispatch(fetchOwnerOrders());
  }, [dispatch]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle} numberOfLines={1}>{branchName ? `${branchName} History` : 'Order History'}</Text>
      </View>
    </View>
  );

  if (isLoading && !orders.length) return <Loader fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}
      <FlatList
        data={filteredOrders}
        keyExtractor={(o) => String(o.order_id)}
        renderItem={({ item }) => (
          <OrderCard
            orderId={item.order_id}
            status={item.order_status}
            totalAmount={item.total_amount}
            createdAt={item.order_date}
            customerName={item.customer?.full_name ?? item.user?.full_name}
            deliveryType={item.delivery_type}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.order_id })}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-off-outline"
            message="No order history available"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
  },
  headerTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 20,
  },
  list: {
    padding: layout.screenPadding,
    paddingBottom: 100,
  },
});
