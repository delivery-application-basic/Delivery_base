import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const DAYS = [
  { id: 'mon', name: 'Monday' },
  { id: 'tue', name: 'Tuesday' },
  { id: 'wed', name: 'Wednesday' },
  { id: 'thu', name: 'Thursday' },
  { id: 'fri', name: 'Friday' },
  { id: 'sat', name: 'Saturday' },
  { id: 'sun', name: 'Sunday' },
];

export default function OperatingHoursScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [schedule, setSchedule] = useState(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day.id]: { isOpen: true, open: '08:00 AM', close: '10:00 PM' }
    }), {})
  );

  const toggleDay = (dayId) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], isOpen: !prev[dayId].isOpen }
    }));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Operating Hours</Text>
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoCard}>
          <Icon source="information-outline" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Setting your operating hours correctly ensures customers know when they can order from you.
          </Text>
        </View>

        <View style={styles.scheduleCard}>
          {DAYS.map((day, index) => {
            const dayData = schedule[day.id];
            return (
              <View key={day.id} style={[styles.dayRow, index === DAYS.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.dayMain}>
                  <Text style={[styles.dayName, !dayData.isOpen && styles.disabledText]}>{day.name}</Text>
                  <Switch
                    value={dayData.isOpen}
                    onValueChange={() => toggleDay(day.id)}
                    trackColor={{ false: colors.gray[200], true: colors.primary + '80' }}
                    thumbColor={dayData.isOpen ? colors.primary : colors.gray[400]}
                  />
                </View>

                {dayData.isOpen ? (
                  <View style={styles.timeContainer}>
                    <TouchableOpacity style={styles.timeBox}>
                      <Text style={styles.timeText}>{dayData.open}</Text>
                    </TouchableOpacity>
                    <Text style={styles.timeDivider}>to</Text>
                    <TouchableOpacity style={styles.timeBox}>
                      <Text style={styles.timeText}>{dayData.close}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.closedBadge}>
                    <Text style={styles.closedText}>CLOSED</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    padding: layout.screenPadding,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: 16,
    gap: 12,
    marginBottom: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  scheduleCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.md,
    ...shadows.small,
  },
  dayRow: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  dayMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  disabledText: {
    color: colors.textLight,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeBox: {
    flex: 1,
    backgroundColor: colors.gray[50],
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  timeDivider: {
    color: colors.textLight,
    fontWeight: '600',
  },
  closedBadge: {
    backgroundColor: colors.gray[100],
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closedText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 1,
  },
});
