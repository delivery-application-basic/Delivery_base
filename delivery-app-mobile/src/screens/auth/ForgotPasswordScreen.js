/**
 * ForgotPasswordScreen - Backend: POST /auth/forgot-password (placeholder)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authService } from '../../api/services/authService';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { validatePhone } from '../../utils/validators';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!phone && !email) {
      setError('Enter phone or email');
      return;
    }
    if (phone && !validatePhone(phone).valid) {
      setError('Invalid phone number');
      return;
    }
    setError('');
    try {
      await authService.forgotPassword(phone || undefined, email || undefined);
      setSent(true);
    } catch (e) {
      setError(e.message || 'Request failed');
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check your phone/email</Text>
        <Text style={styles.body}>Password reset instructions have been sent.</Text>
        <Button title="Back to login" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot password</Text>
      <Input label="Phone number" value={phone} onChangeText={setPhone} placeholder="+251911234567" keyboardType="phone-pad" />
      <Input label="Or email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      {error ? <Text style={styles.formError}>{error}</Text> : null}
      <Button title="Send reset link" onPress={handleSubmit} style={styles.btn} />
      <Button title="Back to login" onPress={() => navigation.goBack()} mode="outlined" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, paddingTop: 48, backgroundColor: colors.background },
  title: { fontSize: 18, marginBottom: 12 },
  body: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  formError: { color: colors.error, marginBottom: spacing.sm },
  btn: { marginBottom: spacing.sm },
});
