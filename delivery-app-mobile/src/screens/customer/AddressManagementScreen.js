/**
 * AddressManagementScreen - View and manage saved addresses
 * Backend: GET /addresses, POST /addresses, PUT /addresses/:id, DELETE /addresses/:id
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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

export default function AddressManagementScreen() {
  const navigation = useNavigation();
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
    <View>
      <AddressCard
        label={item.address_label || 'Address'}
        streetAddress={item.street_address}
        city={item.city}
        subCity={item.sub_city}
        onPress={() => handleEdit(item)}
      />
      <Button
        title="Delete"
        onPress={() => handleDelete(item.address_id)}
        mode="text"
        textColor={colors.error}
        style={styles.deleteButton}
      />
    </View>
  );

  if (isLoading) return <Loader fullScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Addresses</Text>
        {!showForm && (
          <Button
            title="Add New"
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
            mode="outlined"
            style={styles.addButton}
          />
        )}
      </View>

      {showForm ? (
        <View style={styles.formContainer}>
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
        </View>
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
          showsVerticalScrollIndicator={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  addButton: {
    marginLeft: spacing.md,
  },
  list: {
    padding: layout.screenPadding,
    paddingTop: 8,
  },
  formContainer: {
    flex: 1,
    padding: layout.screenPadding,
  },
  formTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  deleteButton: {
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
});
