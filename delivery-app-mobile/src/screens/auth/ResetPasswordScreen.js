/**
 * ResetPasswordScreen - Backend: POST /auth/reset-password (placeholder)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authService } from '../../api/services/authService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { validatePassword } from '../../utils/validators';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const token = route.params?.token || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) {
      setError(passCheck.message);
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    try {
      await authService.resetPassword(token, newPassword);
      setDone(true);
    } catch (e) {
      setError(e.message || 'Reset failed');
    }
  };

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Password reset</Text>
        <Text style={styles.body}>You can now sign in with your new password.</Text>
        <Button title="Go to login" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set new password</Text>
      <Input label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry error={error} />
      <Input label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />
      <Button title="Reset password" onPress={handleSubmit} style={styles.btn} />
      <Button title="Back to login" onPress={() => navigation.goBack()} mode="outlined" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, paddingTop: 48, backgroundColor: colors.background },
  title: { fontSize: 18, marginBottom: 12 },
  body: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  btn: { marginBottom: spacing.sm },
});
