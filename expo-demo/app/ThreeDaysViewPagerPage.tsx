import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, useWindowDimensions } from "react-native";
import dayjs, { Dayjs } from "dayjs";
import { ICalendarEventBase, Calendar } from "react-native-big-calendar";
import PagerView from "react-native-pager-view";

const DUMMY_EVENTS: ICalendarEventBase[] = [
  {
    title: "Morning Meeting",
    start: dayjs().set("hour", 9).set("minute", 0).toDate(),
    end: dayjs().set("hour", 10).set("minute", 30).toDate(),
  },
  {
    title: "Lunch Break",
    start: dayjs().add(1, "day").set("hour", 12).set("minute", 0).toDate(),
    end: dayjs().add(1, "day").set("hour", 13).set("minute", 0).toDate(),
  },
  {
    title: "Team Standup",
    start: dayjs().add(2, "day").set("hour", 15).set("minute", 0).toDate(),
    end: dayjs().add(2, "day").set("hour", 15).set("minute", 30).toDate(),
  },
  {
    title: "All Day Event",
    start: dayjs().add(1, "day").startOf("day").toDate(),
    end: dayjs().add(1, "day").endOf("day").toDate(),
  },
  {
    title: "Multi-day Event",
    start: dayjs().add(1, "day").set("hour", 14).toDate(),
    end: dayjs().add(2, "day").set("hour", 16).toDate(),
  },
];

export default function ThreeDaysViewPagerPage() {
  const { height } = useWindowDimensions();
  const [baseDate] = useState(dayjs()); // 固定的基准日期
  const [currentPageIndex, setCurrentPageIndex] = useState(10); // 起始页面索引，设置为中间位置
  const pagerRef = useRef<PagerView>(null);

  // 生成多个页面，预设20个3日周期的页面（前10个周期，当前周期，后9个周期）
  const pages = Array.from({ length: 20 }, (_, index) => {
    const pageDate = baseDate.add((index - 10) * 3, "day"); // 每个页面间隔3天
    return {
      key: index,
      date: pageDate,
    };
  });

  const onPageSelected = (event: any) => {
    const position = event.nativeEvent.position;
    setCurrentPageIndex(position);
  };

  // 计算当前显示的3日周期开始日期
  const currentDisplayDate = baseDate.add((currentPageIndex - 10) * 3, "day");
  const endDate = currentDisplayDate.add(2, "day");

  // 格式化日期范围显示
  const formatDateRange = (startDate: Dayjs, endDate: Dayjs) => {
    const isSameMonth = startDate.month() === endDate.month();
    const isSameYear = startDate.year() === endDate.year();

    if (isSameMonth && isSameYear) {
      return `${startDate.format("MMM DD")} - ${endDate.format("DD, YYYY")}`;
    } else if (isSameYear) {
      return `${startDate.format("MMM DD")} - ${endDate.format(
        "MMM DD, YYYY"
      )}`;
    } else {
      return `${startDate.format("MMM DD, YYYY")} - ${endDate.format(
        "MMM DD, YYYY"
      )}`;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {formatDateRange(currentDisplayDate, endDate)}
      </Text>
      <Text style={styles.subHeader}>3 Days View</Text>

      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={10} // 从中间页面开始
        onPageSelected={onPageSelected}
      >
        {pages.map((page) => (
          <View key={page.key} style={styles.pageContainer}>
            <Calendar
              height={height - 160} // 为header和pager调整高度
              date={page.date.toDate()}
              events={DUMMY_EVENTS}
              mode="3days"
              swipeEnabled={false} // 禁用内部滑动，使用外部PagerView
              showTime={true}
              scrollOffsetMinutes={480} // 8:00 AM开始显示
              ampm={false}
              hourRowHeight={60}
              onPressEvent={(event) => {
                console.log("Event pressed:", event.title);
              }}
              onPressCell={(date) => {
                console.log("Cell pressed:", date);
              }}
              eventCellStyle={{
                backgroundColor: "#e3f2fd",
                borderRadius: 8,
                borderColor: "#1976d2",
                borderWidth: 1,
              }}
              calendarCellStyle={{
                borderColor: "#e0e0e0",
              }}
              headerContainerStyle={{
                backgroundColor: "#f5f5f5",
              }}
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  pagerView: {
    flex: 1,
    width: "100%",
  },
  pageContainer: {
    flex: 1,
  },
});
