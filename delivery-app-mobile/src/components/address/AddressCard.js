import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export const AddressCard = ({ label, streetAddress, city, subCity, landmark, onPress, selected }) => {
  const getIcon = () => {
    switch (label?.toLowerCase()) {
      case 'home': return 'home-outline';
      case 'work': return 'briefcase-outline';
      default: return 'map-marker-outline';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Icon
          source={getIcon()}
          size={24}
          color={selected ? colors.white : colors.primary}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.label, selected && styles.labelSelected]}>{label || 'Address'}</Text>
          {selected && <Icon source="check-circle" size={18} color={colors.primary} />}
        </View>
        <Text style={styles.address} numberOfLines={1}>{streetAddress}</Text>
        <Text style={styles.subText} numberOfLines={1}>{subCity}, {city}</Text>
        {landmark ? <Text style={styles.landmark}>Near: {landmark}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.gray[100],
    ...shadows.small,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  labelSelected: {
    color: colors.primary,
  },
  address: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  subText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  landmark: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  }
});

export default AddressCard;
