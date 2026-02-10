/**
 * MenuItemModal - Modal for menu item details / add to cart
 */

import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Portal, Button } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const MenuItemModal = ({ visible, onDismiss, children, onAddToCart }) => (
  <Portal>
    <Modal visible={visible} onRequestClose={onDismiss} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {children}
          {onAddToCart && (
            <Button mode="contained" onPress={onAddToCart} style={styles.btn}>
              Add to cart
            </Button>
          )}
          <Button mode="outlined" onPress={onDismiss} style={styles.btn}>
            Close
          </Button>
        </View>
      </View>
    </Modal>
  </Portal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.lg },
  btn: { marginTop: spacing.sm },
});

export default MenuItemModal;
