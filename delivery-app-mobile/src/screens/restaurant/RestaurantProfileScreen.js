import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function RestaurantProfileScreen() {
  const { user } = useSelector((state) => state.auth);
  const name = user?.restaurant_name ?? user?.name ?? 'Restaurant';
  return (
    <View style={{ padding: layout.screenPadding }}>
      <Text style={typography.h2}>Profile</Text>
      <Text style={typography.body}>{name}</Text>
    </View>
  );
}
