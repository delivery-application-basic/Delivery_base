/**
 * CheckoutScreen - Select address, payment method, confirm order. Backend: POST /orders { address_id, payment_method, special_instructions }
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { createOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { CartSummary } from '../../components/cart/CartSummary';
import { PAYMENT_METHODS } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function CheckoutScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { subtotal, items } = useSelector((state) => state.cart);
  const { isLoading, error } = useSelector((state) => state.order);

  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);
  const [specialInstructions, setSpecialInstructions] = useState('');

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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Input label="Address ID" value={addressId} onChangeText={setAddressId} keyboardType="number-pad" placeholder="1" />
      <Text style={styles.section}>Payment</Text>
      <View style={styles.radioRow}>
        <Button title="Cash" mode={paymentMethod === PAYMENT_METHODS.CASH ? 'contained' : 'outlined'} onPress={() => setPaymentMethod(PAYMENT_METHODS.CASH)} />
        <Button title="Telebirr" mode={paymentMethod === PAYMENT_METHODS.TELEBIRR ? 'contained' : 'outlined'} onPress={() => setPaymentMethod(PAYMENT_METHODS.TELEBIRR)} />
      </View>
      <Input label="Special instructions" value={specialInstructions} onChangeText={setSpecialInstructions} placeholder="Optional" />
      <CartSummary subtotal={subtotal} />
      {error && <Text style={styles.err}>{error}</Text>}
      <Button title="Place order" onPress={handlePlaceOrder} loading={isLoading} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: layout.screenPadding, backgroundColor: colors.background },
  title: { ...typography.h2, marginBottom: 16 },
  section: { ...typography.h4, marginTop: 8, marginBottom: 8 },
  radioRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  err: { color: colors.error, marginBottom: 8 },
  btn: { marginTop: 16 },
});
