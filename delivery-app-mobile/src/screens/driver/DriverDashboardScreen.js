import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { fetchOrders } from '../../store/slices/orderSlice';
import {
  updateDriverAvailability,
  fetchDriverProfile,
  fetchAvailableOrders,
  acceptOrder,
  rejectOrder,
} from '../../store/slices/driverSlice';
import { useSocket } from '../../hooks/useSocket';
import { useDriverLocationTracker } from '../../hooks/useDriverLocationTracker';
import { driverService } from '../../api/services/driverService';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const POPUP_DURATION_MS = 45000;

export default function DriverDashboardScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);
  const driverId = user?.driver_id ?? user?.id;
  const driverName = (user?.full_name ?? user?.name ?? 'Driver').trim().split(' ')[0] || 'Driver';
  const { orders, isLoading } = useSelector((state) => state.order);
  const { activeDelivery: activeDeliveryFromRedux, isAvailable } = useSelector((state) => state.driver);
  const { subscribeToDriverAssignment, subscribeToOrderTaken, joinDriverRoom, leaveDriverRoom } = useSocket();

  // Popup state
  const [popup, setPopup] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const popupTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const popupOrderIdRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(1)).current;

  const activeOrderFromList = orders.find((o) =>
    ['picked_up', 'in_transit'].includes(o.order_status)
  );
  const isOnDelivery = !!(activeOrderFromList || activeDeliveryFromRedux?.order_id);

  const { retryTracking, lastLocation, lastPlaceName } = useDriverLocationTracker(isAvailable, isOnDelivery);

  useEffect(() => {
    dispatch(fetchOrders({}));
    dispatch(fetchDriverProfile());
  }, [dispatch]);

  // --- Popup helpers ---
  const dismissPopup = useCallback(() => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    popupTimerRef.current = null;
    countdownRef.current = null;
    popupOrderIdRef.current = null;
    progressAnim.stopAnimation();
    setPopup(null);
    setCountdown(0);
  }, [progressAnim]);

  const showPopup = useCallback((orderId, durationMs = POPUP_DURATION_MS) => {
    if (!orderId || durationMs <= 0) return;
    dismissPopup();
    popupOrderIdRef.current = orderId;
    const seconds = Math.ceil(durationMs / 1000);
    setCountdown(seconds);
    setPopup({ orderId });

    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: durationMs,
      useNativeDriver: false,
    }).start();

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    popupTimerRef.current = setTimeout(() => {
      dismissPopup();
    }, durationMs);
  }, [dismissPopup, progressAnim]);

  // --- Socket: listen for assignment offers & order taken ---
  useEffect(() => {
    if (!driverId || !isAvailable) {
      dismissPopup();
      return;
    }

    joinDriverRoom(driverId);

    // On mount, check for any pending assignment already waiting
    (async () => {
      try {
        const res = await driverService.getPendingAssignments();
        const list = res?.data?.data ?? res?.data ?? [];
        if (!Array.isArray(list) || list.length === 0) return;
        const latest = list[0];
        const oid = latest?.Order?.order_id ?? latest?.order_id;
        if (!oid) return;
        const timeout = Number(latest?.timeout_seconds ?? 45);
        const offeredAt = latest?.offered_at ? new Date(latest.offered_at).getTime() : Date.now();
        const remaining = Math.max(0, timeout * 1000 - (Date.now() - offeredAt));
        if (remaining > 2000) showPopup(oid, remaining);
      } catch (_) { /* keep dashboard usable */ }
    })();

    const unsubAssign = subscribeToDriverAssignment((payload) => {
      const oid = payload?.order_id;
      if (!oid) return;
      showPopup(oid, (Number(payload?.timeout_seconds) || 45) * 1000);
      dispatch(fetchAvailableOrders());
    });

    const unsubTaken = subscribeToOrderTaken((payload) => {
      if (payload?.order_id && payload.order_id === popupOrderIdRef.current) dismissPopup();
      dispatch(fetchAvailableOrders());
    });

    return () => {
      unsubAssign();
      unsubTaken();
      leaveDriverRoom(driverId);
    };
  }, [driverId, isAvailable, joinDriverRoom, leaveDriverRoom, subscribeToDriverAssignment, subscribeToOrderTaken, dispatch, showPopup, dismissPopup]);

  // --- Accept / Reject ---
  const handleAccept = async () => {
    if (!popup?.orderId) return;
    const oid = popup.orderId;
    try {
      await dispatch(acceptOrder(oid)).unwrap();
      dismissPopup();
      navigation.navigate('ActiveDelivery', { orderId: oid });
    } catch (e) {
      Alert.alert('Could not accept', (typeof e === 'string' ? e : e?.message) || 'Order may have been taken.');
      dismissPopup();
      dispatch(fetchAvailableOrders());
    }
  };

  const handleReject = () => {
    if (!popup?.orderId) return;
    const oid = popup.orderId;
    dispatch(rejectOrder(oid))
      .unwrap()
      .catch(() => {})
      .finally(() => {
        dismissPopup();
        dispatch(fetchAvailableOrders());
      });
  };

  const handleToggleAvailability = () => {
    dispatch(updateDriverAvailability(!isAvailable));
  };

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.order_date).toDateString() === today);
  const activeDeliveryOrder = orders.find((o) =>
    ['ready', 'picked_up', 'in_transit'].includes(o.order_status)
  );
  const activeDelivery = activeDeliveryOrder || (activeDeliveryFromRedux?.order_id
    ? { order_id: activeDeliveryFromRedux.order_id }
    : null);

  if (isLoading && !orders.length) return <Loader fullScreen />;

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Icon source={icon} size={28} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSubtitle}>{isAvailable ? 'You are currently active' : 'Ready for a shift?'}</Text>
          <Text style={styles.headerTitle}>Hello, {driverName}</Text>
          {lastLocation ? (
            <Text style={styles.locationPill} numberOfLines={1} ellipsizeMode="tail">
              {'\uD83D\uDCCD'} {lastPlaceName}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={[
            styles.availabilityButton,
            isAvailable ? styles.buttonOnline : styles.buttonOffline,
            { position: 'absolute', right: layout.screenPadding, top: spacing.lg }
          ]}
          onPress={handleToggleAvailability}
          activeOpacity={0.8}
        >
          <Icon
            source={isAvailable ? 'access-point' : 'access-point-off'}
            size={20}
            color={isAvailable ? colors.success : colors.textLight}
          />
          <Text style={[styles.availabilityText, isAvailable ? styles.textOnline : styles.textOffline]}>
            {isAvailable ? 'ACTIVE' : 'INACTIVE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===== NEW ORDER POPUP ===== */}
      {popup && (
        <View style={styles.popupContainer}>
          <View style={styles.popupCard}>
            {/* Progress bar */}
            <Animated.View
              style={[
                styles.popupProgress,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
            <View style={styles.popupBody}>
              <View style={styles.popupHeader}>
                <Icon source="bell-ring-outline" size={22} color={colors.warning} />
                <Text style={styles.popupTitle}>New Order Available!</Text>
                <View style={styles.countdownBadge}>
                  <Text style={styles.countdownText}>{countdown}s</Text>
                </View>
              </View>
              <Text style={styles.popupText}>
                Order #{popup.orderId} is waiting for a driver.
              </Text>
              <Text style={styles.popupSubText}>
                Accept to start the delivery or reject to pass.
              </Text>
              <View style={styles.popupActions}>
                <TouchableOpacity style={[styles.popupButton, styles.rejectBtn]} onPress={handleReject}>
                  <Icon source="close" size={16} color={colors.error} />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.popupButton, styles.acceptBtn]} onPress={handleAccept}>
                  <Icon source="check" size={16} color={colors.white} />
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeDelivery && (
          <TouchableOpacity
            style={styles.activeDeliveryCard}
            onPress={() => navigation.navigate('ActiveDelivery', { orderId: activeDelivery.order_id })}
          >
            <View style={styles.activeHeader}>
              <View style={styles.activeBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.activeBadgeText}>ACTIVE DELIVERY</Text>
              </View>
              <Text style={styles.activeOrderId}>#{activeDelivery.order_id}</Text>
            </View>
            <Text style={styles.activeTitle}>Ongoing delivery in progress</Text>
            <View style={styles.activeFooter}>
              <Text style={styles.activeAction}>Tap to resume tracking</Text>
              <Icon source="chevron-right" size={20} color={colors.white} />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.statsRow}>
          <StatCard
            title="Today"
            value={todayOrders.length}
            icon="bike"
            color={colors.primary}
            onPress={() => navigation.getParent()?.navigate('History', { screen: 'DeliveryHistory' })}
          />
          <StatCard
            title="Earnings"
            value="ETB 0"
            icon="cash"
            color={colors.secondary}
            onPress={() => navigation.getParent()?.navigate('History', { screen: 'Earnings' })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Actions</Text>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AvailableOrders')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warning + '15' }]}>
              <Icon source="briefcase-search-outline" size={30} color={colors.warning} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Find New Orders</Text>
              <Text style={styles.actionDesc}>Browse available deliveries nearby</Text>
            </View>
            <Icon source="chevron-right" size={24} color={colors.gray[300]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.getParent()?.navigate('History', { screen: 'DeliveryHistory' })}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.info + '15' }]}>
              <Icon source="history" size={30} color={colors.info} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Past Deliveries</Text>
              <Text style={styles.actionDesc}>View your completed orders</Text>
            </View>
            <Icon source="chevron-right" size={24} color={colors.gray[300]} />
          </TouchableOpacity>
        </View>

        <View style={styles.safetyBox}>
          <Icon source="shield-check-outline" size={24} color={colors.primary} />
          <Text style={styles.safetyText}>
            Drive safely and follow the traffic rules for a better rating and more orders.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: layout.screenPadding, paddingVertical: spacing.lg,
    backgroundColor: colors.white, ...shadows.small,
  },
  headerSubtitle: { fontSize: 11, color: colors.textLight },
  headerTitle: { fontSize: 18, color: colors.text, fontWeight: '800' },
  locationPill: { fontSize: 10, color: colors.textLight, marginTop: 3, letterSpacing: 0.2, maxWidth: 200 },
  availabilityButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6, borderWidth: 1.5,
  },
  buttonOnline: { backgroundColor: colors.success + '10', borderColor: colors.success },
  buttonOffline: { backgroundColor: colors.gray[100], borderColor: colors.gray[300] },
  availabilityText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  textOnline: { color: colors.success },
  textOffline: { color: colors.textLight },
  scrollContent: { padding: layout.screenPadding },

  // Popup
  popupContainer: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.sm, zIndex: 10 },
  popupCard: {
    backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1.5, borderColor: colors.warning, ...shadows.medium,
  },
  popupProgress: { height: 4, backgroundColor: colors.warning, borderTopLeftRadius: 16 },
  popupBody: { padding: spacing.md },
  popupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  popupTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.text },
  countdownBadge: {
    backgroundColor: colors.warning + '20', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  countdownText: { fontSize: 12, fontWeight: '800', color: colors.warning },
  popupText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  popupSubText: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  popupActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  popupButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    minWidth: 100, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14,
    justifyContent: 'center',
  },
  rejectBtn: { backgroundColor: colors.error + '12', borderWidth: 1, borderColor: colors.error + '30' },
  acceptBtn: { backgroundColor: colors.success },
  rejectBtnText: { fontSize: 13, fontWeight: '700', color: colors.error },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },

  // Active delivery
  activeDeliveryCard: {
    backgroundColor: colors.primary, borderRadius: 24, padding: spacing.lg,
    marginBottom: spacing.xl, ...shadows.medium,
  },
  activeHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 8,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white },
  activeBadgeText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  activeOrderId: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: 14 },
  activeTitle: { fontSize: 16, color: colors.white, fontWeight: '700', marginBottom: 16 },
  activeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeAction: { color: colors.white, fontWeight: '600', fontSize: 14 },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 20, padding: 10,
    ...shadows.small, borderWidth: 1, borderColor: colors.gray[100], minHeight: 80,
  },
  statIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textLight, fontWeight: '600' },

  // Actions
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 14, color: colors.text, fontWeight: '700', marginBottom: spacing.md, paddingLeft: 4 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 20, padding: 12, marginBottom: spacing.md, ...shadows.small, minHeight: 70,
  },
  actionIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, flex: 1, flexWrap: 'wrap' },
  actionDesc: { fontSize: 11, color: colors.textLight, flex: 1, flexWrap: 'wrap' },

  // Safety
  safetyBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10',
    padding: spacing.md, borderRadius: 16, gap: 12,
  },
  safetyText: { flex: 1, fontSize: 11, color: colors.textSecondary, lineHeight: 16 },
});
