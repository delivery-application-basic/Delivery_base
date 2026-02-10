/**
 * RestaurantDetailScreen - Info, menu link. Backend: GET /restaurants/:id
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchRestaurantById } from '../../store/slices/restaurantSlice';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function RestaurantDetailScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const restaurantId = route.params?.restaurantId;
  const { selectedRestaurant, isLoading } = useSelector((state) => state.restaurant);

  useEffect(() => {
    if (restaurantId) dispatch(fetchRestaurantById(restaurantId));
  }, [dispatch, restaurantId]);

  if (isLoading && !selectedRestaurant) return <Loader fullScreen />;
  if (!selectedRestaurant) return null;

  const r = selectedRestaurant;
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{r.restaurant_name}</Text>
        {r.cuisine_type && <Text style={styles.cuisine}>{r.cuisine_type}</Text>}
        {r.street_address && <Text style={styles.address}>{r.street_address}, {r.city}</Text>}
      </View>
      <Button
        title="View menu"
        onPress={() => navigation.navigate('Menu', { restaurantId: r.restaurant_id })}
        style={styles.btn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: layout.screenPadding },
  name: { ...typography.h2, marginBottom: 4 },
  cuisine: { ...typography.body, color: colors.textSecondary, marginBottom: 4 },
  address: { ...typography.bodySmall, color: colors.textSecondary },
  btn: { margin: layout.screenPadding },
});
