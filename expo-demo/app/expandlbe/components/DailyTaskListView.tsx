import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { IScheduleModel } from '../types';
import { format } from 'date-fns';

interface DailyTaskListViewProps {
  schedules: IScheduleModel[];
  selectedDate: Date;
}

const DailyTaskListView: React.FC<DailyTaskListViewProps> = ({ schedules, selectedDate }) => {
  const dailySchedules = schedules.filter(
    (schedule) =>
      new Date(schedule.beginTime).toDateString() === selectedDate.toDateString()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{format(selectedDate, 'MMMM d, yyyy')}</Text>
      <FlatList
        data={dailySchedules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <View style={[styles.taskColor, { backgroundColor: item.color }]} />
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskTime}>
              {`${format(new Date(item.beginTime), 'HH:mm')} - ${format(new Date(item.endTime), 'HH:mm')}`}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks for this day.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 10,
  },
  taskColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    flex: 1,
  },
  taskTime: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});

export default DailyTaskListView;
