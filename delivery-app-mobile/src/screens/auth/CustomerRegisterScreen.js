/**
 * CustomerRegisterScreen - Backend: POST /auth/register/customer
 * Body: full_name, email (optional), phone_number, password
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { USER_TYPES } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { validateRequired, validatePhone, validatePassword, validateEmail } from '../../utils/validators';

export default function CustomerRegisterScreen() {
  const dispatch = useDispatch();
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const { isLoading, error } = useSelector((state) => state.auth);

  const handleRegister = async () => {
    const errs = {};
    if (!validateRequired(full_name, 'Full name').valid) errs.full_name = 'Full name is required';
    const phoneCheck = validatePhone(phone_number);
    if (!phoneCheck.valid) errs.phone_number = phoneCheck.message;
    if (email && !validateEmail(email).valid) errs.email = 'Invalid email';
    const passCheck = validatePassword(password);
    if (!passCheck.valid) errs.password = passCheck.message;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    dispatch(clearError());
    try {
      await dispatch(register({
        userType: USER_TYPES.CUSTOMER,
        registrationData: { full_name, email: email || undefined, phone_number, password },
      })).unwrap();
    } catch (e) {
      setErrors({ form: e || 'Registration failed' });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Customer sign up</Text>
      <Input label="Full name" value={full_name} onChangeText={setFullName} error={errors.full_name} />
      <Input label="Phone number" value={phone_number} onChangeText={setPhone} error={errors.phone_number} placeholder="+251911234567" keyboardType="phone-pad" />
      <Input label="Email (optional)" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" />
      <Input label="Password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry />
      {errors.form && <Text style={styles.formError}>{errors.form}</Text>}
      {error && <Text style={styles.formError}>{error}</Text>}
      <Button title="Sign up" onPress={handleRegister} loading={isLoading} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 32, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  formError: { color: colors.error, fontSize: 12, marginBottom: spacing.sm },
  btn: { marginTop: spacing.sm },
});
