import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { Avatar } from '../../components/common/Avatar';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { logout, switchRole } from '../../store/slices/authSlice';
import { USER_TYPES } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { driverService } from '../../api/services/driverService';

const InfoRow = ({ icon, label, value, isLast }) => (
  <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
    <Icon source={icon} size={20} color={colors.textLight} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value || '—'}</Text>
  </View>
);

export default function DriverProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user: authUser, isLoading: authLoading } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileError(null);
        const res = await driverService.getDriverProfile();
        setProfile(res.data?.data ?? res.data?.driver ?? res.data ?? null);
      } catch (err) {
        setProfileError(err.message || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const data = profile ?? authUser ?? {};
  const name = data.full_name ?? data.name ?? 'Driver';
  const profilePictureUrl = data.profile_picture_url ?? null;
  const email = data.email ?? '—';
  const phone = data.phone_number ?? data.phone ?? '—';
  const licenseNumber = data.driver_license_number ?? data.driver_license ?? '—';
  const idCard = data.id_card_number ?? data.id_card ?? '—';
  const vehicleType = data.vehicle_type ?? data.vehicle ?? '—';

  const menuItems = [
    { id: 'settings', title: 'Settings', icon: 'cog-outline', screen: 'Settings', tab: null },
    { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', screen: null, tab: null },
  ];

  const handleChangeProfilePicture = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (result.didCancel || result.errorCode) return;
    const asset = result.assets?.[0];
    const uri = asset?.uri;
    if (!uri) return;
    setIsUploadingPicture(true);
    try {
      const mimeType = asset.type || 'image/jpeg';
      const res = await driverService.uploadProfilePicture(uri, mimeType);
      const url = res.data?.data?.profile_picture_url ?? res.data?.profile_picture_url;
      if (url) setProfile((p) => (p ? { ...p, profile_picture_url: url } : { profile_picture_url: url }));
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to upload profile picture');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleNavigate = (item) => {
    if (!item.screen) return;
    if (item.tab) {
      navigation.getParent()?.navigate(item.tab, { screen: item.screen });
    } else {
      navigation.navigate(item.screen);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await dispatch(logout()).unwrap();
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
    const performSwitch = async (targetType) => {
      const targetLabel = targetType === USER_TYPES.CUSTOMER ? 'Customer' : 'Restaurant Partner';
      try {
        const resultAction = await dispatch(switchRole(targetType));

        if (switchRole.rejected.match(resultAction)) {
          const error = resultAction.payload;
          if (error?.code === 'ROLE_NOT_FOUND') {
            Alert.alert(
              'Profile Not Found',
              `You don't have a ${targetLabel} account yet. Would you like to logout to create one?`,
              [
                { text: 'No', style: 'cancel' },
                {
                  text: 'Yes, Logout',
                  onPress: () => dispatch(logout())
                }
              ]
            );
          } else {
            Alert.alert('Error', error?.message || 'Failed to switch profile');
          }
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    };

    Alert.alert(
      'Switch Profile',
      'Choose the profile you want to switch to:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Customer Profile',
          onPress: () => performSwitch(USER_TYPES.CUSTOMER),
        },
        {
          text: 'Restaurant Profile',
          onPress: () => performSwitch(USER_TYPES.RESTAURANT),
        },
      ]
    );
  };

  if (profileLoading && !profile) {
    return <Loader fullScreen />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Profile</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {profileError && (
          <View style={styles.errorBanner}>
            <Icon source="alert-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.errorText}>{profileError} (showing cached data)</Text>
          </View>
        )}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleChangeProfilePicture}
            disabled={isUploadingPicture}
          >
            <Avatar
              name={name}
              size={80}
              source={profilePictureUrl ? { uri: profilePictureUrl } : null}
            />
            <View style={styles.avatarBadge}>
              {isUploadingPicture ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Icon source="camera" size={18} color={colors.white} />
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subtitle}>{email !== '—' ? email : phone}</Text>
            <Text style={styles.readOnlyBadge}>View only · Cannot edit</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Registration Information</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="account-outline" label="Full Name" value={name} />
            <InfoRow icon="phone-outline" label="Phone" value={phone} />
            <InfoRow icon="email-outline" label="Email" value={email} />
            <InfoRow icon="card-account-details-outline" label="License Number" value={licenseNumber} />
            <InfoRow icon="card-text-outline" label="ID Card Number" value={idCard} />
            <InfoRow icon="bike" label="Vehicle Type" value={vehicleType} isLast />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings & Management</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleNavigate(item)}
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
            disabled={isLoggingOut || authLoading}
          >
            <Icon source="account-switch" size={24} color={colors.primary} />
            <Text style={styles.switchAccountText}>Switch Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutButton, (isLoggingOut || authLoading) && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={isLoggingOut || authLoading}
          >
            <Icon source="logout" size={24} color={colors.error} />
            <Text style={styles.logoutText}>
              {isLoggingOut || authLoading ? 'Logging out...' : 'Logout'}
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
    backgroundColor: colors.gray[50],
  },
  screenHeader: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  screenTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: layout.screenPadding,
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight + '80',
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  readOnlyBadge: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoSection: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    width: 120,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  menuSection: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    marginBottom: 2,
    borderRadius: 12,
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
    fontSize: 14,
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
    backgroundColor: colors.primary + '15',
    gap: 8,
  },
  switchAccountText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.errorLight + '40',
    gap: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
  },
  versionText: {
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.textLight,
    fontSize: 10,
  },
});
