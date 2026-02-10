/**
 * ProfileScreen - User info and logout
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';
import { logout } from '../../store/slices/authSlice';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const { user, userType } = useSelector((state) => state.auth);

  const name = user?.name ?? user?.full_name ?? user?.restaurant_name ?? 'User';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.type}>{userType}</Text>
      <Button title="Logout" onPress={() => dispatch(logout())} mode="outlined" style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: layout.screenPadding, backgroundColor: colors.background },
  title: { ...typography.h2, marginBottom: 8 },
  name: { ...typography.h4, marginBottom: 4 },
  type: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 24 },
  btn: { marginTop: 16 },
});
