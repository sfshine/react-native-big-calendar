import * as React from "react";
import { FlatList, Text, View, type ViewStyle } from "react-native";
import PagerView from "react-native-pager-view";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ICalendarEventBase } from "react-native-big-calendar";
import { styles } from "./DayEventsList.styles";

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
  const pagerRef = React.useRef<PagerView>(null);
  const currentPageIndex = React.useRef<number | null>(null);

  // 找到当前选中日期在这一周中的索引
  const selectedIndex = React.useMemo(
    () => weekDates.findIndex((date) => date.isSame(selectedDate, "day")),
    [weekDates, selectedDate]
  );

  // 当选中日期改变时，切换到对应的页面
  React.useEffect(() => {
    if (selectedIndex >= 0 && pagerRef.current && selectedIndex !== currentPageIndex.current) {
      pagerRef.current.setPage(selectedIndex);
    }
  }, [selectedIndex]);

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    currentPageIndex.current = newIndex;
    if (newIndex >= 0 && newIndex < weekDates.length && !weekDates[newIndex].isSame(selectedDate)) {
      onDateChange?.(weekDates[newIndex]);
    }
  };

  const renderDayEvents = (date: dayjs.Dayjs) => {
    const dayEvents = events.filter(({ start, end }) =>
      date.isBetween(
        dayjs(start).startOf("day"),
        dayjs(end).endOf("day"),
        null,
        "[)"
      )
    );

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
      <View style={{ flex: 1 }}>
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
  };

  return (
    <View style={[style, { backgroundColor: "green" }]}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={selectedIndex >= 0 ? selectedIndex : 0}
        onPageSelected={handlePageSelected}
      >
        {weekDates.map((date, index) => (
          <View key={date.format("YYYY-MM-DD")} style={{ flex: 1 }}>
            {renderDayEvents(date)}
          </View>
        ))}
      </PagerView>
    </View>
  );
}
