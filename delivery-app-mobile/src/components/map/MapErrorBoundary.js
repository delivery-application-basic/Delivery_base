/**
 * Error boundary for map components. If MapView crashes (e.g. missing/invalid API key),
 * we show a fallback so the app does not crash.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Icon } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export class MapErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (__DEV__) {
      console.warn('MapErrorBoundary caught:', error?.message, info?.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <View style={styles.fallback}>
          <Icon source="map-marker-off" size={40} color={colors.textSecondary} />
          <Text style={styles.fallbackTitle}>Map unavailable</Text>
          <Text style={styles.fallbackText}>
            Use the links below to open locations in Google Maps.
          </Text>
          {this.props.restaurantLocation && (
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => Linking.openURL(`https://www.google.com/maps?q=${this.props.restaurantLocation.latitude},${this.props.restaurantLocation.longitude}`)}
            >
              <Text style={styles.linkBtnText}>Open restaurant in Maps</Text>
            </TouchableOpacity>
          )}
          {this.props.deliveryLocation && (
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => Linking.openURL(`https://www.google.com/maps?q=${this.props.deliveryLocation.latitude},${this.props.deliveryLocation.longitude}`)}
            >
              <Text style={styles.linkBtnText}>Open delivery address in Maps</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: spacing.lg,
  },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  fallbackText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  linkBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  linkBtnText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default MapErrorBoundary;
