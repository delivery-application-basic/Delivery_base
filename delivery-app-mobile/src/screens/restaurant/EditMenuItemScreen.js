import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { fetchMenuItemById } from '../../store/slices/menuSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { menuService } from '../../api/services/menuService';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function EditMenuItemScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const menuItemId = route.params?.menuItemId;

  const { selectedMenuItem, isLoading } = useSelector((state) => state.menu);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (menuItemId) dispatch(fetchMenuItemById(menuItemId));
  }, [dispatch, menuItemId]);

  useEffect(() => {
    if (selectedMenuItem) {
      setName(selectedMenuItem.item_name ?? selectedMenuItem.name ?? '');
      setDescription(selectedMenuItem.description ?? '');
      setPrice(String(selectedMenuItem.price ?? ''));
      setCategory(selectedMenuItem.category ?? '');
      setIsAvailable(selectedMenuItem.is_available ?? true);
      setImageUrl(selectedMenuItem.image_url ?? null);
    }
  }, [selectedMenuItem]);

  const handleChangePhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || result.errorCode) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    setIsUploadingPhoto(true);
    try {
      const res = await menuService.uploadMenuItemPicture(menuItemId, asset.uri, asset.type || 'image/jpeg');
      const url = res.data?.data?.image_url ?? res.data?.image_url;
      if (url) setImageUrl(url);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Item name and price are required');
      return;
    }

    setIsSaving(true);
    try {
      await menuService.updateMenuItem(menuItemId, {
        item_name: name,
        description: description || undefined,
        price: parseFloat(price),
        category: category || undefined,
        is_available: isAvailable,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update menu item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to permanently delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await menuService.deleteMenuItem(menuItemId);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Edit Menu Item</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Icon source="delete-outline" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !selectedMenuItem) return <Loader fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>Food Photo</Text>
          <TouchableOpacity
            style={styles.photoBox}
            onPress={handleChangePhoto}
            disabled={isUploadingPhoto}
            activeOpacity={0.8}
          >
            {imageUrl ? (
              <>
                <Image source={{ uri: imageUrl }} style={styles.photoPreview} resizeMode="cover" />
                <View style={styles.photoOverlay}>
                  {isUploadingPhoto ? (
                    <Text style={styles.photoOverlayText}>Uploading...</Text>
                  ) : (
                    <>
                      <Icon source="camera" size={28} color={colors.white} />
                      <Text style={styles.photoOverlayText}>Change photo</Text>
                    </>
                  )}
                </View>
              </>
            ) : (
              <>
                <Icon source="image-plus" size={40} color={colors.primary} />
                <Text style={styles.photoPlaceholderText}>{isUploadingPhoto ? 'Uploading...' : 'Tap to add a photo'}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.availabilityRow}>
            <View>
              <Text style={styles.availabilityTitle}>Item Availability</Text>
              <Text style={styles.availabilitySubtitle}>Show or hide this item from customers</Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: colors.gray[200], true: colors.primary + '80' }}
              thumbColor={isAvailable ? colors.primary : colors.gray[400]}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Basic Information</Text>
          <Input
            label="Item Name"
            value={name}
            onChangeText={setName}
            containerStyle={styles.inputContainer}
          />
          <Input
            label="Description"
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
                value={category}
                onChangeText={setCategory}
                containerStyle={styles.inputContainer}
              />
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Icon source="lightbulb-on-outline" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Regularly updating your menu categories helps customers find what they're looking for faster.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isSaving}
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
    fontSize: 18,
    flex: 1,
  },
  deleteButton: {
    padding: spacing.xs,
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
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  availabilitySubtitle: {
    fontSize: 11,
    color: colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginBottom: spacing.lg,
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
  scrollView: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: 16,
    gap: 12,
    marginTop: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  footer: {
    padding: layout.screenPadding,
    backgroundColor: colors.white,
    ...shadows.medium,
  },
  mainButton: {
    height: 56,
  },
});
