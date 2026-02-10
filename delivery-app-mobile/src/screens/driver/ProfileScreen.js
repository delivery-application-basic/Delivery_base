import React from 'react';
import { View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components/common/Button';
import { logout } from '../../store/slices/authSlice';
import { typography } from '../../theme/typography';
import { layout } from '../../theme/spacing';

export default function DriverProfileScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const name = user?.full_name ?? user?.name ?? 'Driver';
  return (
    <View style={{ padding: layout.screenPadding }}>
      <Text style={typography.h2}>Profile</Text>
      <Text style={typography.body}>{name}</Text>
      <Button title="Logout" onPress={() => dispatch(logout())} mode="outlined" style={{ marginTop: 16 }} />
    </View>
  );
}
