/**
 * FavoritesScreen - Display user's favorite restaurants
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const favorites = []; // TODO: Fetch from Redux or API

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon source="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Favorites</Text>
        <View style={styles.placeholder} />
      </View>

      {favorites.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No favorites yet"
          message="Start adding restaurants to your favorites to see them here"
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.restaurant_id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <RestaurantCard
              name={item.name}
              cuisine={item.cuisine}
              imageUrl={item.image_url}
              rating={item.rating}
              deliveryFee={item.delivery_fee}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.restaurant_id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: 4,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  listContent: {
    padding: layout.screenPadding,
    paddingBottom: 100,
  },
});
