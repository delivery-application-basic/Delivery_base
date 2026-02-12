import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const SettingItem = ({ icon, title, subtitle, value, onValueChange, isLast }) => (
    <View style={[styles.settingItem, !isLast && styles.divider]}>
      <View style={styles.itemMain}>
        <View style={styles.iconContainer}>
          <Icon source={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.gray[200], true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : colors.gray[400]}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>App Settings</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingItem
              icon="bell-outline"
              title="Push Notifications"
              subtitle="Receive alerts for new orders"
              value={pushEnabled}
              onValueChange={setPushEnabled}
            />
            <SettingItem
              icon="volume-high"
              title="Alert Sounds"
              subtitle="Play sound for incoming orders"
              value={soundEnabled}
              onValueChange={setSoundEnabled}
            />
            <SettingItem
              icon="bullseye-arrow"
              title="Critical Order Alerts"
              subtitle="Persistent sound for urgent orders"
              value={orderAlerts}
              onValueChange={setOrderAlerts}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            <SettingItem
              icon="theme-light-dark"
              title="Dark Mode"
              subtitle="Reduce eye strain in dark environments"
              value={darkMode}
              onValueChange={setDarkMode}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Privacy</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.itemMain}>
                <View style={[styles.iconContainer, { backgroundColor: colors.gray[100] }]}>
                  <Icon source="lock-outline" size={22} color={colors.gray[600]} />
                </View>
                <Text style={styles.settingTitle}>Change Password</Text>
              </View>
              <Icon source="chevron-right" size={20} color={colors.gray[300]} />
            </TouchableOpacity>
            <View style={styles.dividerInner} />
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.itemMain}>
                <View style={[styles.iconContainer, { backgroundColor: colors.error + '15' }]}>
                  <Icon source="delete-forever-outline" size={22} color={colors.error} />
                </View>
                <Text style={[styles.settingTitle, { color: colors.error }]}>Deactivate Account</Text>
              </View>
              <Icon source="chevron-right" size={20} color={colors.gray[300]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
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
  headerTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  scrollContent: {
    padding: layout.screenPadding,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xs,
    ...shadows.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  itemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  dividerInner: {
    height: 1,
    backgroundColor: colors.gray[50],
    marginHorizontal: spacing.md,
  },
});
