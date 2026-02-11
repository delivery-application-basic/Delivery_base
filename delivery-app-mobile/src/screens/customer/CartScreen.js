/**
 * CartScreen - Review items, update quantities. Backend: GET /cart, PUT/DELETE cart/items
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { fetchCart, updateCartItem, removeFromCart } from '../../store/slices/cartSlice';
import { CartItem } from '../../components/cart/CartItem';
import { CartSummary } from '../../components/cart/CartSummary';
import { EmptyCart } from '../../components/cart/EmptyCart';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon source="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Cart</Text>
        <View style={styles.placeholder} />
      </View>
      {restaurantName && <Text style={styles.restaurant}>{restaurantName}</Text>}
      <FlatList 
        data={items} 
        keyExtractor={(i) => String(i.cart_item_id)} 
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />
      <View style={styles.footer}>
        <CartSummary subtotal={subtotal} />
        <Button title="Proceed to checkout" onPress={() => navigation.navigate('Checkout')} style={styles.btn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  restaurant: { 
    ...typography.h4, 
    marginBottom: 8,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    color: colors.textSecondary,
  },
  list: {
    padding: layout.screenPadding,
    paddingTop: spacing.sm,
  },
  footer: {
    backgroundColor: colors.background,
    padding: layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  btn: { 
    marginTop: spacing.md,
  },
});
