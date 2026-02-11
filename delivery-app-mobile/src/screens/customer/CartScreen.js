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

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shadows } from '../../theme/shadows';

export default function CartScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon source="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Cart</Text>
      </View>

      {restaurantName && (
        <View style={styles.restaurantContainer}>
          <Icon source="store-outline" size={20} color={colors.primary} />
          <Text style={styles.restaurant}>{restaurantName}</Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.cart_item_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <CartSummary subtotal={subtotal} />
        <Button
          title="Proceed to checkout"
          onPress={() => navigation.navigate('Checkout')}
          style={styles.btn}
          contentStyle={{ height: 50 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
  title: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    fontSize: 22,
  },
  restaurantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[50],
    marginHorizontal: layout.screenPadding,
    borderRadius: 12,
    gap: 8,
    marginBottom: spacing.md,
  },
  restaurant: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  list: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 200,
  },
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
  btn: {
    marginTop: spacing.md,
  },
});
