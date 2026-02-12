/**
 * MenuItemDetailScreen - Item details and add to cart. Backend: GET /menu/items/:id, POST /cart/items
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchMenuItemById } from '../../store/slices/menuSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { Loader } from '../../components/common/Loader';
import { Text } from '../../components/common/Text';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { shadows } from '../../theme/shadows';
import { spacing as spacingTheme } from '../../theme/spacing';
import { moderateScale } from '../../utils/scaling';

export default function MenuItemDetailScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const menuItemId = route.params?.menuItemId;
  const { selectedMenuItem, isLoading } = useSelector((state) => state.menu);
  const { isLoading: cartLoading } = useSelector((state) => state.cart);

  useEffect(() => {
    if (menuItemId) dispatch(fetchMenuItemById(menuItemId));
  }, [dispatch, menuItemId]);

  const handleAddToCart = () => {
    if (!menuItemId) return;
    dispatch(addToCart({ menuItemId: parseInt(menuItemId, 10), quantity: 1 }));
    navigation.navigate('Cart');
  };

  if (isLoading && !selectedMenuItem) return <Loader fullScreen />;
  if (!selectedMenuItem) return null;

  const item = selectedMenuItem;
  
  // Ensure name is always valid
  const itemName = (() => {
    if (item.item_name) return String(item.item_name).trim();
    if (item.name) return String(item.name).trim();
    return 'Menu Item';
  })();
  
  // Ensure price is valid
  const itemPrice = item.price || 0;
  
  // Ensure description is valid
  const itemDescription = item.description ? String(item.description).trim() : null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Icon source="food" size={80} color={colors.gray[300]} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.name} allowFontScaling={false} numberOfLines={2}>
              {itemName}
            </Text>
            <Text style={styles.price} allowFontScaling={false}>
              {formatCurrency(itemPrice)}
            </Text>
          </View>

          {itemDescription && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descLabel} allowFontScaling={false}>
                Description
              </Text>
              <Text style={styles.desc} allowFontScaling={false}>
                {itemDescription}
              </Text>
            </View>
          )}

          {/* Additional Info Section */}
          <View style={styles.infoSection}>
            {item.category && (
              <View style={styles.infoRow}>
                <Icon source="tag" size={18} color={colors.textSecondary} />
                <Text style={styles.infoText} allowFontScaling={false}>
                  Category: {item.category}
                </Text>
              </View>
            )}
            {item.preparation_time && (
              <View style={styles.infoRow}>
                <Icon source="clock-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.infoText} allowFontScaling={false}>
                  Prep Time: {item.preparation_time} min
                </Text>
              </View>
            )}
            {item.is_vegetarian !== undefined && (
              <View style={styles.infoRow}>
                <Icon 
                  source={item.is_vegetarian ? "leaf" : "food"} 
                  size={18} 
                  color={item.is_vegetarian ? colors.success : colors.textSecondary} 
                />
                <Text style={styles.infoText} allowFontScaling={false}>
                  {item.is_vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                </Text>
              </View>
            )}
            {item.is_spicy && (
              <View style={styles.infoRow}>
                <Icon source="fire" size={18} color={colors.error} />
                <Text style={styles.infoText} allowFontScaling={false}>
                  Spicy
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.addToCartButton, cartLoading && styles.buttonDisabled]}
          onPress={handleAddToCart}
          disabled={cartLoading || !item.is_available}
          activeOpacity={0.8}
        >
          {cartLoading ? (
            <Text style={styles.buttonText} allowFontScaling={false}>
              Adding...
            </Text>
          ) : (
            <View style={styles.buttonContent}>
              <Icon source="cart-plus" size={20} color={colors.white} />
              <Text style={styles.buttonText} allowFontScaling={false}>
                Add to Cart
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {!item.is_available && (
          <Text style={styles.unavailableText} allowFontScaling={false}>
            This item is currently unavailable
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for footer button
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 20,
    ...shadows.medium,
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
  },
  content: {
    padding: layout.screenPadding,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingTheme.lg,
    marginTop: spacingTheme.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: spacingTheme.md,
    includeFontPadding: false,
    lineHeight: 30,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    includeFontPadding: false,
    lineHeight: 30,
  },
  descriptionContainer: {
    marginBottom: spacingTheme.lg,
    paddingBottom: spacingTheme.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  descLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacingTheme.sm,
    includeFontPadding: false,
  },
  desc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoSection: {
    marginTop: spacingTheme.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacingTheme.sm,
    gap: moderateScale(8),
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.white,
    ...shadows.large,
  },
  btnAdd: {
    backgroundColor: colors.primary,
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    includeFontPadding: false,
  },
  unavailableText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.error,
    textAlign: 'center',
    marginTop: spacingTheme.sm,
    includeFontPadding: false,
  },
});
