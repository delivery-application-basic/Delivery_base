/**
 * OrderTimeline - 5-stage tracking timeline
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatDateTime } from '../../utils/helpers';
import { TRACKING_STAGES } from '../../utils/constants';

const STAGE_LABELS = {
  [TRACKING_STAGES.ORDER_ISSUED]: 'Order issued',
  [TRACKING_STAGES.PAYMENT_VERIFIED]: 'Payment verified',
  [TRACKING_STAGES.PROCESSING_FOOD]: 'Processing food',
  [TRACKING_STAGES.DELIVERY_ON_THE_WAY]: 'Delivery on the way',
  [TRACKING_STAGES.DELIVERED]: 'Delivered',
};

export const OrderTimeline = ({ timeline = [] }) => (
  <View style={styles.wrap}>
    {timeline.map((item, i) => (
      <View key={item.stage} style={styles.item}>
        <View style={[styles.dot, item.completed && styles.dotCompleted]} />
        {i < timeline.length - 1 && <View style={styles.line} />}
        <View style={styles.text}>
          <Text style={styles.label}>{item.label || STAGE_LABELS[item.stage]}</Text>
          {item.timestamp && <Text style={styles.time}>{formatDateTime(item.timestamp)}</Text>}
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  wrap: { paddingVertical: 8 },
  item: { flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.gray[300], marginRight: 12, marginTop: 4 },
  dotCompleted: { backgroundColor: colors.primary },
  line: { position: 'absolute', left: 5, top: 16, bottom: 0, width: 2, backgroundColor: colors.gray[200] },
  text: { flex: 1, minWidth: 0 },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm + 6,
    color: colors.text,
    fontWeight: '500',
    flexShrink: 1,
  },
  time: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
});

export default OrderTimeline;
