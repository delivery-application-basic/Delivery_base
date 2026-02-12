import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50], paddingTop: insets.top, padding: layout.screenPadding }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Earnings</Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8 }}>
        Connect to wallet/earnings API when ready.
      </Text>
    </View>
  );
}
