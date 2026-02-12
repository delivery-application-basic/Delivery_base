/**
 * SplashScreen - Initial load, check auth and onboarding then navigate
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { loadUserFromStorage } from '../../store/slices/authSlice';
import storage from '../../utils/storage';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Loader } from '../../components/common/Loader';

export default function SplashScreen({ navigation }) {
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const result = await dispatch(loadUserFromStorage());
      if (!mounted) return;
      const authenticated = !!(result.payload?.token && result.payload?.user);
      if (authenticated) return; // AppNavigator will show main app
      const onboardingDone = await storage.getOnboardingComplete();
      if (onboardingDone) {
        navigation.replace('UserTypeSelect');
      } else {
        navigation.replace('Onboarding');
      }
    })();
    return () => { mounted = false; };
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery App</Text>
      <Loader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 16,
  },
});
