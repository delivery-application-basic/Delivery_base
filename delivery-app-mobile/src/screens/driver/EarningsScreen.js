import React from 'react';
import { View, Text } from 'react-native';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function EarningsScreen() {
  return (
    <View style={{ padding: layout.screenPadding }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Earnings</Text>
      <Text style={{ fontSize: 14, color: colors.text }}>Connect to wallet/earnings API when ready.</Text>
    </View>
  );
}
