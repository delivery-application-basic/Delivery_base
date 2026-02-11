import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchMenu } from '../../store/slices/menuSlice';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { layout, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { formatCurrency } from '../../utils/helpers';

export default function MenuManagementScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);
  const { menuItems, isLoading, restaurantId } = useSelector((state) => state.menu);
  const rid = user?.restaurant_id ?? user?.id ?? restaurantId;

  useFocusEffect(
    useCallback(() => {
      if (rid) {
        dispatch(fetchMenu(rid));
      }
    }, [dispatch, rid])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => navigation.navigate('EditMenuItem', {
        menuItemId: item.item_id ?? item.id ?? item.menu_item_id
      })}
      activeOpacity={0.8}
    >
      <View style={styles.itemImageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon source="food-outline" size={32} color={colors.gray[300]} />
          </View>
        )}
        {!item.is_available && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        )}
      </View>

      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={1}>
            {(item.item_name ?? item.name) || 'Unnamed Item'}
          </Text>
          <Text style={styles.itemPrice}>{formatCurrency(item.price || 0)}</Text>
        </View>

        <Text style={styles.itemCategory} numberOfLines={1}>
          {item.category || 'General'}
        </Text>

        <View style={styles.cardFooter}>
          <View style={[styles.statusTag, { backgroundColor: item.is_available ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.statusTagText, { color: item.is_available ? '#2E7D32' : '#C62828' }]}>
              {item.is_available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
          <Icon source="chevron-right" size={20} color={colors.gray[300]} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Menu Builder</Text>
          <Text style={styles.headerSubtitle}>{menuItems?.length || 0} Products Found</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMenuItem')}
        >
          <Icon source="plus" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      {isLoading && !menuItems?.length ? (
        <Loader fullScreen />
      ) : (
        <FlatList
          data={menuItems || []}
          keyExtractor={(item) => String(item.item_id ?? item.id ?? Math.random())}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              icon="food-off-outline"
              title="Your menu is empty"
              message="Start adding items to show them to your customers."
            />
          }
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={() => rid && dispatch(fetchMenu(rid))}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...shadows.small,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  listContent: {
    padding: layout.screenPadding,
    paddingBottom: 100,
    paddingTop: 10,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadows.small,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#F5F5F5',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  itemCategory: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
    marginTop: -4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
