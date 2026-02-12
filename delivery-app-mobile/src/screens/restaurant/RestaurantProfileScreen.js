import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Avatar } from 'react-native-paper';
import { logout } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function RestaurantProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state) => state.auth);

  const restaurantName = user?.restaurant_name || user?.name || 'Restaurant';
  const ownerName = user?.full_name || 'Owner';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  const ProfileItem = ({ icon, title, subtitle, onPress, color = colors.primary }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={[styles.itemIconContainer, { backgroundColor: color + '15' }]}>
        <Icon source={icon} size={22} color={color} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      <Icon source="chevron-right" size={20} color={colors.gray[300]} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.profile_picture ? (
              <Avatar.Image size={100} source={{ uri: user.profile_picture }} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{restaurantName.charAt(0)}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.editBadge}>
              <Icon source="camera" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>{restaurantName}</Text>
          <Text style={styles.ownerText}>{ownerName}</Text>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Currently Open</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Management</Text>
          <View style={styles.card}>
            <ProfileItem
              icon="clock-outline"
              title="Operating Hours"
              subtitle="Manage opening & closing times"
              onPress={() => navigation.navigate('OperatingHours')}
            />
            <View style={styles.divider} />
            <ProfileItem
              icon="store-edit-outline"
              title="Restaurant Details"
              subtitle="Address, phone, description"
              onPress={() => { }}
            />
            <View style={styles.divider} />
            <ProfileItem
              icon="bank-outline"
              title="Payout Settings"
              subtitle="Manage bank accounts & revenue"
              onPress={() => { }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings & Support</Text>
          <View style={styles.card}>
            <ProfileItem
              icon="cog-outline"
              title="App Settings"
              subtitle="Notifications, language, appearance"
              onPress={() => navigation.navigate('Settings')}
              color={colors.gray[600]}
            />
            <View style={styles.divider} />
            <ProfileItem
              icon="help-circle-outline"
              title="Help Center"
              subtitle="FAQs and customer support"
              onPress={() => { }}
              color={colors.info}
            />
            <View style={styles.divider} />
            <ProfileItem
              icon="logout"
              title="Logout"
              onPress={handleLogout}
              color={colors.error}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Partner app v1.0.0</Text>
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
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...shadows.medium,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  nameText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '800',
  },
  ownerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  section: {
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xs,
    ...shadows.small,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  itemIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  itemSubtitle: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginHorizontal: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  versionText: {
    fontSize: 11,
    color: colors.textLight,
  },
});
