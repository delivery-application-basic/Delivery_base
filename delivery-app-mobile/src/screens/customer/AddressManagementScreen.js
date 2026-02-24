import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { customerService } from '../../api/services/customerService';
import { AddressCard } from '../../components/address/AddressCard';
import { AddressForm } from '../../components/address/AddressForm';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { validateRequired } from '../../utils/validators';
import { shadows } from '../../theme/shadows';
import { useLocation } from '../../hooks/useLocation';
import { geocodingService } from '../../api/services/geocodingService';

export default function AddressManagementScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    address_label: 'Home',
    street_address: '',
    sub_city: '',
    city: 'Addis Ababa',
    landmark: '',
    latitude: null,
    longitude: null,
  });
  const [errors, setErrors] = useState({});

  const { getLocationWithPermission, checkLocationService } = useLocation();

  // Centralized filter to hide technical/clutter GPS labels
  const filterClutter = (list) => {
    return list.filter(a => {
      const label = a.address_label?.toLowerCase();
      return !['detected location', 'current location', 'one-time delivery (gps)'].includes(label);
    });
  };

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setIsLoading(true);
        const response = await customerService.getAddresses();
        const rawList = response.data?.data || response.data || [];
        setAddresses(filterClutter(rawList));
      } catch (error) {
        console.error('Failed to load addresses:', error);
        setAddresses([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadAddresses();
  }, []);

  const handleSave = async () => {
    const errs = {};
    const street = formData.street_address?.trim();
    const city = formData.city?.trim();
    const label = formData.address_label?.trim();

    if (!street) errs.street_address = 'Street address is required';
    if (!city) errs.city = 'City is required';
    if (!label) errs.address_label = 'Label is required (e.g. Home, Work)';

    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      const payload = { ...formData, street_address: street, city: city, address_label: label };
      if (editingAddress) {
        await customerService.updateAddress(editingAddress.address_id, payload);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        await customerService.addAddress(payload);
        Alert.alert('Success', 'Address saved successfully');
      }
      setShowForm(false);
      setEditingAddress(null);
      setFormData({
        address_label: 'Home',
        street_address: '',
        sub_city: '',
        city: 'Addis Ababa',
        landmark: '',
        latitude: null,
        longitude: null,
      });
      // Reload addresses with filter
      const response = await customerService.getAddresses();
      const rawList = response.data?.data || response.data || [];
      setAddresses(filterClutter(rawList));
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save address');
    }
  };

  const handleDelete = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await customerService.deleteAddress(addressId);
              setAddresses(addresses.filter(a => a.address_id !== addressId));
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      address_label: address.address_label || '',
      street_address: address.street_address || '',
      sub_city: address.sub_city || '',
      city: address.city || '',
      landmark: address.landmark || '',
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setShowForm(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <AddressCard
        label={item.address_label || 'Address'}
        streetAddress={item.street_address}
        city={item.city}
        subCity={item.sub_city}
        onPress={() => handleEdit(item)}
      />
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(item.address_id)}
      >
        <Icon source="delete-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Manage Addresses</Text>
      {!showForm && (
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={() => {
            setShowForm(true);
            setEditingAddress(null);
            setFormData({
              address_label: 'Home',
              street_address: '',
              sub_city: '',
              city: 'Addis Ababa',
              landmark: '',
              latitude: null,
              longitude: null,
            });
          }}
        >
          <Icon source="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const detectAndSaveAs = async (label) => {
    try {
      setIsLoading(true);
      if ((await checkLocationService()) !== 'enabled') {
        Alert.alert('Location Disabled', 'Please enable GPS');
        return;
      }
      const coords = await getLocationWithPermission();
      if (!coords) return;

      const addressData = await geocodingService.reverseGeocode(coords.latitude, coords.longitude);
      const payload = {
        address_label: label,
        street_address: addressData?.street_address || 'Current Location',
        sub_city: addressData?.sub_city || '',
        city: addressData?.city || 'Addis Ababa',
        latitude: coords.latitude,
        longitude: coords.longitude
      };

      await customerService.addAddress(payload);
      const refetched = await customerService.getAddresses();
      const rawList = refetched.data?.data || refetched.data || [];
      setAddresses(filterClutter(rawList));
      Alert.alert('Success', `${label} address set from GPS.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to detect location');
    } finally {
      setIsLoading(false);
    }
  };

  const home = addresses.find(a => a.address_label?.toLowerCase() === 'home');
  const work = addresses.find(a => a.address_label?.toLowerCase() === 'work');
  const school = addresses.find(a => a.address_label?.toLowerCase() === 'school');
  const otherAddresses = addresses.filter(a => !['home', 'work', 'school'].includes(a.address_label?.toLowerCase()));

  const Slot = ({ type, data, icon }) => (
    <TouchableOpacity
      style={[
        styles.slot,
        !data && styles.slotEmpty
      ]}
      onPress={() => {
        if (data) {
          handleEdit(data);
        } else {
          detectAndSaveAs(type);
        }
      }}
    >
      <View style={styles.slotIconBox}>
        <Icon
          source={icon}
          size={24}
          color={colors.primary}
        />
      </View>
      <View style={styles.slotInfo}>
        <Text style={styles.slotLabel}>{type}</Text>
        <Text numberOfLines={1} style={styles.slotSubtext}>
          {data ? data.street_address : `Set your ${type.toLowerCase()}`}
        </Text>
      </View>
      {!data && (
        <View style={styles.slotSetBadge}>
          <Text style={styles.slotSetText}>SET</Text>
        </View>
      )}
      {data && (
        <TouchableOpacity
          style={styles.slotDelete}
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(data.address_id);
          }}
        >
          <Icon source="close-circle" size={16} color={colors.error} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (isLoading) return <Loader fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      {showForm ? (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </Text>
          <AddressForm value={formData} onChange={setFormData} errors={errors} />
          <View style={styles.formActions}>
            <Button
              title="Cancel"
              onPress={() => {
                setShowForm(false);
                setEditingAddress(null);
                setErrors({});
              }}
              mode="outlined"
              style={styles.cancelButton}
            />
            <Button
              title={editingAddress ? 'Update' : 'Save'}
              onPress={handleSave}
              style={styles.saveButton}
            />
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.slotsContainer}>
            <Text style={styles.sectionTitle}>Quick Management</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotsScroll}>
              <Slot type="Home" data={home} icon="home-outline" />
              <Slot type="Work" data={work} icon="briefcase-outline" />
              <Slot type="School" data={school} icon="school-outline" />
            </ScrollView>
          </View>

          <FlatList
            data={otherAddresses}
            keyExtractor={(item) => String(item.address_id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListHeaderComponent={<Text style={styles.sectionTitle}>Other Saved Addresses</Text>}
            ListEmptyComponent={
              <EmptyState
                message="No other addresses saved."
                icon="map-marker-plus"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
  title: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  headerActionButton: {
    padding: 8,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
  },
  list: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  slotsContainer: {
    paddingVertical: spacing.sm,
  },
  slotsScroll: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.sm,
    paddingRight: 40,
  },
  slot: {
    width: 220,
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.gray[100],
    position: 'relative',
    marginRight: spacing.sm,
  },
  slotEmpty: {
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
  },
  slotIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  slotInfo: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  slotSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  slotSetBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  slotSetText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
  },
  slotDelete: {
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  deleteAction: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  formContainer: {
    flex: 1,
    padding: layout.screenPadding,
  },
  formTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.lg,
    fontWeight: '700',
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
