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

  const [addressId, setAddressId] = useState(route.params?.addressId || '');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectionError, setDetectionError] = useState(null);

  const { getLocationWithPermission } = useLocation();

  // Load address details when addressId changes
  useEffect(() => {
    const fetchAddressDetails = async () => {
      if (!addressId) return;
      try {
        const response = await customerService.getAddresses();
        const addressList = response.data?.data || response.data;
        if (Array.isArray(addressList)) {
          const address = addressList.find(a => String(a.address_id) === String(addressId));
          if (address) {
            setSelectedAddress(address);
          }
        }
      } catch (err) {
        console.error('Failed to fetch address details:', err);
      }
    };
    fetchAddressDetails();
  }, [addressId]);

  // Handle address selection from route params
  useEffect(() => {
    if (route.params?.addressId) {
      setAddressId(route.params.addressId);
    }
  }, [route.params?.addressId]);

  // Auto-detect location function
  const detectLocation = useCallback(async (isManual = false) => {
    if ((addressId && !isManual) || isDetectingLocation) return;
    
    try {
      setIsDetectingLocation(true);
      setDetectionError(null);
      
      const coords = await getLocationWithPermission();
      
      if (!coords || !coords.latitude) {
        throw new Error('Could not get coordinates');
      }
      
      const addressData = await geocodingService.reverseGeocode(coords.latitude, coords.longitude);
      
      if (!addressData) {
        throw new Error('Could not resolve address');
      }

      const newAddressResponse = await customerService.addAddress({
        address_label: isManual ? 'Detected Location' : 'Current Location',
        street_address: addressData.street_address || 'Current Location',
        sub_city: addressData.sub_city || '',
        city: addressData.city || 'Addis Ababa',
        landmark: addressData.landmark || '',
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      
      const newAddress = newAddressResponse.data?.data || newAddressResponse.data;
      if (newAddress && newAddress.address_id) {
        setAddressId(newAddress.address_id);
        setSelectedAddress(newAddress);
      }
    } catch (err) {
      setDetectionError(err.message || 'Location failed');
    } finally {
      setIsDetectingLocation(false);
    }
  }, [addressId, getLocationWithPermission, isDetectingLocation]);

  useEffect(() => {
    // Automatic detection disabled to ensure stability
  }, []);

  const handlePlaceOrder = async () => {
    const numAddressId = parseInt(addressId, 10);
    if (!numAddressId) {
      Alert.alert('Address Required', 'Please select a delivery address');
      return;
    }
    try {
      const result = await dispatch(createOrder({
        address_id: numAddressId,
        payment_method: paymentMethod,
        special_instructions: specialInstructions || undefined,
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
    } catch (e) {}
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
          <Icon source="map-marker" size={24} color={colors.primary} />
          <View style={styles.addressInfo}>
            <Text style={styles.addressLabel}>{selectedAddress.address_label || 'Selected Address'}</Text>
            <Text style={styles.addressText}>{selectedAddress.street_address}</Text>
            <Text style={styles.addressSubText}>{selectedAddress.sub_city}, {selectedAddress.city}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.addressCardContainer}>
        <View style={styles.addressCard}>
          <Icon source="map-marker-outline" size={24} color={colors.textLight} />
          <View style={styles.addressInfo}>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              {detectionError || 'No address selected'}
            </Text>
          </View>
        </View>
        {!addressId && !isDetectingLocation && (
          <TouchableOpacity 
            onPress={() => detectLocation(true)} 
            style={styles.detectButton}
          >
            <Icon source="crosshairs-gps" size={16} color={colors.primary} />
            <Text style={styles.detectButtonText}>Detect My Location</Text>
          </TouchableOpacity>
        )}
      </View>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SelectAddress')}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          {renderAddressSection()}
          {detectionError && (
            <TouchableOpacity onPress={() => detectLocation(true)} style={styles.retryButton}>
              <Icon source="refresh" size={16} color={colors.primary} />
              <Text style={styles.retryText}>Retry GPS</Text>
            </TouchableOpacity>
          )}
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

        {orderError && <View style={styles.errorContainer}><Text style={styles.err}>{orderError}</Text></View>}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={isLoading}
          disabled={!addressId || isDetectingLocation}
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
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  detectButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  addressInfo: {
    flex: 1,
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
});
