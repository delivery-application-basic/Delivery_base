/**
 * MenuManagementScreen - List menu items. Backend: GET /menu/restaurant/:id
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchMenu } from '../../store/slices/menuSlice';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/helpers';

export default function MenuManagementScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const { menuItems, isLoading, restaurantId } = useSelector((state) => state.menu);
  const rid = user?.restaurant_id ?? user?.id ?? restaurantId;

  useEffect(() => {
    if (rid) dispatch(fetchMenu(rid));
  }, [dispatch, rid]);

  if (isLoading && !menuItems?.length) return <Loader fullScreen />;

  const items = menuItems || [];
  return (
    <View style={{ flex: 1, padding: layout.screenPadding }}>
      <Text style={typography.h2}>Menu</Text>
      <Button title="Add item" onPress={() => navigation.navigate('AddMenuItem')} style={{ marginBottom: 16 }} />
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.item_id ?? i.id)}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>{item.item_name ?? item.name}</Text>
            <Text>{formatCurrency(item.price)}</Text>
            <Button title="Edit" compact onPress={() => navigation.navigate('EditMenuItem', { menuItemId: item.item_id ?? item.id })} />
          </View>
        )}
        ListEmptyComponent={<EmptyState message="No menu items" />}
      />
    </View>
  );
}
