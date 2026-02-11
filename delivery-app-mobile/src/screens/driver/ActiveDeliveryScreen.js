import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { driverService } from '../../api/services/driverService';
import { fetchOrders } from '../../store/slices/orderSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const NEXT_DRIVER_STATUS = {
  confirmed: 'arrived_at_pickup',
  arrived_at_pickup: 'picked_up',
  picked_up: 'arrived_at_customer',
  arrived_at_customer: 'delivered'
};

const STATUS_ACTION_TEXT = {
  confirmed: 'I have Arrived at Restaurant',
  arrived_at_pickup: 'Confirm Pickup',
  picked_up: 'I have Arrived at Customer',
  arrived_at_customer: 'Confirm Delivery'
};

export default function ActiveDeliveryScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { activeDelivery } = useSelector((state) => state.driver);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    const nextStatus = NEXT_DRIVER_STATUS[activeDelivery?.order_status];
    if (!nextStatus) return;

    Alert.alert(
      'Update Status',
      `Are you sure you want to ${STATUS_ACTION_TEXT[activeDelivery.order_status]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsUpdating(true);
            try {
              await driverService.updateDeliveryStatus(activeDelivery.order_id, nextStatus);
              dispatch(fetchOrders({}));
              // In a real app, you'd probably have a specific fetchActiveDelivery action
            } catch (e) {
              Alert.alert('Error', 'Failed to update status');
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleOpenMap = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  if (!activeDelivery) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
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
          <Button
            title="Browse Orders"
            onPress={() => navigation.navigate('AvailableOrders')}
            style={styles.browseButton}
          />
        </View>
      </View>
    );
  }

  const o = activeDelivery;
  const nextStatus = NEXT_DRIVER_STATUS[o.order_status];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon source="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statusBanner}>
          <View>
            <Text style={styles.orderId}>Order #{o.order_id}</Text>
            <Text style={styles.orderTime}>{new Date(o.order_date).toLocaleTimeString()}</Text>
          </View>
          <OrderStatusBadge status={o.order_status} />
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View style={[styles.stepDot, o.order_status === 'confirmed' || o.order_status === 'arrived_at_pickup' ? styles.activeDot : styles.completedDot]} />
            <View style={styles.stepLine} />
            <View style={styles.stepInfo}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationLabel}>PICKUP FROM</Text>
                <TouchableOpacity onPress={() => handleCall(o.restaurant?.phone_number)}>
                  <Icon source="phone" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.locationTitle}>{o.restaurant?.restaurant_name}</Text>
              <Text style={styles.locationSubtitle}>{o.restaurant?.address}</Text>
              <TouchableOpacity
                style={styles.mapLink}
                onPress={() => handleOpenMap(o.restaurant?.address)}
              >
                <Icon source="google-maps" size={16} color={colors.info} />
                <Text style={styles.mapLinkText}>Directions to restaurant</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.step, { borderLeftWidth: 0 }]}>
            <View style={[styles.stepDot, o.order_status === 'picked_up' || o.order_status === 'arrived_at_customer' ? styles.activeDot : o.order_status === 'delivered' ? styles.completedDot : styles.inactiveDot]} />
            <View style={styles.stepInfo}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationLabel}>DROP OFF TO</Text>
                <TouchableOpacity onPress={() => handleCall(o.user?.phone_number)}>
                  <Icon source="phone" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.locationTitle}>{o.user?.full_name}</Text>
              <Text style={styles.locationSubtitle}>
                {o.delivery_address?.street_address}, {o.delivery_address?.city}
              </Text>
              <TouchableOpacity
                style={styles.mapLink}
                onPress={() => handleOpenMap(`${o.delivery_address?.street_address}, ${o.delivery_address?.city}`)}
              >
                <Icon source="google-maps" size={16} color={colors.info} />
                <Text style={styles.mapLinkText}>Directions to customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Delivery Summary</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Items to collect:</Text>
            <Text style={styles.itemValue}>{o.items?.length || 0} items</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Total Price:</Text>
            <Text style={styles.itemValue}>ETB {o.total_amount}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Payment Method:</Text>
            <Text style={styles.itemValue}>{o.payment_method || 'Cash on Delivery'}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {nextStatus && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button
            title={STATUS_ACTION_TEXT[o.order_status]}
            onPress={handleUpdateStatus}
            loading={isUpdating}
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
    ...typography.h3,
    fontWeight: '800',
    color: colors.text,
  },
  orderTime: {
    ...typography.bodySmall,
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
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  locationSubtitle: {
    ...typography.bodySmall,
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
    ...shadows.small,
  },
  sectionTitle: {
    ...typography.h4,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  itemValue: {
    ...typography.body,
    fontWeight: '600',
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
  emptyActionContainer: {
    padding: layout.screenPadding,
    alignItems: 'center',
  },
  browseButton: {
    width: '100%',
    height: 56,
  },
});
