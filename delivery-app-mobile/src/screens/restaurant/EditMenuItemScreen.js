/**
 * EditMenuItemScreen - Update menu item. Backend: PUT /menu/items/:id
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItemById } from '../../store/slices/menuSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { menuService } from '../../api/services/menuService';
import { Loader } from '../../components/common/Loader';
import { layout } from '../../theme/spacing';

export default function EditMenuItemScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const menuItemId = route.params?.menuItemId;
  const { selectedMenuItem, isLoading } = useSelector((state) => state.menu);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (menuItemId) dispatch(fetchMenuItemById(menuItemId));
  }, [dispatch, menuItemId]);

  useEffect(() => {
    if (selectedMenuItem) {
      setName(selectedMenuItem.item_name ?? selectedMenuItem.name ?? '');
      setDescription(selectedMenuItem.description ?? '');
      setPrice(String(selectedMenuItem.price ?? ''));
    }
  }, [selectedMenuItem]);

  const handleSave = async () => {
    if (!name || !price) {
      setError('Name and price required');
      return;
    }
    try {
      await menuService.updateMenuItem(menuItemId, {
        item_name: name,
        description: description || undefined,
        price: parseFloat(price),
      });
      navigation.goBack();
    } catch (e) {
      setError(e.message || 'Failed');
    }
  };

  if (isLoading && !selectedMenuItem) return <Loader fullScreen />;

  return (
    <ScrollView style={{ flex: 1, padding: layout.screenPadding }}>
      <Input label="Name" value={name} onChangeText={setName} />
      <Input label="Description" value={description} onChangeText={setDescription} />
      <Input label="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button title="Save" onPress={handleSave} />
    </ScrollView>
  );
}
