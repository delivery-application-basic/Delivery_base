/**
 * HomeScreen - Featured restaurants, search. Backend: GET /restaurants
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
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
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurants</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Icon source="cart" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon source="account" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.searchContainer}>
        <SearchBar value={searchQuery} onChangeText={onSearch} placeholder="Search restaurants..." />
      </View>
      <View style={styles.quickNav}>
        <TouchableOpacity 
          style={styles.quickNavButton}
          onPress={() => navigation.navigate('RestaurantList')}
        >
          <Icon source="store" size={20} color={colors.primary} />
          <Text style={styles.quickNavText}>Browse All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickNavButton}
          onPress={() => navigation.navigate('Orders')}
        >
          <Icon source="clipboard-list" size={20} color={colors.primary} />
          <Text style={styles.quickNavText}>My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickNavButton}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Icon source="heart" size={20} color={colors.primary} />
          <Text style={styles.quickNavText}>Favorites</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={restaurants}
        keyExtractor={(r) => String(r.restaurant_id)}
        renderItem={renderItem}
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
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.backgroundDark,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { 
    ...typography.h1, 
    color: colors.text,
    fontWeight: '700',
    fontSize: 28,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  iconButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  quickNav: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  quickNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  quickNavText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  list: { 
    padding: layout.screenPadding, 
    paddingTop: 8,
    paddingBottom: 100, // Extra padding so content isn't hidden behind tab bar
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
  },
  browseButton: {
    marginTop: spacing.lg,
  },
});
