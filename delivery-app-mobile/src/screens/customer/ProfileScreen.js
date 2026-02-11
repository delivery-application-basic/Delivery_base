import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/common/Avatar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { logout } from '../../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, userType, isLoading } = useSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const name = user?.name ?? user?.full_name ?? user?.restaurant_name ?? 'User';
  const email = user?.email ?? 'user@example.com';

  const menuItems = [
    { id: 'orders', title: 'My Orders', icon: 'clipboard-list-outline', screen: 'OrderHistory' },
    { id: 'favorites', title: 'Favorites', icon: 'heart-outline', screen: 'Favorites' },
    { id: 'address', title: 'Addresses', icon: 'map-marker-outline', screen: 'AddressManagement' },
    { id: 'settings', title: 'Settings', icon: 'cog-outline', screen: 'Settings' },
    { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', screen: null },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await dispatch(logout()).unwrap();
              // Navigation will happen automatically via AppNavigator when isAuthenticated becomes false
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleSwitchAccount = async () => {
    Alert.alert(
      'Switch Account',
      'You will be logged out and can login as a different user type.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Switch',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await dispatch(logout()).unwrap();
              // Navigation will happen automatically via AppNavigator
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Profile</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar name={name} size={80} />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon source="pencil-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => item.screen && navigation.navigate(item.screen)}
            >
              <View style={styles.menuIconContainer}>
                <Icon source={item.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Icon source="chevron-right" size={24} color={colors.gray[300]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.switchAccountButton}
            onPress={handleSwitchAccount}
            disabled={isLoggingOut || isLoading}
          >
            <Icon source="account-switch" size={24} color={colors.primary} />
            <Text style={styles.switchAccountText}>Switch Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutButton, (isLoggingOut || isLoading) && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={isLoggingOut || isLoading}
          >
            <Icon source="logout" size={24} color={colors.error} />
            <Text style={styles.logoutText}>
              {isLoggingOut || isLoading ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  screenHeader: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  screenTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    fontSize: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: layout.screenPadding,
    paddingTop: 0,
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  headerInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  email: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  editButton: {
    padding: 8,
    backgroundColor: colors.gray[50],
    borderRadius: 20,
  },
  menuSection: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionSection: {
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  switchAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.primary + '15', // Light primary color
    gap: 8,
  },
  switchAccountText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.errorLight + '20', // Very light red
    gap: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
  },
  versionText: {
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.textLight,
    fontSize: 12,
  },
});
