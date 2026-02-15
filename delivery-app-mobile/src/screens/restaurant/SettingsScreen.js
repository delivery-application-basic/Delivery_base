import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Icon } from 'react-native-paper';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authService } from '../../api/services/authService';
import { restaurantService } from '../../api/services/restaurantService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);
  const restaurantId = user?.restaurant_id ?? user?.id;

  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [isActive, setIsActive] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      if (!restaurantId) return;
      setProfileLoading(true);
      try {
        const res = await restaurantService.getMyProfile();
        const data = res.data?.data ?? res.data;
        if (!cancelled && data) setIsActive(data.is_active !== false);
      } catch (_) {
        if (!cancelled) setIsActive(true);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, [restaurantId]);

  const handleChangePasswordPress = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordModalVisible(true);
  };

  const handleChangePasswordSubmit = async () => {
    setPasswordError('');
    if (!currentPassword.trim()) {
      setPasswordError('Enter your current password');
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError('Enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPasswordModalVisible(false);
      Alert.alert('Success', 'Password updated successfully');
    } catch (e) {
      setPasswordError(e.response?.data?.message || e.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeactivateOrReactivate = () => {
    const action = isActive ? 'Deactivate' : 'Reactivate';
    const message = isActive
      ? 'Your restaurant will be hidden from customers and they will not see your menu until you reactivate. Continue?'
      : 'Your restaurant will be visible to customers again. Continue?';
    Alert.alert(
      `${action} Account`,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: isActive ? 'destructive' : 'default',
          onPress: async () => {
            setTogglingStatus(true);
            try {
              await restaurantService.updateStatus(restaurantId, !isActive);
              setIsActive(!isActive);
              Alert.alert('Success', isActive ? 'Account deactivated' : 'Account reactivated');
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || e.message || `Failed to ${action.toLowerCase()} account`);
            } finally {
              setTogglingStatus(false);
            }
          },
        },
      ]
    );
  };

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
            <TouchableOpacity style={styles.menuItem} onPress={handleChangePasswordPress}>
              <View style={styles.itemMain}>
                <View style={[styles.iconContainer, { backgroundColor: colors.gray[100] }]}>
                  <Icon source="lock-outline" size={22} color={colors.gray[600]} />
                </View>
                <Text style={styles.settingTitle}>Change Password</Text>
              </View>
              <Icon source="chevron-right" size={20} color={colors.gray[300]} />
            </TouchableOpacity>
            <View style={styles.dividerInner} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeactivateOrReactivate}
              disabled={profileLoading || togglingStatus}
            >
              <View style={styles.itemMain}>
                <View style={[styles.iconContainer, { backgroundColor: isActive ? colors.error + '15' : colors.primary + '15' }]}>
                  <Icon
                    source={isActive ? 'delete-forever-outline' : 'check-circle-outline'}
                    size={22}
                    color={isActive ? colors.error : colors.primary}
                  />
                </View>
                <Text style={[styles.settingTitle, { color: isActive ? colors.error : colors.primary }]}>
                  {togglingStatus ? 'Updating...' : isActive ? 'Deactivate Account' : 'Reactivate Account'}
                </Text>
              </View>
              <Icon source="chevron-right" size={20} color={colors.gray[300]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <Input
              label="Current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Enter current password"
            />
            <Input
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="At least 6 characters"
            />
            <Input
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm new password"
              error={!!passwordError}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                mode="outlined"
                onPress={() => setPasswordModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Update"
                onPress={handleChangePasswordSubmit}
                loading={changingPassword}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: -8,
    marginBottom: 8,
  },
});
