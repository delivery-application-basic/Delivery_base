/**
 * SelectAddressScreen - Select delivery address from saved addresses
 * Backend: GET /addresses (customer addresses)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { customerService } from '../../api/services/customerService';
import { geocodingService } from '../../api/services/geocodingService';
import { useLocation } from '../../hooks/useLocation';
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
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  // Centralized filter to hide technical/clutter GPS labels
  const filterClutter = (list) => {
    return list.filter(a => {
      const label = a.address_label?.toLowerCase();
      return !['detected location', 'current location', 'one-time delivery (gps)'].includes(label);
    });
  };
  const { getLocationWithPermission, checkLocationService } = useLocation();

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setIsLoading(true);
        const response = await customerService.getAddresses();
        const rawAddresses = response.data?.data || response.data || [];

        const filteredAddresses = filterClutter(rawAddresses);

        // Sort: Home first, then Work, then Others
        const sorted = [...filteredAddresses].sort((a, b) => {
          const labelA = a.address_label?.toLowerCase();
          const labelB = b.address_label?.toLowerCase();
          if (labelA === 'home') return -1;
          if (labelB === 'home') return 1;
          if (labelA === 'work') return -1;
          if (labelB === 'work') return 1;
          if (labelA === 'school') return -1;
          if (labelB === 'school') return 1;
          return 0;
        });

        setAddresses(sorted);

        // Set default selection logic
        if (!selectedAddressId && sorted.length > 0) {
          const homeAddr = sorted.find(a => a.address_label?.toLowerCase() === 'home');
          const workAddr = sorted.find(a => a.address_label?.toLowerCase() === 'work');
          const schoolAddr = sorted.find(a => a.address_label?.toLowerCase() === 'school');

          const defaultSelect = homeAddr || workAddr || schoolAddr || sorted[0];
          setSelectedAddressId(defaultSelect.address_id);
        }
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

      const res = await customerService.addAddress(payload);
      const newAddr = res.data?.data || res.data;
      if (newAddr?.address_id) {
        setSelectedAddressId(newAddr.address_id);
        const refetched = await customerService.getAddresses();
        const rawList = refetched.data?.data || refetched.data || [];
        setAddresses(filterClutter(rawList));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to detect location');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <AddressCard
      label={item.address_label || 'Address'}
      streetAddress={item.street_address}
      city={item.city}
      subCity={item.sub_city}
      landmark={item.landmark}
      onPress={() => setSelectedAddressId(item.address_id)}
      selected={selectedAddressId === item.address_id}
    />
  );

  const home = addresses.find(a => a.address_label?.toLowerCase() === 'home');
  const work = addresses.find(a => a.address_label?.toLowerCase() === 'work');
  const school = addresses.find(a => a.address_label?.toLowerCase() === 'school');
  const otherAddresses = addresses.filter(a => !['home', 'work', 'school'].includes(a.address_label?.toLowerCase()));

  const Slot = ({ type, data, icon }) => (
    <TouchableOpacity
      style={[
        styles.slot,
        selectedAddressId === data?.address_id && data && styles.slotSelected,
        !data && styles.slotEmpty
      ]}
      onPress={() => {
        if (data) {
          setSelectedAddressId(data.address_id);
        } else {
          detectAndSaveAs(type);
        }
      }}
    >
      <View style={styles.slotIconBox}>
        <Icon
          source={icon}
          size={24}
          color={selectedAddressId === data?.address_id && data ? colors.white : colors.primary}
        />
      </View>
      <View style={styles.slotInfo}>
        <Text style={[styles.slotLabel, selectedAddressId === data?.address_id && data && styles.slotLabelSelected]}>
          {type}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.slotSubtext, selectedAddressId === data?.address_id && data && styles.slotLabelSelected]}
        >
          {data ? data.street_address : `Tap to set ${type.toLowerCase()}`}
        </Text>
      </View>
      {!data && (
        <View style={styles.slotSetBadge}>
          <Text style={styles.slotSetText}>SET</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) return <Loader fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon source="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Address</Text>
      </View>

      <View style={styles.slotsContainer}>
        <Text style={styles.sectionTitle}>Saved Places</Text>
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
        ListHeaderComponent={<Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Other Addresses</Text>}
        ListEmptyComponent={
          <EmptyState
            message="No other addresses saved."
            icon="map-marker-off"
          />
        }
        showsVerticalScrollIndicator={false}
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
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
  },
  list: {
    paddingX: layout.screenPadding,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.sm,
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
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  slotLabelSelected: {
    color: colors.white,
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
  footer: {
    padding: layout.screenPadding,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  addButton: {
    marginBottom: spacing.sm,
  },
  selectButton: {
    marginTop: spacing.xs,
  },
});
