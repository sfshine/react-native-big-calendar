import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, useWindowDimensions } from "react-native";
import dayjs, { Dayjs } from "dayjs";
import { ICalendarEventBase } from "react-native-big-calendar";
import { CalendarBodyForMonthView } from "react-native-big-calendar";
import PagerView from "react-native-pager-view";

const DUMMY_EVENTS: ICalendarEventBase[] = [
  {
    title: "Meeting",
    start: dayjs().set("date", 10).set("hour", 10).toDate(),
    end: dayjs().set("date", 10).set("hour", 12).toDate(),
  },
  {
    title: "Lunch",
    start: dayjs().set("date", 15).set("hour", 13).toDate(),
    end: dayjs().set("date", 15).set("hour", 14).toDate(),
  },
  {
    title: "Project Deadline",
    start: dayjs().set("date", 20).set("hour", 9).toDate(),
    end: dayjs().set("date", 22).set("hour", 17).toDate(),
  },
];

const MonthPage = ({ height, date }: { height: number; date: Dayjs }) => {
  return (
    <View style={styles.pageContainer}>
      <CalendarBodyForMonthView
        containerHeight={height - 120} // Adjusted for header and pager
        targetDate={date}
        events={DUMMY_EVENTS}
        style={styles.calendarBody}
        maxVisibleEventCount={3}
        weekStartsOn={0} // Sunday
        eventMinHeightForMonthView={20}
        moreLabel={"{moreCount} More"}
        showAdjacentMonths={true}
        sortedMonthView={true}
      />
    </View>
  );
};

export default function MonthViewTestPage() {
  const { height } = useWindowDimensions();
  const [date, setDate] = useState(dayjs());
  const pagerRef = useRef<PagerView>(null);

  const dates = [date.subtract(1, "month"), date, date.add(1, "month")];

  const onPageSelected = (e: any) => {
    const { position } = e.nativeEvent;
    if (position === 0 || position === 2) {
      const newDate =
        position === 0 ? date.subtract(1, "month") : date.add(1, "month");
      setDate(newDate);
      // Use timeout to allow state update before resetting pager
      setTimeout(() => {
        pagerRef.current?.setPageWithoutAnimation(1);
      }, 0);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{date.format("MMMM YYYY")}</Text>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={1}
        onPageSelected={onPageSelected}
        key={date.format("YYYY-MM")} // Re-mount pager on date change to ensure correct state
      >
        {dates.map((d, i) => (
          <View key={i}>
            <MonthPage height={height} date={d} />
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  pagerView: {
    flex: 1,
    width: "100%",
  },
  pageContainer: {
    flex: 1,
  },
  calendarBody: {
    width: "100%",
  },
});
