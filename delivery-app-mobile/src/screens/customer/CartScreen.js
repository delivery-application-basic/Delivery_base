/**
 * CartScreen - Review items, update quantities. Backend: GET /cart, PUT/DELETE cart/items
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchCart, updateCartItem, removeFromCart } from '../../store/slices/cartSlice';
import { CartItem } from '../../components/cart/CartItem';
import { CartSummary } from '../../components/cart/CartSummary';
import { EmptyCart } from '../../components/cart/EmptyCart';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function CartScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items, subtotal, restaurantName, isLoading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  if (isLoading && items.length === 0) return <Loader fullScreen />;
  if (!items.length) return <EmptyCart onBrowseRestaurants={() => navigation.navigate('HomeMain')} />;

  const renderItem = ({ item }) => {
    const product = item.product || item;
    const name = product?.item_name || product?.name;
    const price = parseFloat(product?.price || 0);
    const quantity = item.quantity || 0;
    return (
      <CartItem
        name={name}
        price={price}
        quantity={quantity}
        onIncrease={() => dispatch(updateCartItem({ cartItemId: item.cart_item_id, quantity: quantity + 1 }))}
        onDecrease={() => quantity > 1 && dispatch(updateCartItem({ cartItemId: item.cart_item_id, quantity: quantity - 1 }))}
        onRemove={() => dispatch(removeFromCart(item.cart_item_id))}
      />
    );
  };

  return (
    <View style={styles.container}>
      {restaurantName && <Text style={styles.restaurant}>{restaurantName}</Text>}
      <FlatList data={items} keyExtractor={(i) => String(i.cart_item_id)} renderItem={renderItem} />
      <CartSummary subtotal={subtotal} />
      <Button title="Proceed to checkout" onPress={() => navigation.navigate('Checkout')} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: layout.screenPadding, backgroundColor: colors.background },
  restaurant: { ...typography.h4, marginBottom: 8 },
  btn: { marginTop: 16 },
});
