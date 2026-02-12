import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { fetchAvailableOrders, acceptOrder } from '../../store/slices/driverSlice';
import { useSocket } from '../../hooks/useSocket';
import { OrderCard } from '../../components/order/OrderCard';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';

export default function AvailableOrdersScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useSelector((state) => state.auth.user);
  const driverId = user?.driver_id ?? user?.id;
  const { availableOrders, isLoading } = useSelector((state) => state.driver);
  const { joinDriverRoom, leaveDriverRoom, subscribeToDriverAssignment } = useSocket();

  useEffect(() => {
    dispatch(fetchAvailableOrders());
  }, [dispatch]);

  useEffect(() => {
    if (driverId == null) return;
    joinDriverRoom(driverId);
    const unsubscribe = subscribeToDriverAssignment(() => {
      dispatch(fetchAvailableOrders());
    });
    return () => {
      unsubscribe();
      leaveDriverRoom(driverId);
    };
  }, [driverId, joinDriverRoom, leaveDriverRoom, subscribeToDriverAssignment, dispatch]);

  const handleAccept = async (orderId) => {
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
              Alert.alert('Error', 'Failed to accept order. It might have been taken by another driver.');
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
        renderItem={({ item }) => (
          <View style={styles.orderContainer}>
            <OrderCard
              orderId={item.order_id}
              status={item.order_status}
              totalAmount={item.total_amount}
              createdAt={item.order_date}
              restaurantName={item.restaurant?.restaurant_name}
            />
            <Button
              title="Accept Delivery"
              onPress={() => handleAccept(item.order_id)}
              style={styles.acceptButton}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="map-search"
            title="Searching for orders..."
            message="We'll notify you when new orders become available in your area."
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
  acceptButton: {
    marginTop: -spacing.sm, // Slight overlap with card for connected feel
    borderRadius: 16,
    height: 50,
  },
});
