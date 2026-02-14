import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchOrderById, cancelOrder } from '../../store/slices/orderSlice';
import { useSocket } from '../../hooks/useSocket';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { OrderSummary } from '../../components/order/OrderSummary';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { formatDateTime } from '../../utils/helpers';
import { shadows } from '../../theme/shadows';

export default function OrderDetailScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const orderId = route.params?.orderId;
  const { selectedOrder, isLoading } = useSelector((state) => state.order);
  const { subscribeToOrderTracking } = useSocket();

  useEffect(() => {
    if (orderId) dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = subscribeToOrderTracking(orderId, () => {
      dispatch(fetchOrderById(orderId));
    });
    return unsubscribe;
  }, [orderId, subscribeToOrderTracking, dispatch]);

  if (isLoading && !selectedOrder) return <Loader fullScreen />;
  if (!selectedOrder) return null;

  const o = selectedOrder;
  const canCancel = o.order_status === 'pending' || o.order_status === 'confirmed';

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Order Details</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.id}>Order #{o.order_id}</Text>
            <Text style={styles.date}>{formatDateTime(o.order_date)}</Text>
          </View>
          <OrderStatusBadge status={o.order_status} />
        </View>

        {o.restaurant && (
          <View style={styles.restaurantSection}>
            <View style={styles.restaurantInfo}>
              <Icon source="store-outline" size={20} color={colors.primary} />
              <Text style={styles.restaurantName}>{o.restaurant.restaurant_name}</Text>
            </View>
            <Text style={styles.address}>{o.restaurant.street_address}, {o.restaurant.city}</Text>
          </View>
        )}

        {o.items?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {o.items.map((item) => (
              <View key={item.order_item_id} style={styles.orderItem}>
                <View style={styles.itemQuantity}>
                  <Text style={styles.quantityText}>{item.quantity}x</Text>
                </View>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.menu_item?.item_name ?? item.item_name}
                </Text>
                <Text style={styles.itemPrice}>
                  {o.subtotal ? formatDateTime.currency : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.summarySection}>
          <OrderSummary
            subtotal={o.subtotal}
            deliveryFee={o.delivery_fee}
            serviceFee={o.service_fee}
            total={o.total_amount}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Track Order"
            onPress={() => navigation.navigate('TrackOrder', { orderId: o.order_id })}
            style={styles.trackBtn}
          />
          {canCancel && (
            <Button
              title="Cancel Order"
              onPress={() => dispatch(cancelOrder({ orderId: o.order_id, reason: 'User requested' }))}
              mode="outlined"
              style={styles.cancelBtn}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
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
  title: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 100, // Increased padding to ensure room for buttons
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  id: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4,
  },
  restaurantSection: {
    marginBottom: spacing.xl,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  address: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 28,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemQuantity: {
    width: 32,
    height: 32,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  summarySection: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
  trackBtn: {
  },
  cancelBtn: {
    borderColor: colors.error,
  },
});
