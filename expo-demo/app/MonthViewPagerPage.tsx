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

export default function MonthViewPagerPage() {
  const { height } = useWindowDimensions();
  const [baseDate] = useState(dayjs()); // 固定的基准日期
  const [currentPageIndex, setCurrentPageIndex] = useState(6); // 起始页面索引，设置为中间位置
  const pagerRef = useRef<PagerView>(null);

  // 生成多个页面，预设12个月的页面（前6个月，当前月，后5个月）
  const pages = Array.from({ length: 12 }, (_, index) => {
    const pageDate = baseDate.add(index - 6, "month"); // -6 到 +5 个月
    return {
      key: index,
      date: pageDate,
    };
  });

  const onPageSelected = (event: any) => {
    const position = event.nativeEvent.position;
    setCurrentPageIndex(position);
  };

  // 计算当前显示的月份
  const currentDisplayDate = baseDate.add(currentPageIndex - 6, "month");

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{currentDisplayDate.format("MMMM YYYY")}</Text>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={6} // 从中间页面开始
        onPageSelected={onPageSelected}
      >
        {pages.map((page) => (
          <View key={page.key} style={styles.pageContainer}>
            <CalendarBodyForMonthView
              containerHeight={height - 120} // Adjusted for header and pager
              targetDate={page.date}
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