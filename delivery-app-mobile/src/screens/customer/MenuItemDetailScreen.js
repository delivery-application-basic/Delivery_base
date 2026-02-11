/**
 * MenuItemDetailScreen - Item details and add to cart. Backend: GET /menu/items/:id, POST /cart/items
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchMenuItemById } from '../../store/slices/menuSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';

import { TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { shadows } from '../../theme/shadows';
import { spacing as spacingTheme } from '../../theme/spacing';

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
  const name = item.item_name ?? item.name;
  const price = item.price;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Icon source="food" size={80} color={colors.gray[200]} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.price}>{formatCurrency(price)}</Text>
        </View>

        {item.description && <Text style={styles.desc}>{item.description}</Text>}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          loading={cartLoading}
          style={styles.btnAdd}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
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
  },
  content: {
    padding: layout.screenPadding,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacingTheme.md,
  },
  name: {
    ...typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: spacingTheme.md,
  },
  price: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    padding: layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  btnAdd: {
    height: 56,
  },
});
