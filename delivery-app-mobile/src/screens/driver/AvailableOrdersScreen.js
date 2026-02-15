import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { fetchAvailableOrders, acceptOrder } from '../../store/slices/driverSlice';
import { useSocket } from '../../hooks/useSocket';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

// Extra padding so list and Accept buttons sit above the bottom tab bar
const TAB_BAR_OFFSET = 70;

export default function AvailableOrdersScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useSelector((state) => state.auth.user);
  const driverId = user?.driver_id ?? user?.id;
  const { availableOrders, isLoading } = useSelector((state) => state.driver);
  const { joinDriverRoom, leaveDriverRoom, subscribeToOrderTaken, subscribeToOrderAvailable } = useSocket();

  useEffect(() => {
    dispatch(fetchAvailableOrders());
  }, [dispatch]);

  useEffect(() => {
    if (driverId == null) return;
    joinDriverRoom(driverId);
    const unsubTaken = subscribeToOrderTaken(() => dispatch(fetchAvailableOrders()));
    const unsubAvailable = subscribeToOrderAvailable(() => dispatch(fetchAvailableOrders()));
    return () => {
      unsubTaken();
      unsubAvailable();
      leaveDriverRoom(driverId);
    };
  }, [driverId, joinDriverRoom, leaveDriverRoom, subscribeToOrderTaken, subscribeToOrderAvailable, dispatch]);

  const handleAccept = (orderId) => {
    Alert.alert(
      'Accept Delivery',
      'Are you sure you want to take this delivery?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await dispatch(acceptOrder(orderId)).unwrap();
              navigation.navigate('ActiveDelivery', { orderId });
            } catch (e) {
              const msg = (typeof e === 'string' ? e : e?.message) || 'Failed to accept. It might have been taken by another driver.';
              Alert.alert('Could not accept', msg);
              dispatch(fetchAvailableOrders());
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <View>
        <Text style={styles.headerTitle}>Available Orders</Text>
        <Text style={styles.headerSubtitle}>{availableOrders.length} potential deliveries</Text>
      </View>
    </View>
  );

  if (isLoading && !availableOrders.length) return <Loader fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}
      <FlatList
        data={availableOrders}
        keyExtractor={(o) => String(o.order_id)}
        renderItem={({ item }) => {
          const customer = item.customer || {};
          const restaurant = item.restaurant || {};
          const address = item.delivery_address || {};
          const deliveryAddress = [address.street_address, address.city].filter(Boolean).join(', ') || '—';
          return (
            <View style={styles.orderContainer}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderId}>#{item.order_id}</Text>
                    <Text style={styles.orderStatusBadge}>
                      {item.order_status === 'ready' ? 'Ready for pickup' : 'Preparing'}
                    </Text>
                  </View>
                  <Text style={styles.orderDate}>{formatDateTime(item.order_date)}</Text>
                </View>
                <View style={styles.infoBlock}>
                  <View style={styles.infoRow}>
                    <Icon source="account-outline" size={18} color={colors.primary} />
                    <Text style={styles.infoLabel}>Customer: </Text>
                    <Text style={styles.infoText}>{customer.full_name || '—'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon source="phone-outline" size={18} color={colors.primary} />
                    <Text style={styles.infoLabel}>Phone: </Text>
                    <Text style={styles.infoText}>{customer.phone_number || '—'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon source="store-outline" size={18} color={colors.primary} />
                    <Text style={styles.infoLabel}>Restaurant: </Text>
                    <Text style={styles.infoText} numberOfLines={1}>{restaurant.restaurant_name || '—'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon source="map-marker-outline" size={18} color={colors.primary} />
                    <Text style={styles.infoLabel}>Delivery: </Text>
                    <Text style={styles.infoText} numberOfLines={2}>{deliveryAddress}</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>{formatCurrency(item.total_amount)}</Text>
                </View>
                <Button
                  title="Accept Delivery"
                  onPress={() => handleAccept(item.order_id)}
                  style={styles.acceptButton}
                />
              </View>
            </View>
          );
        }}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + TAB_BAR_OFFSET }]}
        ListEmptyComponent={
          <EmptyState
            icon="map-search"
            title="No orders right now"
            message="When a restaurant marks an order ready, it will appear here. Pull to refresh."
          />
        }
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => dispatch(fetchAvailableOrders())}
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
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textLight,
  },
  list: {
    padding: layout.screenPadding,
    paddingBottom: 100,
  },
  orderContainer: {
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  orderStatusBadge: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  infoBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  acceptButton: {
    borderRadius: 16,
    minHeight: 48,
  },
});
