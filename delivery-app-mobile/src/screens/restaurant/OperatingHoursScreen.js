import React from 'react';
import { View, Text } from 'react-native';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function OperatingHoursScreen() {
  return (
    <View style={{ padding: layout.screenPadding }}>
      <Text style={typography.h2}>Operating hours</Text>
      <Text style={typography.body}>Configure in backend or add form here.</Text>
    </View>
  );
}
