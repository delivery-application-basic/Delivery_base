import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchOwnerOrders } from '../../store/slices/orderSlice';
import { OrderCard } from '../../components/order/OrderCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const ACTIVE_STATUSES = ['confirmed', 'preparing', 'ready', 'picked_up', 'arrived_at_pickup'];

export default function ActiveOrdersScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { restaurantId: paramResId, branchName } = route.params || {};

  const { orders, isLoading } = useSelector((state) => state.order);
  const active = orders.filter((o) => {
    const matchesStatus = ACTIVE_STATUSES.includes(o.order_status);
    if (paramResId) {
      return matchesStatus && o.restaurant_id === paramResId;
    }
    return matchesStatus;
  });

  useEffect(() => {
    dispatch(fetchOwnerOrders());
  }, [dispatch]);

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
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle} numberOfLines={1}>{branchName ? `${branchName} Progress` : 'In Progress'}</Text>
        <Text style={styles.headerSubtitle} numberOfLines={1}>{branchName ? 'Currently preparing' : 'Manage your current orders'}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {renderHeader()}
      <FlatList
        data={active}
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
            icon="clock-check-outline"
            title="No orders in progress"
            message="When you accept or start preparing an order, it will appear here."
          />
        }
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => dispatch(fetchOwnerOrders())}
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
