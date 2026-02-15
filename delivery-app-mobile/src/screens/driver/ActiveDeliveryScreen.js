import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Loader } from '../../components/common/Loader';
import { deliveryService } from '../../api/services/deliveryService';
import { fetchOrderById } from '../../store/slices/orderSlice';
import { releaseOrder, clearActiveDelivery } from '../../store/slices/driverSlice';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

// Tab bar is ~55px + 8 padding + safe area. Use enough padding so Actions stay fully visible when scrolled to end.
const TAB_BAR_HEIGHT = 70;

// Backend order/delivery status flow: ready -> picked_up -> in_transit -> delivered
const NEXT_STATUS_ACTION = {
  ready: { status: 'picked_up', label: 'Confirm pickup', confirm: 'Have you picked up the order from the restaurant?' },
  picked_up: { status: 'in_transit', label: 'On the way', confirm: 'Start delivery to customer?' },
  in_transit: { status: 'delivered', label: 'Mark as delivered', confirm: 'Confirm that the customer has received the order?' },
};

export default function ActiveDeliveryScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const orderId = route.params?.orderId || useSelector((s) => s.driver.activeDelivery?.order_id);
  const { activeDelivery } = useSelector((state) => state.driver);
  const { selectedOrder, isLoading } = useSelector((state) => state.order);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const order = selectedOrder?.order_id === orderId ? selectedOrder : null;

  useEffect(() => {
    if (orderId) dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  const handleUpdateStatus = () => {
    const current = order?.order_status;
    const next = NEXT_STATUS_ACTION[current];
    if (!next) return;

    Alert.alert(
      'Update status',
      next.confirm,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsUpdating(true);
            try {
              await deliveryService.updateDeliveryStatus(orderId, next.status);
              await dispatch(fetchOrderById(orderId)).unwrap();
              if (next.status === 'delivered') {
                dispatch(clearActiveDelivery());
                Alert.alert(
                  'Delivery complete',
                  'Order delivered. The restaurant has been notified to complete their records and the customer has been notified that the order was received.',
                  [{ text: 'OK', onPress: () => navigation.navigate('DashboardMain') }]
                );
              }
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to update status');
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleReleaseOrder = () => {
    Alert.alert(
      'Reject order',
      'This will put the order back in the pool for other drivers. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setIsReleasing(true);
            try {
              await dispatch(releaseOrder(orderId)).unwrap();
              navigation.navigate('AvailableOrders');
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || e || 'Failed to release order');
            } finally {
              setIsReleasing(false);
            }
          }
        }
      ]
    );
  };

  const handleOpenMap = (latitude, longitude, fallbackAddress) => {
    if (latitude != null && longitude != null && !Number.isNaN(Number(latitude)) && !Number.isNaN(Number(longitude))) {
      Linking.openURL(`https://www.google.com/maps?q=${Number(latitude)},${Number(longitude)}`);
      return;
    }
    if (fallbackAddress && String(fallbackAddress).trim()) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}`);
    }
  };

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  if (!orderId && !activeDelivery) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon source="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Current Delivery</Text>
        </View>
        <EmptyState
          icon="bike-fast"
          title="No Active Delivery"
          message="Go to 'Available Orders' to find your next task."
        />
        <View style={styles.emptyActionContainer}>
          <Button title="Browse Orders" onPress={() => navigation.navigate('AvailableOrders')} style={styles.browseButton} />
        </View>
      </View>
    );
  }

  if (isLoading && !order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon source="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Tracking</Text>
        </View>
        <Loader fullScreen />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon source="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Tracking</Text>
        </View>
        <EmptyState icon="alert" title="Order not found" message="This order may have been cancelled or reassigned." />
        <View style={styles.emptyActionContainer}>
          <Button title="Back to orders" onPress={() => navigation.navigate('AvailableOrders')} style={styles.browseButton} />
        </View>
      </View>
    );
  }

  const pickupAddress = [order.restaurant?.street_address, order.restaurant?.city].filter(Boolean).join(', ');
  const dropAddress = [order.delivery_address?.street_address, order.delivery_address?.city].filter(Boolean).join(', ');
  const restaurantLat = order.restaurant?.latitude != null ? parseFloat(order.restaurant.latitude) : null;
  const restaurantLng = order.restaurant?.longitude != null ? parseFloat(order.restaurant.longitude) : null;
  const deliveryLat = order.delivery_address?.latitude != null ? parseFloat(order.delivery_address.latitude) : null;
  const deliveryLng = order.delivery_address?.longitude != null ? parseFloat(order.delivery_address.longitude) : null;
  const hasRestaurantCoords = restaurantLat != null && restaurantLng != null && !Number.isNaN(restaurantLat) && !Number.isNaN(restaurantLng);
  const hasDeliveryCoords = deliveryLat != null && deliveryLng != null && !Number.isNaN(deliveryLat) && !Number.isNaN(deliveryLng);
  const nextAction = NEXT_STATUS_ACTION[order.order_status];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon source="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: TAB_BAR_HEIGHT + Math.max(insets.bottom, 16) + 24 },
        ]}
      >
        <View style={styles.statusBanner}>
          <View>
            <Text style={styles.orderId}>Order #{order.order_id}</Text>
            <Text style={styles.orderTime}>
              {order.order_date ? new Date(order.order_date).toLocaleString() : ''}
            </Text>
          </View>
          <OrderStatusBadge status={order.order_status} />
        </View>

        <View style={styles.locationsCard}>
          <Text style={styles.locationsTitle}>Check locations</Text>
          <Text style={styles.locationsSubtitle}>Restaurant: registered coordinates. Customer: order delivery address.</Text>
          <View style={styles.locationRow}>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>Restaurant (pickup)</Text>
              <Text style={styles.locationCoords}>
                {hasRestaurantCoords ? `${restaurantLat.toFixed(5)}, ${restaurantLng.toFixed(5)}` : pickupAddress || '—'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.openMapBtn}
              onPress={() => handleOpenMap(restaurantLat, restaurantLng, pickupAddress)}
            >
              <Icon source="map-marker" size={20} color={colors.white} />
              <Text style={styles.openMapBtnText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationRow}>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>Customer (drop-off)</Text>
              <Text style={styles.locationCoords}>
                {hasDeliveryCoords ? `${deliveryLat.toFixed(5)}, ${deliveryLng.toFixed(5)}` : dropAddress || '—'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.openMapBtn}
              onPress={() => handleOpenMap(deliveryLat, deliveryLng, dropAddress)}
            >
              <Icon source="map-marker" size={20} color={colors.white} />
              <Text style={styles.openMapBtnText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View
              style={[
                styles.stepDot,
                ['ready', 'preparing'].includes(order.order_status) ? styles.activeDot : styles.completedDot
              ]}
            />
            <View style={styles.stepLine} />
            <View style={styles.stepInfo}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationLabel}>PICKUP FROM</Text>
                <TouchableOpacity onPress={() => handleCall(order.restaurant?.phone_number)}>
                  <Icon source="phone" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.locationTitle}>{order.restaurant?.restaurant_name || 'Restaurant'}</Text>
              <Text style={styles.locationSubtitle}>{pickupAddress || '—'}</Text>
              {hasRestaurantCoords ? (
                <Text style={styles.registeredHint}>Location from registered coordinates</Text>
              ) : null}
              <TouchableOpacity style={styles.mapLink} onPress={() => handleOpenMap(restaurantLat, restaurantLng, pickupAddress)}>
                <Icon source="google-maps" size={16} color={colors.info} />
                <Text style={styles.mapLinkText}>Directions to restaurant</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.step, { borderLeftWidth: 0 }]}>
            <View
              style={[
                styles.stepDot,
                ['picked_up', 'in_transit'].includes(order.order_status) ? styles.activeDot : order.order_status === 'delivered' ? styles.completedDot : styles.inactiveDot
              ]}
            />
            <View style={styles.stepInfo}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationLabel}>DROP OFF TO</Text>
                <TouchableOpacity onPress={() => handleCall(order.customer?.phone_number)}>
                  <Icon source="phone" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.locationTitle}>{order.customer?.full_name || 'Customer'}</Text>
              <Text style={styles.locationSubtitle}>{dropAddress || '—'}</Text>
              {order.delivery_address?.landmark ? (
                <Text style={styles.landmark}>Landmark: {order.delivery_address.landmark}</Text>
              ) : null}
              {hasDeliveryCoords ? (
                <Text style={styles.registeredHint}>Location from order delivery address</Text>
              ) : null}
              <TouchableOpacity style={styles.mapLink} onPress={() => handleOpenMap(deliveryLat, deliveryLng, dropAddress)}>
                <Icon source="google-maps" size={16} color={colors.info} />
                <Text style={styles.mapLinkText}>Directions to customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Order details</Text>
          {(order.items || []).map((item, idx) => (
            <View key={item.order_item_id || idx} style={styles.itemRow}>
              <Text style={styles.itemLabel}>
                {item.item_name} × {item.quantity}
              </Text>
              <Text style={styles.itemValue}>ETB {item.subtotal ?? item.unit_price * item.quantity}</Text>
            </View>
          ))}
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Total</Text>
            <Text style={styles.itemValue}>ETB {order.total_amount}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Payment</Text>
            <Text style={styles.itemValue}>{order.payment_method || 'Cash on delivery'}</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.actionsTitle}>Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionRejectBtn}
              onPress={handleReleaseOrder}
              disabled={isReleasing}
              activeOpacity={0.8}
            >
              {isReleasing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.actionRejectBtnText}>Reject order</Text>
              )}
            </TouchableOpacity>
            {nextAction ? (
              <TouchableOpacity
                style={styles.actionConfirmBtn}
                onPress={handleUpdateStatus}
                disabled={isUpdating}
                activeOpacity={0.8}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.actionConfirmBtnText}>{nextAction.label}</Text>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  locationsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  locationsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  locationsSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  locationInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  locationName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  locationCoords: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    gap: 6,
  },
  openMapBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 24,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  orderTime: {
    fontSize: 11,
    color: colors.textLight,
  },
  stepContainer: {
    paddingLeft: spacing.md,
  },
  step: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: colors.white,
    zIndex: 1,
    position: 'absolute',
    left: -10,
    top: 0,
  },
  activeDot: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  completedDot: {
    backgroundColor: '#4CAF50',
  },
  inactiveDot: {
    backgroundColor: colors.gray[300],
  },
  stepLine: {
    position: 'absolute',
    left: -1,
    top: 20,
    bottom: -spacing.xl,
    width: 2,
    backgroundColor: colors.gray[200],
  },
  stepInfo: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    marginLeft: spacing.lg,
    ...shadows.small,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 1,
    marginBottom: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  registeredHint: {
    fontSize: 10,
    color: colors.info,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  landmark: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[50],
  },
  mapLinkText: {
    fontSize: 12,
    color: colors.info,
    fontWeight: '600',
  },
  orderSummary: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  actionsSection: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  actionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionRejectBtn: {
    height: 44,
    minWidth: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
  },
  actionRejectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  actionConfirmBtn: {
    flex: 1,
    height: 44,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
  },
  actionConfirmBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  emptyActionContainer: {
    padding: layout.screenPadding,
    alignItems: 'center',
  },
  browseButton: {
    width: '100%',
    height: 56,
  },
});
