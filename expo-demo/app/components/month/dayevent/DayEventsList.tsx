import * as React from "react";
import { FlatList, Text, View, type ViewStyle } from "react-native";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ICalendarEventBase } from "react-native-big-calendar";
import { styles } from "../styles/DayEventsList.styles";

dayjs.extend(isBetween);

interface DayEventsListProps<T extends ICalendarEventBase> {
  events: T[];
  selectedDate: dayjs.Dayjs;
  onPressEvent?: (event: T) => void;
  style?: ViewStyle;
}

export function DayEventsList<T extends ICalendarEventBase>({
  events,
  selectedDate,
  onPressEvent,
  style,
}: DayEventsListProps<T>) {
  const dayEvents = React.useMemo(
    () =>
      events.filter(({ start, end }) =>
        selectedDate.isBetween(
          dayjs(start).startOf("day"),
          dayjs(end).endOf("day"),
          null,
          "[)"
        )
      ),
    [events, selectedDate]
  );

  const renderItem = ({ item }: { item: T }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventTime}>
        {dayjs(item.start).format("HH:mm")} - {dayjs(item.end).format("HH:mm")}
      </Text>
    </View>
  );

  return (
    <View style={[{ backgroundColor: "#f5f5f5" }, style]}>
      {dayEvents.length > 0 ? (
        <FlatList
          data={dayEvents}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.start}-${item.title}`}
          style={styles.flatList}
        />
      ) : (
        <View style={styles.noEvents}>
          <Text style={styles.noEventsText}>No Events</Text>
        </View>
      )}
    </View>
  );
}