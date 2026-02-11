/**
 * RestaurantDashboardScreen - Orders overview. Backend: GET /orders (restaurant's orders)
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchOrders } from '../../store/slices/orderSlice';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

import { ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { spacing as spacingTheme } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function RestaurantDashboardScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);
  const { orders, isLoading } = useSelector((state) => state.order);
  const restaurantId = user?.restaurant_id ?? user?.id;

  useEffect(() => {
    if (restaurantId) dispatch(fetchOrders({}));
  }, [dispatch, restaurantId]);

  const pendingCount = orders.filter((o) => o.order_status === 'pending' || o.order_status === 'confirmed').length;
  const activeCount = orders.filter((o) => o.order_status === 'preparing' || o.order_status === 'ready').length;

  if (isLoading && !orders.length) return <Loader fullScreen />;

  const DashboardCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.cardIconContainer, { backgroundColor: color + '15' }]}>
        <Icon source={icon} size={26} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Icon source="chevron-right" size={20} color={colors.gray[300]} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Good morning,</Text>
          <Text style={styles.headerTitle}>{user?.restaurant_name || 'Restaurant'}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon source="account-circle" size={36} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statsSection}>
          <DashboardCard
            title="Orders to Confirm"
            value={pendingCount}
            icon="clock-alert-outline"
            color={colors.warning}
            onPress={() => navigation.navigate('IncomingOrders')}
          />
          <DashboardCard
            title="Orders in Progress"
            value={activeCount}
            icon="bowl-mix-outline"
            color={colors.primary}
            onPress={() => navigation.navigate('ActiveOrders')}
          />
          <DashboardCard
            title="Completed Today"
            value={orders.filter(o => o.order_status === 'delivered').length}
            icon="check-circle-outline"
            color={colors.secondary}
            onPress={() => navigation.navigate('OrderHistory')}
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Menu')}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#FF8A65' }]}>
                <Icon source="silverware-fork-knife" size={24} color={colors.white} />
              </View>
              <Text style={styles.actionLabel}>Products</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#4DB6AC' }]}>
                <Icon source="history" size={24} color={colors.white} />
              </View>
              <Text style={styles.actionLabel}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Profile', { screen: 'Settings' })}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#90A4AE' }]}>
                <Icon source="cog" size={24} color={colors.white} />
              </View>
              <Text style={styles.actionLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.promoCard}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Grow your business</Text>
            <Text style={styles.promoText}>Check tips to improve your delivery speed and rating.</Text>
          </View>
          <Icon source="lightning-bolt" size={32} color={colors.warning} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacingTheme.md,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '800',
  },
  profileButton: {
    padding: 2,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacingTheme.md,
  },
  statsSection: {
    gap: spacingTheme.md,
    marginBottom: spacingTheme.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 20,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardValue: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  quickActions: {
    marginBottom: spacingTheme.xl,
  },
  sectionLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 16,
    paddingLeft: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#37474F',
    padding: 20,
    borderRadius: 24,
    gap: 16,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  promoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
  },
});
