/**
 * HomeScreen - Featured restaurants, search. Backend: GET /restaurants
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { fetchRestaurants, setSearchQuery, setFilters } from '../../store/slices/restaurantSlice';
import useLocation from '../../hooks/useLocation';
import { SearchBar } from '../../components/common/SearchBar';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Text } from '../../components/common/Text';
import { moderateScale, scale, verticalScale } from '../../utils/scaling';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { restaurants, isLoading, error, searchQuery, filters } = useSelector((state) => state.restaurant);
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const { location, getCurrentPosition, hasRealLocation } = useLocation();

  const loadData = useCallback(async (loc = location) => {
    const params = {
      filters: {
        ...filters,
        search: searchQuery
      }
    };
    // Only sort by distance if we have a real GPS location
    if (hasRealLocation && loc?.latitude) {
      params.filters.latitude = loc.latitude;
      params.filters.longitude = loc.longitude;
    }
    dispatch(fetchRestaurants(params));
  }, [dispatch, searchQuery, filters, location, hasRealLocation]);

  // Handle initial load and filter changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Request location once on mount
  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  const onRefresh = async () => {
    setRefreshing(true);
    const loc = await getCurrentPosition();
    await loadData(loc);
    setRefreshing(false);
  };

  const onSearch = (q) => dispatch(setSearchQuery(q));

  const toggleCategory = (cuisine) => {
    if (filters.cuisine === cuisine) {
      dispatch(fetchRestaurants({ filters: { ...filters, cuisine: null, search: searchQuery } }));
      // Normally we'd use setFilters but simpler here to just call directly
      // Wait, let's stick to setFilters pattern
      dispatch(require('../../store/slices/restaurantSlice').setFilters({ cuisine: null }));
    } else {
      dispatch(require('../../store/slices/restaurantSlice').setFilters({ cuisine }));
    }
  };

  const categories = [
    { id: '1', name: 'Pizza', icon: 'pizza' },
    { id: '2', name: 'Burgers', icon: 'food-burger' },
    { id: '3', name: 'Sushi', icon: 'food-croissant' },
    { id: '4', name: 'Ethiopian', icon: 'pot' },
    { id: '5', name: 'Coffee', icon: 'coffee' },
    { id: '6', name: 'More', icon: 'dots-horizontal' },
  ];

  const renderItem = ({ item }) => {
    // Ensure restaurant name is always a valid string - handle all possible field names
    let restaurantName = 'Restaurant';
    if (item.restaurant_name) {
      restaurantName = String(item.restaurant_name).trim();
    } else if (item.name) {
      restaurantName = String(item.name).trim();
    } else if (item.restaurantName) {
      restaurantName = String(item.restaurantName).trim();
    }

    // Fallback if name is empty or invalid
    if (!restaurantName || restaurantName === '' || restaurantName === 'null' || restaurantName === 'undefined') {
      restaurantName = 'Restaurant';
    }

    // Ensure rating is valid
    const restaurantRating = item.average_rating || item.rating || 4.5;

    return (
      <RestaurantCard
        name={restaurantName}
        cuisine={item.cuisine_type || 'International'}
        imageUrl={item.logo_url || item.cover_image_url}
        rating={restaurantRating}
        deliveryFee={item.delivery_fee || 0}
        distance={item.distance}
        onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.restaurant_id })}
      />
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.deliveryLabel}>Delivery to</Text>
          <TouchableOpacity style={styles.locationSelector}>
            <Text style={styles.locationText}>{user?.address || 'Current Location'}</Text>
            <Icon source="chevron-down" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <View style={styles.cartBadgeContainer}>
              <Icon source="cart-outline" size={26} color={colors.text} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar value={searchQuery} onChangeText={onSearch} placeholder="Search restaurants, dishes..." />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {categories.map((cat) => {
          const isSelected = filters.cuisine === cat.name;
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => toggleCategory(cat.name)}
            >
              <View style={[
                styles.categoryIconContainer,
                isSelected && styles.categoryIconSelected
              ]}>
                <Icon source={cat.icon} size={24} color={isSelected ? colors.white : colors.primary} />
              </View>
              <Text style={[
                styles.categoryText,
                isSelected && styles.categoryTextSelected
              ]}>{cat.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {hasRealLocation ? 'Restaurants Near You' : 'Featured Restaurants'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('RestaurantList')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const onRetry = () => dispatch(fetchRestaurants({ filters: { search: searchQuery } }));

  const listEmptyComponent =
    isLoading && restaurants.length === 0 ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading restaurants…</Text>
        <Text style={styles.loadingHint}>Check that backend is running and PC IP is correct in constants.js</Text>
      </View>
    ) : error ? (
      <View style={styles.emptyContainer}>
        <EmptyState
          message={error}
          icon="wifi-off"
        />
        <Button title="Retry" onPress={onRetry} style={styles.browseButton} />
      </View>
    ) : (
      <View style={styles.emptyContainer}>
        <EmptyState message="No restaurants found" icon="store-off-outline" />
        <Button
          title="Browse All Restaurants"
          onPress={() => navigation.navigate('RestaurantList')}
          style={styles.browseButton}
        />
      </View>
    );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={restaurants}
        keyExtractor={(r) => String(r.restaurant_id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        ListEmptyComponent={listEmptyComponent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  deliveryLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: spacing.xs,
    backgroundColor: colors.gray[50],
    borderRadius: moderateScale(12),
  },
  searchContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  categoryList: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    width: 60,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    ...shadows.small,
  },
  categoryIconSelected: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  list: {
    paddingBottom: verticalScale(100), // Account for floating tab bar
  },
  loadingContainer: {
    paddingVertical: verticalScale(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  loadingHint: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  browseButton: {
    marginTop: spacing.lg,
    width: '80%',
  },
});
