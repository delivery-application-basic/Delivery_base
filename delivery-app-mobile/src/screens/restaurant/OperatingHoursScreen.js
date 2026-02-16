import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { restaurantService } from '../../api/services/restaurantService';
import { Text } from '../../components/common/Text';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const DAYS = [
  { id: 1, name: 'Monday', code: 'mon' },
  { id: 2, name: 'Tuesday', code: 'tue' },
  { id: 3, name: 'Wednesday', code: 'wed' },
  { id: 4, name: 'Thursday', code: 'thu' },
  { id: 5, name: 'Friday', code: 'fri' },
  { id: 6, name: 'Saturday', code: 'sat' },
  { id: 0, name: 'Sunday', code: 'sun' },
];

export default function OperatingHoursScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { restaurantId, restaurantName } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day.id]: { is_closed: false, opening_time: '08:00', closing_time: '22:00' }
    }), {})
  );

  useEffect(() => {
    const fetchHours = async () => {
      try {
        setLoading(true);
        const res = await restaurantService.getRestaurantById(restaurantId);
        const data = res.data?.data ?? res.data;
        if (data?.operating_hours?.length > 0) {
          const newSchedule = { ...schedule };
          data.operating_hours.forEach(h => {
            newSchedule[h.day_of_week] = {
              is_closed: !!h.is_closed,
              opening_time: h.opening_time.substring(0, 5),
              closing_time: h.closing_time.substring(0, 5)
            };
          });
          setSchedule(newSchedule);
        }
      } catch (err) {
        console.error('Failed to fetch hours:', err);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) fetchHours();
  }, [restaurantId]);

  const toggleDay = (dayId) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], is_closed: !prev[dayId].is_closed }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const hoursData = DAYS.map(day => ({
        day_of_week: day.id,
        opening_time: schedule[day.id].opening_time,
        closing_time: schedule[day.id].closing_time,
        is_closed: schedule[day.id].is_closed
      }));

      await restaurantService.updateOperatingHours(restaurantId, hoursData);
      Alert.alert('Success', 'Operating hours updated successfully');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to update operating hours');
    } finally {
      setSaving(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon source="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>Operating Hours</Text>
        <Text style={styles.headerSubtitle}>{restaurantName}</Text>
      </View>
      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>{saving ? '...' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <Loader fullScreen />;

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
            const isClosed = dayData.is_closed;

            return (
              <View key={day.id} style={[styles.dayRow, index === DAYS.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.dayMain}>
                  <Text style={[styles.dayName, isClosed && styles.disabledText]}>{day.name}</Text>
                  <Switch
                    value={!isClosed}
                    onValueChange={() => toggleDay(day.id)}
                    trackColor={{ false: colors.gray[200], true: colors.primary + '80' }}
                    thumbColor={!isClosed ? colors.primary : colors.gray[400]}
                  />
                </View>

                {!isClosed ? (
                  <View style={styles.timeContainer}>
                    <TouchableOpacity style={styles.timeBox}>
                      <Text style={styles.timeLabel}>Opens</Text>
                      <Text style={styles.timeText}>{dayData.opening_time}</Text>
                    </TouchableOpacity>
                    <Icon source="minus" size={20} color={colors.gray[300]} />
                    <TouchableOpacity style={styles.timeBox}>
                      <Text style={styles.timeLabel}>Closes</Text>
                      <Text style={styles.timeText}>{dayData.closing_time}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.closedBadge}>
                    <Text style={styles.closedText}>CLOSED FOR BUSINESS</Text>
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    ...shadows.small,
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
    color: colors.primary,
    fontWeight: '600',
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
    gap: 8,
  },
  timeBox: {
    flex: 1,
    backgroundColor: colors.gray[50],
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  timeLabel: {
    fontSize: 9,
    color: colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  closedBadge: {
    backgroundColor: colors.gray[50],
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderStyle: 'dashed',
  },
  closedText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textLight,
    letterSpacing: 1,
  },
});
