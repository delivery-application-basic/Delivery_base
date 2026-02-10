/**
 * RestaurantRegisterScreen - Backend: POST /auth/register/restaurant
 * Body: restaurant_name, email (optional), phone_number, password, street_address, city
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

export default function RestaurantRegisterScreen() {
  const dispatch = useDispatch();
  const [restaurant_name, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [street_address, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState({});

  const { isLoading, error } = useSelector((state) => state.auth);

  const handleRegister = async () => {
    const errs = {};
    if (!validateRequired(restaurant_name, 'Restaurant name').valid) errs.restaurant_name = 'Restaurant name is required';
    const phoneCheck = validatePhone(phone_number);
    if (!phoneCheck.valid) errs.phone_number = phoneCheck.message;
    if (email && !validateEmail(email).valid) errs.email = 'Invalid email';
    if (!validateRequired(street_address, 'Street address').valid) errs.street_address = 'Street address is required';
    if (!validateRequired(city, 'City').valid) errs.city = 'City is required';
    const passCheck = validatePassword(password);
    if (!passCheck.valid) errs.password = passCheck.message;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    dispatch(clearError());
    try {
      await dispatch(register({
        userType: USER_TYPES.RESTAURANT,
        registrationData: { restaurant_name, email: email || undefined, phone_number, password, street_address, city },
      })).unwrap();
    } catch (e) {
      setErrors({ form: e || 'Registration failed' });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Restaurant sign up</Text>
      <Input label="Restaurant name" value={restaurant_name} onChangeText={setRestaurantName} error={errors.restaurant_name} />
      <Input label="Phone number" value={phone_number} onChangeText={setPhone} error={errors.phone_number} placeholder="+251911234567" keyboardType="phone-pad" />
      <Input label="Email (optional)" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" />
      <Input label="Street address" value={street_address} onChangeText={setStreetAddress} error={errors.street_address} />
      <Input label="City" value={city} onChangeText={setCity} error={errors.city} />
      <Input label="Password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry />
      {errors.form && <Text style={styles.formError}>{errors.form}</Text>}
      {error && <Text style={styles.formError}>{error}</Text>}
      <Button title="Sign up" onPress={handleRegister} loading={isLoading} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingTop: 48, backgroundColor: colors.background },
  title: { ...typography.h2, marginBottom: spacing.lg },
  formError: { color: colors.error, marginBottom: spacing.sm },
  btn: { marginTop: spacing.sm },
});
