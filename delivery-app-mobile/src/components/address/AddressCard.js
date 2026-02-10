/**
 * AddressCard - Single address display for selection
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const AddressCard = ({ label, streetAddress, city, subCity, onPress, selected }) => (
  <Card onPress={onPress}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.address}>{[streetAddress, subCity, city].filter(Boolean).join(', ')}</Text>
  </Card>
);

const styles = StyleSheet.create({
  label: { ...typography.h4, marginBottom: 4 },
  address: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
});

export default AddressCard;
