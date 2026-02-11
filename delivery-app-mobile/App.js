/**
 * Delivery App - Main Entry Point
 * React Native Application for Ethiopian Delivery Service
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PaperProvider, configureFonts, DefaultTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { paperLightTheme, paperDarkTheme } from './src/theme/paperTheme';
import { initializeSocket } from './src/socket/socket';
import { colors } from './src/theme/colors';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const paperTheme = isDarkMode ? paperDarkTheme : paperLightTheme;

  useEffect(() => {
    // Initialize socket connection when app starts
    // Socket will be initialized after user logs in (handled in auth flow)
    // For now, we'll initialize it when user is authenticated
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <PaperProvider theme={paperTheme}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={colors.primary}
            />
            <AppNavigator />
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
