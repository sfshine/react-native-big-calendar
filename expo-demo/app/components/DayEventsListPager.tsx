import dayjs, { Dayjs } from "dayjs";
import React, { useMemo, useRef, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import PagerView from "react-native-pager-view";
import { ICalendarEventBase } from "react-native-big-calendar";
import { DayEventsList } from "./DayEventsList";

interface DayEventsListPagerProps<T extends ICalendarEventBase> {
  events: T[];
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
  style?: any;
}

const DayEventsListPager = <T extends ICalendarEventBase>({
  events,
  selectedDate,
  onDateChange,
  style,
}: DayEventsListPagerProps<T>) => {
  const pagerRef = useRef<PagerView>(null);

  const dates = useMemo(() => {
    const startOfWeek = selectedDate.startOf("week");
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));
  }, [selectedDate]);

  useEffect(() => {
    const dayIndex = selectedDate.day();
    // As the week may not start on Sunday, we need to find the correct index
    const index = dates.findIndex(d => d.isSame(selectedDate, 'day'));
    if (pagerRef.current && index >= 0) {
      pagerRef.current.setPageWithoutAnimation(index);
    }
  }, [selectedDate, dates]);

  const onPageSelected = (e: any) => {
    const newDate = dates[e.nativeEvent.position];
    onDateChange(newDate);
  };

  return (
    <PagerView
      ref={pagerRef}
      style={[styles.pager, style]}
      initialPage={selectedDate.day()}
      onPageSelected={onPageSelected}
    >
      {dates.map((date, index) => (
        <View key={index} style={styles.page}>
          <DayEventsList events={events} selectedDate={date} />
        </View>
      ))}
    </PagerView>
  );
};

const styles = StyleSheet.create({
  pager: {
    backgroundColor: "red",
    flex: 1,
  },
  page: {
    backgroundColor: "red",
    flex: 1,
  },
});

export default DayEventsListPager;

