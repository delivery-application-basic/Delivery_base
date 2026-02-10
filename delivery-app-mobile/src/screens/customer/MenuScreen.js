/**
 * MenuScreen - Browse menu items. Backend: GET /menu/restaurant/:id or GET /restaurants/:id (includes menu_items)
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchMenu } from '../../store/slices/menuSlice';
import { MenuItemCard } from '../../components/menu/MenuItemCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function MenuScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const restaurantId = route.params?.restaurantId;
  const { menuItems, isLoading } = useSelector((state) => state.menu);

  useEffect(() => {
    if (restaurantId) dispatch(fetchMenu(restaurantId));
  }, [dispatch, restaurantId]);

  if (isLoading && (!menuItems || menuItems.length === 0)) return <Loader fullScreen />;

  const items = menuItems || [];
  const renderItem = ({ item }) => {
    const name = item.item_name || item.name;
    const price = item.price;
    const imageUrl = item.image_url;
    return (
      <MenuItemCard
        name={name}
        description={item.description}
        price={price}
        imageUrl={imageUrl}
        unavailable={item.is_available === false}
        onPress={() => navigation.navigate('MenuItemDetail', { menuItemId: item.item_id || item.id })}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.item_id || item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No menu items" />}
      />
      <Button
        title="View cart"
        onPress={() => navigation.navigate('Cart')}
        style={styles.cartBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h2, padding: layout.screenPadding },
  list: { padding: layout.screenPadding },
  cartBtn: { margin: layout.screenPadding },
});
