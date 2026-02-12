import React, { useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchOrders } from '../../store/slices/orderSlice';
import { useSocket } from '../../hooks/useSocket';
import { OrderCard } from '../../components/order/OrderCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function IncomingOrdersScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useSelector((state) => state.auth.user);
  const restaurantId = user?.restaurant_id ?? user?.id;
  const { orders, isLoading } = useSelector((state) => state.order);
  const incoming = orders.filter((o) => o.order_status === 'pending' || o.order_status === 'confirmed');
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

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <View>
        <Text style={styles.headerTitle}>Incoming Orders</Text>
        <Text style={styles.headerSubtitle}>New requests to process</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {renderHeader()}
      <FlatList
        data={incoming}
        keyExtractor={(o) => String(o.order_id)}
        renderItem={({ item }) => (
          <OrderCard
            orderId={item.order_id}
            status={item.order_status}
            totalAmount={item.total_amount}
            createdAt={item.order_date}
            customerName={item.user?.full_name}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.order_id })}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="bell-off-outline"
            title="All caught up!"
            message="No new orders at the moment. We'll alert you when a customer places a new order."
          />
        }
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => dispatch(fetchOrders({}))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...shadows.small,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  list: {
    padding: layout.screenPadding,
    paddingBottom: 100,
  },
});
