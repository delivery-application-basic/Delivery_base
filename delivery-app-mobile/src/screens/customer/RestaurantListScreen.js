/**
 * RestaurantListScreen - Filter and search. Backend: GET /restaurants, GET /restaurants/search
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { fetchRestaurants, setFilters } from '../../store/slices/restaurantSlice';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { RestaurantFilter } from '../../components/restaurant/RestaurantFilter';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import useLocation from '../../hooks/useLocation';

export default function RestaurantListScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { restaurants, isLoading, filters } = useSelector((state) => state.restaurant);
  const { location, getCurrentPosition, hasRealLocation } = useLocation();

  useEffect(() => {
    const fetchWithLocation = async () => {
      let activeLoc = null;

      // Only use coordinates if they are "Real" GPS coordinates
      if (hasRealLocation) {
        activeLoc = location;
      } else {
        // Only try to get position if we don't have it yet, 
        // but remember that if GPS is off, this will just return defaultCenter
        activeLoc = await getCurrentPosition();
      }

      const params = {
        filters: {
          cuisine: filters.cuisine,
          city: filters.city,
          latitude: hasRealLocation ? activeLoc?.latitude : null,
          longitude: hasRealLocation ? activeLoc?.longitude : null
        }
      };
      dispatch(fetchRestaurants(params));
    };

    fetchWithLocation();
  }, [dispatch, filters.cuisine, filters.city, getCurrentPosition, hasRealLocation, location]);

  const renderItem = ({ item }) => (
    <RestaurantCard
      name={item.restaurant_name}
      cuisine={item.cuisine_type}
      imageUrl={item.logo_url}
      deliveryFee={item.delivery_fee}
      distance={item.distance}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.restaurant_id })}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon source="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>All Restaurants</Text>
        <View style={styles.placeholder} />
      </View>
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
          ListEmptyComponent={<EmptyState message="No restaurants found" icon="store-off-outline" />}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  list: {
    padding: layout.screenPadding,
    paddingTop: spacing.md,
  },
});
