import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchRestaurantById } from '../../store/slices/restaurantSlice';
import { fetchMenu } from '../../store/slices/menuSlice';
import { MenuItemCard } from '../../components/menu/MenuItemCard';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { moderateScale, scale, verticalScale } from '../../utils/scaling';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { formatCurrency } from '../../utils/helpers';

export default function RestaurantDetailScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const restaurantId = route.params?.restaurantId;
  const { selectedRestaurant, isLoading: restaurantLoading } = useSelector((state) => state.restaurant);
  const { menuItems, isLoading: menuLoading } = useSelector((state) => state.menu);

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchRestaurantById(restaurantId));
      dispatch(fetchMenu(restaurantId));
    }
  }, [dispatch, restaurantId]);

  if ((restaurantLoading && !selectedRestaurant) || (menuLoading && !menuItems)) return <Loader fullScreen />;
  if (!selectedRestaurant) return null;

  const r = selectedRestaurant;
  const deliveryTime = '25-35 min';

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.infoCard}>
        <Text style={styles.name}>{r.restaurant_name}</Text>
        <Text style={styles.cuisine}>{r.cuisine_type || 'International'}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon source="star" size={16} color={colors.warning} />
            <Text style={styles.statValue}>{Number(r.rating || 4.5).toFixed(1)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon source="clock-outline" size={16} color={colors.primary} />
            <Text style={styles.statValue}>{deliveryTime}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon source="silverware-fork-knife" size={16} color={colors.primary} />
            <Text style={styles.statValue}>{r.delivery_fee > 0 ? formatCurrency(r.delivery_fee) : 'FREE'}</Text>
          </View>
        </View>

        {r.street_address && (
          <View style={styles.addressRow}>
            <Icon source="map-marker" size={16} color={colors.textLight} />
            <Text style={styles.address} numberOfLines={1}>{r.street_address}, {r.city}</Text>
          </View>
        )}
      </View>
      <Text style={styles.menuTitle}>Popular Items</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Floating Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>

      <FlatList
        data={menuItems || []}
        keyExtractor={(item) => String(item.item_id || item.id)}
        renderItem={({ item }) => (
          <MenuItemCard
            name={item.item_name || item.name}
            description={item.description}
            price={item.price}
            imageUrl={item.image_url}
            unavailable={item.is_available === false}
            onPress={() => navigation.navigate('MenuItemDetail', { menuItemId: item.item_id || item.id })}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.imageHeader}>
              {r.logo_url ? (
                <Image source={{ uri: r.logo_url }} style={styles.coverImage} resizeMode="cover" />
              ) : (
                <View style={[styles.coverImage, styles.imagePlaceholder]}>
                  <Icon source="silverware-variant" size={60} color={colors.gray[300]} />
                </View>
              )}
            </View>
            {renderHeader()}
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState message="No menu items available" />}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <Button
          title="View Cart"
          onPress={() => navigation.navigate('Cart')}
          style={styles.cartButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 10,
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: moderateScale(20),
    ...shadows.medium,
  },
  imageHeader: {
    width: '100%',
    height: verticalScale(200),
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    paddingHorizontal: layout.screenPadding,
    marginTop: verticalScale(-30), // Overlap effect
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(20),
    padding: spacing.md,
    ...shadows.large,
    marginBottom: spacing.lg,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginBottom: moderateScale(4),
  },
  cuisine: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(12),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: moderateScale(12),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
  statValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    height: verticalScale(15),
    backgroundColor: colors.border,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  address: {
    ...typography.bodySmall,
    color: colors.textLight,
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: verticalScale(120),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.md,
    ...shadows.large,
  },
  cartButton: {
    width: '100%',
  },
});
