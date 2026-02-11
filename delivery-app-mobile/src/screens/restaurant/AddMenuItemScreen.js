import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { menuService } from '../../api/services/menuService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function AddMenuItemScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const restaurantId = user?.restaurant_id ?? user?.id;
    if (!restaurantId || !name || !price) {
      Alert.alert('Error', 'Item name and price are required');
      return;
    }

    setIsLoading(true);
    try {
      await menuService.createMenuItem({
        restaurant_id: restaurantId,
        item_name: name,
        description: description || undefined,
        price: parseFloat(price),
        category: category || undefined,
      });
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

        <View style={styles.infoBox}>
          <Icon source="image-plus" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Items with photos get up to 30% more orders. You can add a photo after creating the item.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
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
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    fontSize: 22,
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
  sectionLabel: {
    ...typography.bodySmall,
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
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
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
