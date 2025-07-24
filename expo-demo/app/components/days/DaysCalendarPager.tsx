import dayjs, { Dayjs } from "dayjs";
import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View, Text } from "react-native";
import {
  CalendarHeader,
  ICalendarEventBase,
} from "react-native-big-calendar";
import { CalendarBody } from "./CalendarBody";
import PagerView from "../common/PagerView";

type ViewMode = "day" | "3days";

interface DaysCalendarPagerProps {
  allEvents: ICalendarEventBase[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  viewMode: ViewMode;
  minDate: Dayjs;
  maxDate: Dayjs;
}

const getDatesInNextOneDay = (date: Date): Dayjs[] => {
  return [dayjs(date)];
};

const getDatesInNextThreeDaysFixed = (date: Date): Dayjs[] => {
  const day = dayjs(date);
  return [day, day.add(1, "day"), day.add(2, "day")];
};

export default React.memo(function DaysCalendarPager({
  allEvents,
  currentPageIndex,
  setCurrentPageIndex,
  viewMode,
  minDate,
  maxDate,
}: DaysCalendarPagerProps) {
  const { height, width } = useWindowDimensions();
  const calendarBodyHeight = height - 120; // Adjust as needed

  const { pageCount } = useMemo(() => {
    console.time("DaysCalendarPager: calculating pageCount and initialPage");
    if (viewMode === "day") {
      const totalDays = maxDate.diff(minDate, "day") + 1;
      const initialPage = dayjs().diff(minDate, "day");
      console.timeEnd(
        "DaysCalendarPager: calculating pageCount and initialPage"
      );
      return { pageCount: totalDays, initialPage };
    } else {
      // 3days
      const totalDays = maxDate.diff(minDate, "day") + 1;
      const pageCount = Math.ceil(totalDays / 3);
      const initialPage = Math.floor(dayjs().diff(minDate, "day") / 3);
      console.timeEnd(
        "DaysCalendarPager: calculating pageCount and initialPage"
      );
      return { pageCount, initialPage };
    }
  }, [minDate, maxDate, viewMode]);

  const allDayEvents = useMemo(() => {
    console.time("DaysCalendarPager: calculating allDayEvents");
    const result = allEvents.filter((event) => {
      const start = dayjs(event.start);
      const end = dayjs(event.end);
      return (
        start.hour() === 0 &&
        start.minute() === 0 &&
        end.hour() === 23 &&
        end.minute() === 59
      );
    });
    console.timeEnd("DaysCalendarPager: calculating allDayEvents");
    return result;
  }, [allEvents]);

  const daytimeEvents = useMemo(() => {
    console.time("DaysCalendarPager: calculating daytimeEvents");
    const result = allEvents.filter((event) => {
      const start = dayjs(event.start);
      const end = dayjs(event.end);
      return !(
        start.hour() === 0 &&
        start.minute() === 0 &&
        end.hour() === 23 &&
        end.minute() === 59
      );
    });
    console.timeEnd("DaysCalendarPager: calculating daytimeEvents");
    return result;
  }, [allEvents]);

  const pages = useMemo(() => {
    console.time("DaysCalendarPager: calculating pages");
    const pagesArray = Array.from({ length: pageCount }, (_, index) => {
      let pageDate: Dayjs;
      if (viewMode === "day") {
        pageDate = minDate.add(index, "day");
      } else {
        // 3days
        pageDate = minDate.add(index * 3, "day");
      }
      const dateRange =
        viewMode === "day"
          ? getDatesInNextOneDay(pageDate.toDate())
          : getDatesInNextThreeDaysFixed(pageDate.toDate());

      return { key: index, date: pageDate, dateRange };
    });
    console.timeEnd("DaysCalendarPager: calculating pages");
    return pagesArray;
  }, [minDate, pageCount, viewMode]);

  const cellHeight = 60;
  const containerHeight = height - 220;
  const scrollOffsetMinutes = 480; // 8:00 AM

  const onPageChanged = (newIndex: number) => {
    if (newIndex !== currentPageIndex) {
      setCurrentPageIndex(newIndex);
    }
  };

  const renderPage = ({
    item: page,
    index,
  }: {
    item: { key: number; date: Dayjs; dateRange: Dayjs[] };
    index: number;
  }) => {
    console.time(
      `DaysCalendarPager: creating pages to render for index ${index}`
    );

    const dateRange: Dayjs[] = page.dateRange;
    const component = (
      <View key={page.key} style={[styles.pageContainer, { width: width }]}>
        <CalendarHeader
          dateRange={dateRange}
          cellHeight={cellHeight}
          locale="en"
          style={styles.headerComponent}
          allDayEvents={allDayEvents}
          showAllDayEventCell={true}
          allDayEventCellStyle={{}}
          allDayEventCellTextColor=""
        />
        <CalendarBody
          cellHeight={cellHeight}
          containerHeight={containerHeight}
          dateRange={dateRange}
          events={daytimeEvents}
          scrollOffsetMinutes={scrollOffsetMinutes}
          ampm={false}
          showTime={true}
          style={styles.calendarBody}
          hideNowIndicator={false}
          overlapOffset={20}
          isEventOrderingEnabled={true}
        />
      </View>
    );

    console.timeEnd(
      `DaysCalendarPager: creating pages to render for index ${index}`
    );
    return component;
  };

  return (
    <PagerView
      style={[styles.pagerView, { height: calendarBodyHeight }]}
      data={pages}
      renderPage={renderPage}
      keyExtractor={(item) => item.key.toString()}
      initialPageIndex={currentPageIndex}
      onPageChanged={onPageChanged}
    />
  );
});

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textAlign: "center",
    paddingTop: 10,
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  pagerView: {
    flex: 1,
    width: "100%",
  },
  pageContainer: {
    flex: 1,
  },
  calendarBody: {
    flex: 1,
  },
  headerComponent: {
    backgroundColor: "#f5f5f5",
  },
});
