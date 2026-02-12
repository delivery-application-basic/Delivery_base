/**
 * SettingsScreen - App settings and preferences
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  const settingsItems = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      icon: 'bell-outline',
      type: 'toggle',
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      id: 'location',
      title: 'Location Services',
      icon: 'map-marker-outline',
      type: 'toggle',
      value: locationEnabled,
      onToggle: setLocationEnabled,
    },
    {
      id: 'language',
      title: 'Language',
      icon: 'translate',
      type: 'navigate',
      value: 'English',
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'shield-outline',
      type: 'navigate',
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: 'file-document-outline',
      type: 'navigate',
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-outline',
      type: 'navigate',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon source="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingItem}
              onPress={() => {
                if (item.type === 'navigate') {
                  // Handle navigation if needed
                }
              }}
              disabled={item.type === 'toggle'}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Icon source={item.icon} size={24} color={colors.primary} />
                </View>
                <Text style={styles.settingText}>{item.title}</Text>
              </View>
              {item.type === 'toggle' ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: colors.gray[300], true: colors.primary }}
                  thumbColor={colors.white}
                />
              ) : (
                <View style={styles.settingRight}>
                  {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                  <Icon source="chevron-right" size={24} color={colors.gray[300]} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingValue: {
    fontSize: 11,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
});
