import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { CartSummary } from '../../components/cart/CartSummary';
import { PAYMENT_METHODS } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { useLocation } from '../../hooks/useLocation';
import { geocodingService } from '../../api/services/geocodingService';
import { customerService } from '../../api/services/customerService';

export default function CheckoutScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // Important: Selecting both subtotal and items to ensure Redux updates correctly
  const { subtotal, items } = useSelector((state) => state.cart);
  const { isLoading, error: orderError } = useSelector((state) => state.order);

  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(route.params?.addressId || '');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' or 'pickup'
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectionError, setDetectionError] = useState(null);

  const { getLocationWithPermission, checkLocationService } = useLocation();

  const filterClutter = useCallback((list) => {
    return list.filter(a => {
      const label = a.address_label?.toLowerCase();
      return !['detected location', 'current location', 'one-time delivery (gps)'].includes(label);
    });
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await customerService.getAddresses();
      const rawList = response.data?.data || response.data || [];
      const list = filterClutter(rawList);
      setAddresses(list);

      // Default selection logic: Home > Work > School > First Available
      if (!addressId && !route.params?.addressId) {
        const home = list.find(a => a.address_label?.toLowerCase() === 'home');
        const work = list.find(a => a.address_label?.toLowerCase() === 'work');
        const school = list.find(a => a.address_label?.toLowerCase() === 'school');

        const defaultAddr = home || work || school || list[0];
        if (defaultAddr) {
          setAddressId(defaultAddr.address_id);
          setSelectedAddress(defaultAddr);
        }
      } else if (addressId) {
        const addr = list.find(a => String(a.address_id) === String(addressId));
        if (addr) setSelectedAddress(addr);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  }, [addressId, route.params?.addressId, filterClutter]);

  useEffect(() => {
    fetchAddresses();
  }, [addressId, route.params?.addressId, fetchAddresses]);

  // Handle address selection from route params
  useEffect(() => {
    if (route.params?.addressId) {
      setAddressId(route.params.addressId);
    }
  }, [route.params?.addressId]);

  const detectOneTimeLocation = useCallback(async () => {
    if (isDetectingLocation) return;
    try {
      setIsDetectingLocation(true);
      if ((await checkLocationService()) !== 'enabled') throw new Error('GPS Disabled');
      const coords = await getLocationWithPermission();
      if (!coords) throw new Error('Permission denied');

      const addressData = await geocodingService.reverseGeocode(coords.latitude, coords.longitude);

      const tempAddress = {
        address_label: 'One-time Delivery (GPS)',
        street_address: addressData?.street_address || 'Current Location',
        sub_city: addressData?.sub_city || '',
        city: addressData?.city || 'Addis Ababa',
        latitude: coords.latitude,
        longitude: coords.longitude
      };

      setAddressId(null); // Clear saved ID so backend knows it's a raw object
      setSelectedAddress(tempAddress);
    } catch (err) {
      Alert.alert('Location Error', 'Could not detect your location. Please check GPS settings.');
    } finally {
      setIsDetectingLocation(false);
    }
  }, [checkLocationService, getLocationWithPermission]);

  const detectAndSaveAs = useCallback(async (label) => {
    if (isDetectingLocation) return;
    try {
      setIsDetectingLocation(true);
      if ((await checkLocationService()) !== 'enabled') throw new Error('GPS Disabled');
      const coords = await getLocationWithPermission();
      if (!coords) throw new Error('Permission denied');

      const addressData = await geocodingService.reverseGeocode(coords.latitude, coords.longitude);

      const payload = {
        address_label: label,
        street_address: addressData?.street_address || 'Current Location',
        sub_city: addressData?.sub_city || '',
        city: addressData?.city || 'Addis Ababa',
        latitude: coords.latitude,
        longitude: coords.longitude
      };

      const res = await customerService.addAddress(payload);
      const newAddr = res.data?.data || res.data;

      if (newAddr?.address_id) {
        setAddressId(newAddr.address_id);
        setSelectedAddress(newAddr);
        fetchAddresses(); // Refresh list
      }
    } catch (err) {
      Alert.alert('Location Error', 'Could not set your location. Please check GPS settings.');
    } finally {
      setIsDetectingLocation(false);
    }
  }, [fetchAddresses, checkLocationService, getLocationWithPermission, isDetectingLocation]);

  const handlePlaceOrder = async () => {
    if (!addressId && !selectedAddress && deliveryType !== 'pickup') {
      Alert.alert('Address Required', 'Please select a delivery address');
      return;
    }
    try {
      const result = await dispatch(createOrder({
        address_id: addressId ? parseInt(addressId, 10) : undefined,
        address_data: !addressId ? selectedAddress : undefined,
        payment_method: paymentMethod,
        special_instructions: specialInstructions || undefined,
        delivery_type: deliveryType,
      })).unwrap();
      const order = result.data ?? result.order ?? result;
      dispatch(clearCart());
      if (order?.order_id) {
        navigation.navigate('Orders', {
          screen: 'OrderDetail',
          params: { orderId: order.order_id },
        });
      } else {
        navigation.navigate('Orders', { screen: 'OrderHistory' });
      }
    } catch (e) { }
  };

  const renderAddressSection = () => {
    if (isDetectingLocation) {
      return (
        <View style={styles.addressCard}>
          <ActivityIndicator size="small" color={colors.primary} />
          <View style={styles.addressInfo}>
            <Text style={styles.addressText}>Detecting location...</Text>
          </View>
        </View>
      );
    }

    if (selectedAddress) {
      return (
        <View style={styles.addressCard}>
          <View style={styles.addressIconCircle}>
            <Icon
              source={selectedAddress.address_label?.toLowerCase() === 'home' ? 'home' : selectedAddress.address_label?.toLowerCase() === 'work' ? 'briefcase' : 'map-marker'}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={styles.addressInfo}>
            <Text style={styles.addressName}>{selectedAddress.address_label}</Text>
            <Text style={styles.addressText}>{selectedAddress.street_address}</Text>
            <Text style={styles.addressSubText}>{selectedAddress.sub_city}, {selectedAddress.city}</Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.detectBtnLarge}
        onPress={detectOneTimeLocation}
      >
        <Icon source="crosshairs-gps" size={24} color={colors.primary} />
        <View style={styles.addressInfo}>
          <Text style={styles.detectBtnText}>Detect My Location</Text>
          <Text style={styles.detectBtnSubtext}>Tap to find your current address</Text>
        </View>
      </TouchableOpacity>
    );
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
          <Text style={styles.sectionTitle}>Order Type</Text>
          <View style={styles.deliveryTypeContainer}>
            <TouchableOpacity
              style={[styles.typeOption, deliveryType === 'delivery' && styles.typeOptionSelected]}
              onPress={() => setDeliveryType('delivery')}
            >
              <Icon source="truck-delivery" size={24} color={deliveryType === 'delivery' ? colors.primary : colors.textLight} />
              <Text style={[styles.typeText, deliveryType === 'delivery' && styles.typeTextSelected]}>Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeOption, deliveryType === 'pickup' && styles.typeOptionSelected]}
              onPress={() => setDeliveryType('pickup')}
            >
              <Icon source="shopping" size={24} color={deliveryType === 'pickup' ? colors.primary : colors.textLight} />
              <Text style={[styles.typeText, deliveryType === 'pickup' && styles.typeTextSelected]}>Self-Pickup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {deliveryType === 'delivery' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SelectAddress')}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
            {renderAddressSection()}
          </View>
        )}

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

        {orderError && <View style={styles.errorContainer}><Text style={styles.err}>{orderError}</Text></View>}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={isLoading}
          disabled={(!addressId && !selectedAddress && deliveryType !== 'pickup') || isDetectingLocation}
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
    paddingBottom: 180, // Increased to clear fixed footer
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
  addressCardContainer: {
    gap: spacing.sm,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 16,
  },
  addressInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  addressSubText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 4,
  },
  retryText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
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
  deliveryTypeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.gray[100],
    gap: 8,
  },
  typeOptionSelected: {
    backgroundColor: colors.primary + '08',
    borderColor: colors.primary,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeTextSelected: {
    color: colors.primary,
  },
  addressSection: {
    backgroundColor: colors.gray[50],
    borderRadius: 20,
    padding: spacing.md,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.gray[100],
    position: 'relative',
  },
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotEmpty: {
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
  },
  slotOther: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[200],
    borderRadius: 16,
  },
  slotLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 4,
  },
  slotLabelSelected: {
    color: colors.white,
  },
  slotAction: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    position: 'absolute',
    top: 6,
    right: 8,
  },
  selectedAddressDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  addressIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  addressName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  addressText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  addressSubText: {
    fontSize: 10,
    color: colors.textLight,
  },
  detectingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: 8,
  },
  detectingText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  }
});
