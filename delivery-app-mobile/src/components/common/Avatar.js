/**
 * Avatar - User/restaurant avatar image or initial
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const Avatar = ({ source, name, size = 40 }) => {
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';
  if (source?.uri) {
    return <Image source={source} style={[styles.img, { width: size, height: size, borderRadius: size / 2 }]} />;
  }
  return (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initial, { fontSize: size * 0.45 }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  img: { backgroundColor: colors.gray[200] },
  placeholder: { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  initial: { color: colors.white, fontWeight: '600' },
});

export default Avatar;
