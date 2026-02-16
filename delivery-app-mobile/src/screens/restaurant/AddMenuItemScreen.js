import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { menuService } from '../../api/services/menuService';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function AddMenuItemScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [pickedImage, setPickedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const targetRestaurantId = route.params?.restaurantId ?? user?.restaurant_id ?? user?.id;

  const handlePickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || result.errorCode) return;
    const asset = result.assets?.[0];
    if (asset?.uri) setPickedImage({ uri: asset.uri, type: asset.type || 'image/jpeg' });
  };

  const handleSave = async () => {
    if (!targetRestaurantId || !name || !price) {
      Alert.alert('Error', 'Item name and price are required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await menuService.createMenuItem({
        restaurant_id: targetRestaurantId,
        item_name: name,
        description: description || undefined,
        price: parseFloat(price),
        category: category || undefined,
      });
      const item = res.data?.data ?? res.data;
      const itemId = item?.item_id ?? item?.id;
      if (itemId && pickedImage) {
        await menuService.uploadMenuItemPicture(itemId, pickedImage.uri, pickedImage.type);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Add Menu Item</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>Food Photo</Text>
          <TouchableOpacity style={styles.photoBox} onPress={handlePickImage} activeOpacity={0.8}>
            {pickedImage ? (
              <>
                <Image source={{ uri: pickedImage.uri }} style={styles.photoPreview} resizeMode="cover" />
                <View style={styles.photoOverlay}>
                  <Icon source="camera" size={28} color={colors.white} />
                  <Text style={styles.photoOverlayText}>Change photo</Text>
                </View>
              </>
            ) : (
              <>
                <Icon source="image-plus" size={40} color={colors.primary} />
                <Text style={styles.photoPlaceholderText}>Tap to add a photo</Text>
                <Text style={styles.photoHint}>Items with photos get more orders</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>Basic Information</Text>
          <Input
            label="Item Name"
            placeholder="e.g. Traditional Spicy Burger"
            value={name}
            onChangeText={setName}
            containerStyle={styles.inputContainer}
          />
          <Input
            label="Description"
            placeholder="Tell customers what's in this dish..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            containerStyle={styles.inputContainer}
          />

          <Text style={styles.sectionLabel}>Pricing & Categorization</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Price (ETB)"
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                containerStyle={styles.inputContainer}
              />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Input
                label="Category"
                placeholder="e.g. Burgers"
                value={category}
                onChangeText={setCategory}
                containerStyle={styles.inputContainer}
              />
            </View>
          </View>
        </View>


        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 80 }]}>
        <Button
          title="Create Item"
          onPress={handleSave}
          loading={isLoading}
          style={styles.mainButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  scrollContent: {
    padding: layout.screenPadding,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.lg,
    ...shadows.small,
  },
  photoBox: {
    height: 160,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPreview: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlayText: {
    color: colors.white,
    fontSize: 12,
    marginTop: 4,
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginTop: 8,
  },
  photoHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    padding: layout.screenPadding,
    backgroundColor: colors.white,
    ...shadows.medium,
  },
  mainButton: {
    // Remove fixed height to let button size naturally
  },
});
