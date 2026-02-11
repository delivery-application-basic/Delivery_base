import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { OrderStatusBadge } from './OrderStatusBadge';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

export const OrderCard = ({
  orderId,
  status,
  totalAmount,
  createdAt,
  restaurantName,
  customerName,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <Text style={styles.orderId}>#{orderId}</Text>
        </View>
        <OrderStatusBadge status={status} />
      </View>

      <View style={styles.content}>
        {(restaurantName || customerName) && (
          <View style={styles.infoRow}>
            <Icon source={customerName ? "account-outline" : "store-outline"} size={18} color={colors.textLight} />
            <Text style={styles.infoText} numberOfLines={1}>
              {customerName || restaurantName}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Icon source="clock-outline" size={18} color={colors.textLight} />
          <Text style={styles.infoText}>{formatDateTime(createdAt)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.total}>{formatCurrency(totalAmount)}</Text>
        </View>
        <View style={styles.actionLink}>
          <Text style={styles.actionText}>Details</Text>
          <Icon source="chevron-right" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  idContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderId: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '800',
  },
  content: {
    marginBottom: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  amountContainer: {
    gap: 4,
  },
  amountLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '700',
  },
  total: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  actionText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default OrderCard;
