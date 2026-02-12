/**
 * HomeScreen - Featured restaurants, search. Backend: GET /restaurants
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { fetchRestaurants, setSearchQuery } from '../../store/slices/restaurantSlice';
import { SearchBar } from '../../components/common/SearchBar';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
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
  const { restaurants, isLoading, error, searchQuery } = useSelector((state) => state.restaurant);
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchRestaurants({ filters: { search: searchQuery } }));
  }, [dispatch, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchRestaurants({ filters: { search: searchQuery } }));
    setRefreshing(false);
  };

  const onSearch = (q) => dispatch(setSearchQuery(q));

  const categories = [
    { id: '1', name: 'Pizza', icon: 'pizza' },
    { id: '2', name: 'Burgers', icon: 'food-burger' },
    { id: '3', name: 'Sushi', icon: 'food-croissant' },
    { id: '4', name: 'Ethiopian', icon: 'pot' },
    { id: '5', name: 'Coffee', icon: 'coffee' },
    { id: '6', name: 'More', icon: 'dots-horizontal' },
  ];

  const renderItem = ({ item }) => (
    <RestaurantCard
      name={item.restaurant_name}
      cuisine={item.cuisine_type}
      imageUrl={item.logo_url}
      rating={item.rating || 4.5}
      deliveryFee={item.delivery_fee}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.restaurant_id })}
    />
  );

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
        {categories.map((cat) => (
          <TouchableOpacity key={cat.id} style={styles.categoryItem}>
            <View style={styles.categoryIconContainer}>
              <Icon source={cat.icon} size={24} color={colors.primary} />
            </View>
            <Text style={styles.categoryText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Restaurants</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RestaurantList')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && restaurants.length === 0) return <Loader fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={restaurants}
        keyExtractor={(r) => String(r.restaurant_id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState message="No restaurants found" icon="store-off-outline" />
            <Button
              title="Browse All Restaurants"
              onPress={() => navigation.navigate('RestaurantList')}
              style={styles.browseButton}
            />
          </View>
        }
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
    fontSize: typography.fontSize.xs,
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
    fontSize: typography.fontSize.md,
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
    width: scale(70),
  },
  categoryIconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    backgroundColor: colors.gray[50],
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(8),
    ...shadows.small,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  list: {
    paddingBottom: verticalScale(100), // Account for floating tab bar
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
