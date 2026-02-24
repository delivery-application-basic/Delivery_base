import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Icon } from 'react-native-paper';
import { Input } from '../common/Input';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useLocation } from '../../hooks/useLocation';
import { geocodingService } from '../../api/services/geocodingService';

export const AddressForm = ({ value, onChange, errors }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const { getLocationWithPermission, checkLocationService } = useLocation();

  const labels = [
    { id: 'Home', icon: 'home-outline' },
    { id: 'Work', icon: 'briefcase-outline' },
    { id: 'Other', icon: 'map-marker-outline' }
  ];

  const handleDetect = async () => {
    try {
      setIsDetecting(true);
      if ((await checkLocationService()) !== 'enabled') {
        Alert.alert('Location Disabled', 'Please enable GPS to detect your location.');
        return;
      }
      const coords = await getLocationWithPermission();
      if (coords) {
        const addressData = await geocodingService.reverseGeocode(coords.latitude, coords.longitude);
        if (addressData) {
          onChange?.({
            ...value,
            street_address: addressData.street_address || '',
            sub_city: addressData.sub_city || '',
            city: addressData.city || 'Addis Ababa',
            latitude: coords.latitude,
            longitude: coords.longitude
          });
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Could not detect location');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Address Category</Text>
      <View style={styles.chipRow}>
        {labels.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.chip,
              value?.address_label === item.id && styles.chipSelected
            ]}
            onPress={() => onChange?.({ ...value, address_label: item.id })}
          >
            <Icon
              source={item.icon}
              size={18}
              color={value?.address_label === item.id ? colors.white : colors.textSecondary}
            />
            <Text style={[
              styles.chipText,
              value?.address_label === item.id && styles.chipTextSelected
            ]}>
              {item.id}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.detectBtn}
        onPress={handleDetect}
        disabled={isDetecting}
      >
        {isDetecting ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Icon source="crosshairs-gps" size={20} color={colors.primary} />
        )}
        <Text style={styles.detectText}>Detect My Location</Text>
      </TouchableOpacity>

      <Input
        label="Street Address"
        value={value?.street_address}
        onChangeText={(v) => onChange?.({ ...value, street_address: v })}
        error={errors?.street_address}
        placeholder="e.g. Near CMC Roundabout"
      />
      <Input
        label="Sub-city"
        value={value?.sub_city}
        onChangeText={(v) => onChange?.({ ...value, sub_city: v })}
        error={errors?.sub_city}
        placeholder="e.g. Bole"
      />
      <Input
        label="City"
        value={value?.city}
        onChangeText={(v) => onChange?.({ ...value, city: v })}
        error={errors?.city}
      />
      <Input
        label="Landmark"
        value={value?.landmark}
        onChangeText={(v) => onChange?.({ ...value, landmark: v })}
        error={errors?.landmark}
        placeholder="Optional (e.g. Green building)"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.gray[50],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.white,
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    gap: 10,
    justifyContent: 'center',
  },
  detectText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  }
});

export default AddressForm;
