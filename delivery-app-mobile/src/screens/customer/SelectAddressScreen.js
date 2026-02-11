/**
 * SelectAddressScreen - Select delivery address from saved addresses
 * Backend: GET /addresses (customer addresses)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { customerService } from '../../api/services/customerService';
import { AddressCard } from '../../components/address/AddressCard';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';

export default function SelectAddressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

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

  const handleSelect = () => {
    if (selectedAddressId && route.params?.onSelect) {
      route.params.onSelect(selectedAddressId);
      navigation.goBack();
    } else if (selectedAddressId) {
      navigation.navigate('Checkout', { addressId: selectedAddressId });
    }
  };

  const renderItem = ({ item }) => (
    <AddressCard
      label={item.address_label || 'Address'}
      streetAddress={item.street_address}
      city={item.city}
      subCity={item.sub_city}
      onPress={() => setSelectedAddressId(item.address_id)}
      selected={selectedAddressId === item.address_id}
    />
  );

  if (isLoading) return <Loader fullScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Delivery Address</Text>
      </View>
      <FlatList
        data={addresses}
        keyExtractor={(item) => String(item.address_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState 
            message="No addresses saved. Add an address to continue." 
            icon="map-marker-off"
          />
        }
        showsVerticalScrollIndicator={true}
      />
      <View style={styles.footer}>
        <Button
          title="Add New Address"
          onPress={() => navigation.navigate('AddressManagement')}
          mode="outlined"
          style={styles.addButton}
        />
        <Button
          title="Use Selected Address"
          onPress={handleSelect}
          disabled={!selectedAddressId}
          style={styles.selectButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
  },
  list: {
    padding: layout.screenPadding,
    paddingTop: 8,
  },
  footer: {
    padding: layout.screenPadding,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  addButton: {
    marginBottom: spacing.sm,
  },
  selectButton: {
    marginTop: spacing.xs,
  },
});
