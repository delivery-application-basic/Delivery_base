import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { fetchOrderById } from '../../store/slices/orderSlice';
import { useSocket } from '../../hooks/useSocket';
import { orderService } from '../../api/services/orderService';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { layout, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { formatCurrency } from '../../utils/helpers';

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'picked_up' // Ready for delivery
};

const STATUS_TEXT = {
  pending: 'Confirm Order',
  confirmed: 'Start Preparing',
  preparing: 'Mark as Ready',
  ready: 'Out for Delivery'
};

export default function OrderDetailsScreen() {
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

  const handleUpdateStatus = async () => {
    const next = NEXT_STATUS[selectedOrder?.order_status];
    if (!next || !orderId) return;

    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this order as ${next.replace('_', ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await orderService.updateOrderStatus(orderId, next);
              dispatch(fetchOrderById(orderId));
            } catch (e) {
              Alert.alert('Error', 'Failed to update order status');
            }
          }
        }
      ]
    );
  };

  if (isLoading && !selectedOrder) return <Loader fullScreen />;
  if (!selectedOrder) return null;

  const o = selectedOrder;
  const nextStatus = NEXT_STATUS[o.order_status];
  const items = o.items || [];

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Order Details</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{o.order_id}</Text>
            <Text style={styles.orderDate}>{new Date(o.order_date).toLocaleString()}</Text>
          </View>
          <OrderStatusBadge status={o.order_status} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Info</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon source="account" size={20} color={colors.primary} />
              <Text style={styles.infoText}>{o.user?.full_name || 'Guest'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon source="phone" size={20} color={colors.primary} />
              <Text style={styles.infoText}>{o.user?.phone_number || 'N/A'}</Text>
            </View>
            {o.delivery_address && (
              <View style={styles.infoRow}>
                <Icon source="map-marker" size={20} color={colors.primary} />
                <Text style={styles.infoText}>
                  {o.delivery_address.street_address}, {o.delivery_address.city}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsCard}>
            {items.map((item, index) => (
              <View
                key={index}
                style={[styles.itemRow, index === items.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>{item.quantity}x</Text>
                </View>
                <View style={styles.itemMain}>
                  <Text style={styles.itemName}>{item.item_name}</Text>
                  {item.special_instructions && (
                    <Text style={styles.specialInstructions}>{item.special_instructions}</Text>
                  )}
                </View>
                <Text style={styles.itemPrice}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(o.total_amount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{formatCurrency(0)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(o.total_amount)}</Text>
            </View>
            <View style={styles.paymentBox}>
              <Text style={styles.paymentLabel}>Payment Method:</Text>
              <Text style={styles.paymentValue}>{o.payment_method || 'Cash on Delivery'}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {nextStatus && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button
            title={STATUS_TEXT[o.order_status] || `Mark as ${nextStatus}`}
            onPress={handleUpdateStatus}
            loading={isLoading}
            style={styles.actionButton}
          />
        </View>
      )}
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
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    fontSize: 22,
  },
  scrollContent: {
    padding: layout.screenPadding,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  orderId: {
    ...typography.h3,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  orderDate: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
    paddingLeft: 4,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    ...shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: 12,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  itemsCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    ...shadows.small,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    alignItems: 'flex-start',
  },
  quantityBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  itemMain: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  specialInstructions: {
    ...typography.bodySmall,
    color: colors.warning,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemPrice: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    ...shadows.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textLight,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  totalLabel: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
  },
  paymentBox: {
    flexDirection: 'row',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paymentLabel: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  paymentValue: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: layout.screenPadding,
    ...shadows.medium,
  },
  actionButton: {
    height: 56,
  },
});
