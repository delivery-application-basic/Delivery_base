/**
 * AddMenuItemScreen - Create menu item. Backend: POST /menu/items
 */

import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { menuService } from '../../api/services/menuService';
import { useSelector } from 'react-redux';
import { layout } from '../../theme/spacing';

export default function AddMenuItemScreen() {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    const restaurantId = user?.restaurant_id ?? user?.id;
    if (!restaurantId || !name || !price) {
      setError('Name and price required');
      return;
    }
    try {
      await menuService.createMenuItem({
        restaurant_id: restaurantId,
        item_name: name,
        description: description || undefined,
        price: parseFloat(price),
        category: category || undefined,
      });
      navigation.goBack();
    } catch (e) {
      setError(e.message || 'Failed');
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: layout.screenPadding }}>
      <Input label="Name" value={name} onChangeText={setName} />
      <Input label="Description" value={description} onChangeText={setDescription} />
      <Input label="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      <Input label="Category" value={category} onChangeText={setCategory} />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button title="Save" onPress={handleSave} />
    </ScrollView>
  );
}
