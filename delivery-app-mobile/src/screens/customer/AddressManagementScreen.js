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

export default function AddressManagementScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    address_label: '',
    street_address: '',
    sub_city: '',
    city: '',
    landmark: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setIsLoading(true);
        const response = await customerService.getAddresses();
        setAddresses(response.data || []);
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
    if (!validateRequired(formData.street_address)) errs.street_address = 'Street address is required';
    if (!validateRequired(formData.city)) errs.city = 'City is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      if (editingAddress) {
        await customerService.updateAddress(editingAddress.address_id, formData);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        await customerService.addAddress(formData);
        Alert.alert('Success', 'Address saved successfully');
      }
      setShowForm(false);
      setEditingAddress(null);
      setFormData({
        address_label: '',
        street_address: '',
        sub_city: '',
        city: '',
        landmark: '',
      });
      // Reload addresses
      const response = await customerService.getAddresses();
      setAddresses(response.data || []);
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
              address_label: '',
              street_address: '',
              sub_city: '',
              city: '',
              landmark: '',
            });
          }}
        >
          <Icon source="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
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
        <FlatList
          data={addresses}
          keyExtractor={(item) => String(item.address_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              message="No addresses saved. Add your first address to get started."
              icon="map-marker-plus"
            />
          }
          showsVerticalScrollIndicator={false}
        />
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
    padding: layout.screenPadding,
    paddingBottom: 100,
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
