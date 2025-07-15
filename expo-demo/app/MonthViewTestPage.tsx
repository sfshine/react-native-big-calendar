import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, useWindowDimensions } from "react-native";
import dayjs, { Dayjs } from "dayjs";
import { ICalendarEventBase } from "react-native-big-calendar";
import { CalendarBodyForMonthView } from "react-native-big-calendar";
import InfinitePager, { InfinitePagerImperativeApi } from "react-native-infinite-pager";

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

export default function MonthViewTestPage() {
  const { height } = useWindowDimensions();
  const [baseDate] = useState(dayjs()); // 固定的基准日期
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 当前页面索引
  const pagerRef = useRef<InfinitePagerImperativeApi>(null);

  const MonthPage = ({ index }: { index: number }) => {
    const pageDate = baseDate.add(index, "month");
    return (
      <View style={styles.pageContainer}>
        <CalendarBodyForMonthView
          containerHeight={height - 120} // Adjusted for header and pager
          targetDate={pageDate}
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

  const onPageChange = (page: number) => {
    // 更新当前页面索引
    setCurrentPageIndex(page);
  };

  // 计算当前显示的月份
  const currentDisplayDate = baseDate.add(currentPageIndex, "month");

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{currentDisplayDate.format("MMMM YYYY")}</Text>
      <InfinitePager
        ref={pagerRef}
        style={styles.pagerView}
        PageComponent={MonthPage}
        onPageChange={onPageChange}
        initialIndex={0}
        pageBuffer={3} // Keep 3 pages in memory
      />
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
