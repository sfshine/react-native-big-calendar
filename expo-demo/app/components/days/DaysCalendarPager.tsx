import dayjs, { Dayjs } from "dayjs";
import React, { useRef, useState, useMemo, memo, useEffect } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import {
  CalendarHeader,
  ICalendarEventBase,
} from "react-native-big-calendar";
import { CalendarBody } from "./CalendarBody";
import PagerView from "react-native-pager-view";

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

export default memo(function DaysCalendarPager({
  allEvents,
  currentPageIndex,
  setCurrentPageIndex,
  viewMode,
  minDate,
  maxDate,
}: DaysCalendarPagerProps) {
  const { height } = useWindowDimensions();
  const calendarBodyHeight = height - 120; // Adjust as needed
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const { pageCount, initialPage } = useMemo(() => {
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

  const offscreenPageLimit = 1;

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

  const placeholderPages = useMemo(() => {
    console.time("DaysCalendarPager: creating placeholder pages");
    const result = Array.from({ length: pageCount }).map((_, index) => (
      <View key={index} style={styles.pageContainer} />
    ));
    console.timeEnd("DaysCalendarPager: creating placeholder pages");
    return result;
  }, [pageCount]);

  const cellHeight = 60;
  const containerHeight = height - 220;
  const scrollOffsetMinutes = 480; // 8:00 AM

  const pagesToRender = useMemo(() => {
    console.time(
      `DaysCalendarPager: creating pages to render for index ${currentPageIndex}`
    );
    const newPages = [...placeholderPages];
    const start = Math.max(0, currentPageIndex - offscreenPageLimit);
    const end = Math.min(pageCount - 1, currentPageIndex + offscreenPageLimit);

    for (let i = start; i <= end; i++) {
      const page = pages[i];
      if (!page) continue;

      const dateRange: Dayjs[] = page.dateRange;
      newPages[i] = (
        <View key={page.key} style={styles.pageContainer}>
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
    }
    console.timeEnd(
      `DaysCalendarPager: creating pages to render for index ${currentPageIndex}`
    );
    return newPages;
  }, [
    placeholderPages,
    pages,
    currentPageIndex,
    offscreenPageLimit,
    pageCount,
    cellHeight,
    containerHeight,
    allDayEvents,
    daytimeEvents,
    scrollOffsetMinutes,
  ]);

  const offset =
    viewMode === "day"
      ? currentPageIndex
      : currentPageIndex * 3;
  const currentDisplayDate = minDate.add(offset, "day");
  const endDate =
    viewMode === "day" ? currentDisplayDate : currentDisplayDate.add(2, "day");

  const onPageSelected = (event: any) => {
    if (isMounted.current) {
      const position = event.nativeEvent.position;
      console.log(`DaysCalendarPager: onPageSelected - position: ${position}`);
      setCurrentPageIndex(position);
    }
  };

  return (
    <PagerView
      offscreenPageLimit={offscreenPageLimit}
      style={[styles.pagerView, { height: calendarBodyHeight }]}
      initialPage={currentPageIndex}
      onPageSelected={onPageSelected}
    >
      {pagesToRender}
    </PagerView>
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
