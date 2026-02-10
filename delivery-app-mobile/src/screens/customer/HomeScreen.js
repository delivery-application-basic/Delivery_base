/**
 * HomeScreen - Featured restaurants, search. Backend: GET /restaurants
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchRestaurants, setSearchQuery } from '../../store/slices/restaurantSlice';
import { SearchBar } from '../../components/common/SearchBar';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { restaurants, isLoading, error, searchQuery } = useSelector((state) => state.restaurant);

  useEffect(() => {
    dispatch(fetchRestaurants({ filters: { search: searchQuery } }));
  }, [dispatch, searchQuery]);

  const onSearch = (q) => dispatch(setSearchQuery(q));

  const renderItem = ({ item }) => (
    <RestaurantCard
      name={item.restaurant_name}
      cuisine={item.cuisine_type}
      imageUrl={item.logo_url}
      rating={item.rating}
      deliveryFee={item.delivery_fee}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.restaurant_id })}
    />
  );

  if (isLoading && restaurants.length === 0) return <Loader fullScreen />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurants</Text>
      <SearchBar value={searchQuery} onChangeText={onSearch} placeholder="Search restaurants..." />
      <FlatList
        data={restaurants}
        keyExtractor={(r) => String(r.restaurant_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No restaurants found" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h2, paddingHorizontal: layout.screenPadding, paddingTop: layout.screenPadding, marginBottom: 8 },
  list: { padding: layout.screenPadding, paddingTop: 8 },
});
