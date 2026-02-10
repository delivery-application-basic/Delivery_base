/**
 * MenuItemDetailScreen - Item details and add to cart. Backend: GET /menu/items/:id, POST /cart/items
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchMenuItemById } from '../../store/slices/menuSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';

export default function MenuItemDetailScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const menuItemId = route.params?.menuItemId;
  const restaurantId = route.params?.restaurantId;
  const { selectedMenuItem, isLoading } = useSelector((state) => state.menu);
  const { isLoading: cartLoading } = useSelector((state) => state.cart);

  useEffect(() => {
    if (menuItemId) dispatch(fetchMenuItemById(menuItemId));
  }, [dispatch, menuItemId]);

  const handleAddToCart = () => {
    if (!menuItemId) return;
    dispatch(addToCart({ menuItemId: parseInt(menuItemId, 10), quantity: 1 }));
    navigation.navigate('Cart');
  };

  if (isLoading && !selectedMenuItem) return <Loader fullScreen />;
  if (!selectedMenuItem) return null;

  const item = selectedMenuItem;
  const name = item.item_name ?? item.name;
  const price = item.price;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      {item.description && <Text style={styles.desc}>{item.description}</Text>}
      <Text style={styles.price}>{formatCurrency(price)}</Text>
      <Button title="Add to cart" onPress={handleAddToCart} loading={cartLoading} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: layout.screenPadding, backgroundColor: colors.background },
  name: { ...typography.h2, marginBottom: 8 },
  desc: { ...typography.body, color: colors.textSecondary, marginBottom: 8 },
  price: { ...typography.h3, color: colors.primary, marginBottom: 24 },
  btn: {},
});
