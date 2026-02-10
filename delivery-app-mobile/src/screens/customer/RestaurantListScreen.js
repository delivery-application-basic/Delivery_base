/**
 * RestaurantListScreen - Filter and search. Backend: GET /restaurants, GET /restaurants/search
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchRestaurants, setFilters } from '../../store/slices/restaurantSlice';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { RestaurantFilter } from '../../components/restaurant/RestaurantFilter';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function RestaurantListScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { restaurants, isLoading, filters } = useSelector((state) => state.restaurant);

  useEffect(() => {
    dispatch(fetchRestaurants({ filters: { cuisine: filters.cuisine, city: filters.city } }));
  }, [dispatch, filters.cuisine, filters.city]);

  const renderItem = ({ item }) => (
    <RestaurantCard
      name={item.restaurant_name}
      cuisine={item.cuisine_type}
      imageUrl={item.logo_url}
      deliveryFee={item.delivery_fee}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.restaurant_id })}
    />
  );

  return (
    <View style={styles.container}>
      <RestaurantFilter
        selectedCuisine={filters.cuisine}
        onCuisineChange={(c) => dispatch(setFilters({ cuisine: c === 'All' ? null : c }))}
      />
      {isLoading && restaurants.length === 0 ? (
        <Loader fullScreen />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(r) => String(r.restaurant_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState message="No restaurants found" />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: layout.screenPadding },
});
