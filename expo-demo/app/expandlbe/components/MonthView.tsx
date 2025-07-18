import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';
import { getDaysInMonth, getWeekDays, format, addMonths } from '../utils/timeUtils';
import DayView from './DayView';
import DailyTaskListView from './DailyTaskListView';
import { IScheduleModel } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MonthView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
  const weekDays = getWeekDays();

  const handleDayPress = (date: Date) => {
    const weekIndex = Math.floor(days.findIndex(d => d.getTime() === date.getTime()) / 7);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectedDate && selectedDate.getTime() === date.getTime()) {
      setSelectedDate(null);
      setExpandedWeek(null);
    } else {
      setSelectedDate(date);
      setExpandedWeek(weekIndex);
    }
  };

  const renderWeeks = () => {
    const weeks: React.ReactElement[] = [];
    for (let i = 0; i < days.length / 7; i++) {
      const weekDays = days.slice(i * 7, (i + 1) * 7);
      weeks.push(
        <View key={i}>
          <View style={styles.weekContainer}>
            {weekDays.map((day) => (
              <DayView
                key={day.toISOString()}
                date={day}
                currentMonth={currentMonth}
                onPress={handleDayPress}
                schedules={mockSchedules.filter(s => new Date(s.beginTime).toDateString() === day.toDateString())}
                isSelected={selectedDate?.getTime() === day.getTime()}
              />
            ))}
          </View>
          {expandedWeek === i && selectedDate && (
            <DailyTaskListView schedules={mockSchedules} selectedDate={selectedDate} />
          )}
        </View>
      );
    }
    return weeks;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthText}>{format(currentMonth, 'MMMM yyyy')}</Text>
      </View>
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>
      {renderWeeks()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    padding: 16,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  weekDayText: {
    fontSize: 14,
    color: '#888',
  },
  weekContainer: {
    flexDirection: 'row',
  },
});

const mockSchedules: IScheduleModel[] = [
    { id: '1', title: 'Meeting with team', beginTime: new Date().getTime(), endTime: new Date().getTime() + 3600000, color: 'red' },
    { id: '2', title: 'Lunch with John', beginTime: new Date(new Date().setDate(new Date().getDate() + 1)).getTime(), endTime: new Date(new Date().setDate(new Date().getDate() + 1)).getTime() + 3600000, color: 'green' },
];


export default MonthView;
