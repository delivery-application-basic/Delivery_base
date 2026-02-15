import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { fetchOrders } from '../../store/slices/orderSlice';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function DriverDashboardScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);
  const driverName = (user?.full_name ?? user?.name ?? 'Driver').trim().split(' ')[0] || 'Driver';
  const { orders, isLoading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders({}));
  }, [dispatch]);

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.order_date).toDateString() === today);
  const { activeDelivery: activeDeliveryFromRedux } = useSelector((state) => state.driver);
  const activeOrderFromList = orders.find((o) =>
    ['ready', 'picked_up', 'in_transit'].includes(o.order_status)
  );
  const activeDelivery = activeOrderFromList || (activeDeliveryFromRedux?.order_id
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
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Ready for a shift?</Text>
          <Text style={styles.headerTitle}>Hello, {driverName}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
              <Text style={styles.orderId}>#{activeDelivery.order_id}</Text>
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
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AvailableOrders')}
          >
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
  container: {
    flex: 1,
    backgroundColor: colors.gray[50]
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textLight,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '800',
  },
  scrollContent: {
    padding: layout.screenPadding,
  },
  activeDeliveryCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  activeBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  orderId: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    fontSize: 14,
  },
  activeTitle: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '700',
    marginBottom: 16,
  },
  activeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeAction: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 10,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.gray[100],
    minHeight: 80,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
    paddingLeft: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: spacing.md,
    ...shadows.small,
    minHeight: 70,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    flexWrap: 'wrap',
  },
  actionDesc: {
    fontSize: 11,
    color: colors.textLight,
    flex: 1,
    flexWrap: 'wrap',
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: 16,
    gap: 12,
  },
  safetyText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
