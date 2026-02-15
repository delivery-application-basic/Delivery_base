/**
 * TrackOrderScreen - Customer sees order steps only (Order issued, Payment verified, Processing food, etc.).
 * No delivery/driver location; real-time updates via order:tracking-update.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { fetchOrderTracking } from '../../store/slices/orderSlice';
import { useSocket } from '../../hooks/useSocket';
import { OrderTimeline } from '../../components/order/OrderTimeline';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { spacing as spacingTheme } from '../../theme/spacing';

export default function TrackOrderScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const orderId = route.params?.orderId;
  const { orderTracking, isLoading } = useSelector((state) => state.order);
  const { subscribeToOrderTracking } = useSocket();

  useEffect(() => {
    if (orderId) dispatch(fetchOrderTracking(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = subscribeToOrderTracking(orderId, () => {
      dispatch(fetchOrderTracking(orderId));
    });
    return unsubscribe;
  }, [orderId, subscribeToOrderTracking, dispatch]);

  if (isLoading && !orderTracking) return <Loader fullScreen />;
  if (!orderTracking) return null;

  const t = orderTracking;
  const timeline = t.timeline || [];

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Track Order</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + spacingTheme.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <Text style={styles.stageLabel}>{t.current_stage_label ?? 'Tracking Order'}</Text>
          {t.estimated_delivery_at && (
            <Text style={styles.eta}>
              Estimated Delivery: {new Date(t.estimated_delivery_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        <View style={styles.timelineSection}>
          <OrderTimeline timeline={timeline} />
        </View>
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
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacingTheme.md,
  },
  backButton: {
    padding: spacingTheme.xs,
    marginRight: spacingTheme.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: layout.screenPadding,
  },
  contentContainer: {
    paddingTop: 0,
  },
  statusCard: {
    backgroundColor: colors.primary + '10',
    padding: spacingTheme.lg,
    borderRadius: 20,
    marginBottom: spacingTheme.xl,
    alignItems: 'center',
  },
  stageLabel: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  eta: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timelineSection: {
    marginBottom: spacingTheme.xl,
  },
});
