import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { isSameMonth, isToday, format } from '../utils/timeUtils';
import { IScheduleModel } from '../types';

interface DayViewProps {
  date: Date;
  currentMonth: Date;
  onPress: (date: Date) => void;
  schedules: IScheduleModel[];
  isSelected: boolean;
}

const DayView: React.FC<DayViewProps> = ({ date, currentMonth, onPress, schedules, isSelected }) => {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isTodaysDate = isToday(date);

  return (
    <TouchableOpacity onPress={() => onPress(date)} style={styles.container}>
      <Text
        style={[
          styles.dateText,
          !isCurrentMonth && styles.otherMonthText,
          isTodaysDate && styles.todayText,
          isSelected && styles.selectedText,
        ]}
      >
        {format(date, 'd')}
      </Text>
      <View style={styles.schedulesContainer}>
        {schedules.map((schedule) => (
          <View key={schedule.id} style={[styles.scheduleDot, { backgroundColor: schedule.color }]} />
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  dateText: {
    fontSize: 16,
  },
  otherMonthText: {
    color: '#ccc',
  },
  todayText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  selectedText: {
    color: 'white',
    backgroundColor: 'blue',
    borderRadius: 15,
    width: 30,
    height: 30,
    textAlign: 'center',
    lineHeight: 30,
    overflow: 'hidden',
  },
  schedulesContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  scheduleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 1,
  },
});

export default DayView;
