import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { CartSummary } from '../../components/cart/CartSummary';
import { PAYMENT_METHODS } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import Geolocation from '@react-native-community/geolocation';
import { customerService } from '../../api/services/customerService';

export default function CheckoutScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { subtotal, items } = useSelector((state) => state.cart);
  const { isLoading, error } = useSelector((state) => state.order);

  const [addressId, setAddressId] = useState(route.params?.addressId || '');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      let granted = false;
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        granted = auth === 'granted';
      } else {
        const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        granted = permission === PermissionsAndroid.RESULTS.GRANTED;
      }
      if (!granted) {
        throw new Error('Location permission not granted');
      }
      // Proceed with getting location
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocode using Pelias
            const response = await fetch(`https://api.geocode.earth/v1/reverse?point.lat=${latitude}&point.lon=${longitude}&size=1`);
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              const feature = data.features[0];
              const properties = feature.properties;
              const addressData = {
                address_label: 'Current Location',
                street_address: properties.name || properties.label || 'Unknown Address',
                city: properties.locality || properties.region || 'Unknown City',
                sub_city: properties.neighbourhood || '',
                latitude,
                longitude,
              };
              const res = await customerService.addAddress(addressData);
              setAddressId(res.data.address_id);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
          }
        },
        (error) => {
          console.error('Location error:', error); // Changed from console.log to console.error
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error('Location permission error:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  useEffect(() => {
    if (route.params?.addressId) {
      setAddressId(route.params.addressId);
    }
  }, [route.params?.addressId]);

  useEffect(() => {
    if (!addressId && !isGettingLocation) {
      getCurrentLocation();
    }
  }, [addressId, isGettingLocation]);

  const handlePlaceOrder = async () => {
    const numAddressId = parseInt(addressId, 10);
    if (!numAddressId) return;
    try {
      const result = await dispatch(createOrder({
        address_id: numAddressId,
        payment_method: paymentMethod,
        special_instructions: specialInstructions || undefined,
      })).unwrap();
      const order = result.data ?? result.order ?? result;
      dispatch(clearCart());
      if (order?.order_id) navigation.navigate('OrderDetail', { orderId: order.order_id });
      else navigation.navigate('OrderHistory');
    } catch (e) {
      // error in state
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon source="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SelectAddress')}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressCard}>
            <Icon source="map-marker-outline" size={24} color={colors.primary} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressText}>
                {isGettingLocation ? 'Getting your location...' : addressId ? `Address ID: ${addressId}` : 'No address selected'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === PAYMENT_METHODS.CASH && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod(PAYMENT_METHODS.CASH)}
            >
              <Icon source="cash" size={24} color={paymentMethod === PAYMENT_METHODS.CASH ? colors.primary : colors.textLight} />
              <Text style={[styles.paymentText, paymentMethod === PAYMENT_METHODS.CASH && styles.paymentTextSelected]}>Cash on Delivery</Text>
              {paymentMethod === PAYMENT_METHODS.CASH && <Icon source="check-circle" size={20} color={colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === PAYMENT_METHODS.TELEBIRR && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod(PAYMENT_METHODS.TELEBIRR)}
            >
              <Icon source="wallet-outline" size={24} color={paymentMethod === PAYMENT_METHODS.TELEBIRR ? colors.primary : colors.textLight} />
              <Text style={[styles.paymentText, paymentMethod === PAYMENT_METHODS.TELEBIRR && styles.paymentTextSelected]}>Telebirr</Text>
              {paymentMethod === PAYMENT_METHODS.TELEBIRR && <Icon source="check-circle" size={20} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <CartSummary subtotal={subtotal} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <Input
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            placeholder="Add a note (e.g. door code, landmarks)"
            multiline
            numberOfLines={2}
          />
        </View>

        {error && <View style={styles.errorContainer}><Text style={styles.err}>{error}</Text></View>}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={isLoading}
          disabled={!addressId}
          style={styles.placeOrderBtn}
        />
      </View>
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
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
  },
  scrollContent: {
    padding: layout.screenPadding,
    paddingBottom: 150,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  changeText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    gap: spacing.md,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  paymentOptions: {
    gap: spacing.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  paymentText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  paymentTextSelected: {
    color: colors.text,
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: colors.errorLight + '20',
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  err: { color: colors.error, fontWeight: '600' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    ...shadows.large,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  placeOrderBtn: {
  },
});
