/**
 * OnboardingScreen - First-time intro, then go to UserTypeSelect
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/common/Button';
import storage from '../../utils/storage';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function OnboardingScreen({ navigation }) {
  const [page, setPage] = useState(0);
  const pages = [
    { title: 'Order food', body: 'Browse restaurants and order your favorite meals.' },
    { title: 'Track delivery', body: 'Follow your order in real time until it arrives.' },
    { title: 'Get started', body: 'Sign up as customer, restaurant, or driver.' },
  ];

  const handleFinish = async () => {
    await storage.setOnboardingComplete(true);
    navigation.replace('UserTypeSelect');
  };

  const isLast = page === pages.length - 1;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{pages[page].title}</Text>
      <Text style={styles.body}>{pages[page].body}</Text>
      <View style={styles.footer}>
        {!isLast ? (
          <Button title="Next" onPress={() => setPage((p) => p + 1)} />
        ) : (
          <Button title="Get started" onPress={handleFinish} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: { fontSize: 18, color: colors.primary, marginBottom: 12 },
  body: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xl },
  footer: { marginTop: spacing.lg },
});
