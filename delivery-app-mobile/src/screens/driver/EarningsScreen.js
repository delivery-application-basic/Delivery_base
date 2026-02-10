import React from 'react';
import { View, Text } from 'react-native';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function EarningsScreen() {
  return (
    <View style={{ padding: layout.screenPadding }}>
      <Text style={typography.h2}>Earnings</Text>
      <Text style={typography.body}>Connect to wallet/earnings API when ready.</Text>
    </View>
  );
}
