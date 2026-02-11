/**
 * AppIcon - Simple icon component that works without font loading
 * Uses emoji/text icons as fallback until MaterialCommunityIcons fonts are loaded
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { colors } from '../../theme/colors';

const iconMap = {
  'home': '🏠',
  'clipboard-list': '📋',
  'account': '👤',
  'cart': '🛒',
  'store': '🏪',
  'heart': '❤️',
  'arrow-left': '←',
  'store-off-outline': '🏪',
  'inbox-outline': '📥',
};

export const AppIcon = ({ source, size = 24, color = colors.text, style }) => {
  // Try react-native-paper Icon first
  try {
    return <Icon source={source} size={size} color={color} style={style} />;
  } catch (e) {
    // Fallback to emoji/text
    const emoji = iconMap[source] || '•';
    return (
      <Text style={[styles.emoji, { fontSize: size, color }, style]}>
        {emoji}
      </Text>
    );
  }
};

const styles = StyleSheet.create({
  emoji: {
    textAlign: 'center',
  },
});

export default AppIcon;
