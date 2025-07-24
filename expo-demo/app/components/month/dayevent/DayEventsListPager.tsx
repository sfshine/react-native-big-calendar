import * as React from "react";
import {
  FlatList,
  Text,
  View,
  type ViewStyle,
  useWindowDimensions,
} from "react-native";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ICalendarEventBase } from "react-native-big-calendar";
import { styles } from "../styles/DayEventsList.styles";

dayjs.extend(isBetween);

interface DayEventsListPagerProps<T extends ICalendarEventBase> {
  events: T[];
  selectedDate: dayjs.Dayjs;
  weekDates: dayjs.Dayjs[]; // 这一周的所有日期
  onPressEvent?: (event: T) => void;
  onDateChange?: (date: dayjs.Dayjs) => void; // 当滑动改变日期时的回调
  style?: ViewStyle;
}

export function DayEventsListPager<T extends ICalendarEventBase>({
  events,
  selectedDate,
  weekDates,
  onPressEvent,
  onDateChange,
  style,
}: DayEventsListPagerProps<T>) {
  const { width } = useWindowDimensions();
  const flatListRef = React.useRef<FlatList>(null);
  const isMounted = React.useRef(false);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const selectedIndex = React.useMemo(
    () => weekDates.findIndex((date) => date.isSame(selectedDate, "day")),
    [weekDates, selectedDate],
  );

  const initialPage = selectedIndex > -1 ? selectedIndex : 0;

  const eventsByDate = React.useMemo(() => {
    const grouped = new Map<string, T[]>();
    for (const date of weekDates) {
      const dayEvents = events.filter(({ start, end }) =>
        date.isBetween(
          dayjs(start).startOf("day"),
          dayjs(end).endOf("day"),
          null,
          "[)",
        ),
      );
      grouped.set(date.format("YYYY-MM-DD"), dayEvents);
    }
    return grouped;
  }, [events, weekDates]);

  React.useEffect(() => {
    if (
      selectedIndex >= 0 &&
      flatListRef.current
    ) {
      flatListRef.current.scrollToIndex({
        index: selectedIndex,
        animated: false,
      });
    }
  }, [selectedIndex]);

  const onMomentumScrollEnd = (event: any) => {
    if (isMounted.current) {
      const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      if (
        newIndex >= 0 &&
        newIndex < weekDates.length &&
        !weekDates[newIndex].isSame(selectedDate)
      ) {
        onDateChange?.(weekDates[newIndex]);
      }
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const renderDayEvents = React.useCallback(
    (date: dayjs.Dayjs) => {
      const dayEvents = eventsByDate.get(date.format("YYYY-MM-DD")) || [];

      const renderItem = ({ item }: { item: T }) => (
        <View style={styles.eventItem}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventTime}>
            {dayjs(item.start).format("HH:mm")} -{" "}
            {dayjs(item.end).format("HH:mm")}
          </Text>
        </View>
      );

      return (
        <View style={{ flex: 1, backgroundColor: "yellow" }}>
          {dayEvents.length > 0 ? (
            <FlatList
              data={dayEvents}
              renderItem={renderItem}
              keyExtractor={(item) => `${item.start}-${item.title}`}
              style={styles.flatList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noEvents}>
              <Text style={styles.noEventsText}>No Events</Text>
            </View>
          )}
        </View>
      );
    },
    [eventsByDate],
  );

  const renderItem = ({
    item: date,
  }: {
    item: dayjs.Dayjs;
    index: number;
  }) => {
    return <View style={{ width: width }}>{renderDayEvents(date)}</View>;
  };

  return (
    <View style={[style, { backgroundColor: "green" }]}>
      <FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        data={weekDates}
        renderItem={renderItem}
        keyExtractor={(item) => item.format("YYYY-MM-DD")}
        horizontal
        pagingEnabled
        initialScrollIndex={initialPage}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={getItemLayout}
        showsHorizontalScrollIndicator={false}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={3}
      />
    </View>
  );
}
