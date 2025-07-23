import dayjs, { Dayjs } from "dayjs";
import React, { useRef, useState, useMemo, memo, useEffect } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import {
  CalendarBody,
  CalendarHeader,
  ICalendarEventBase,
} from "react-native-big-calendar";
import PagerView from "react-native-pager-view";

type ViewMode = "day" | "3days";

interface DaysCalendarPagerProps {
  baseDate: Dayjs;
  allEvents: ICalendarEventBase[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  pagerRef: React.RefObject<PagerView>;
  viewMode: ViewMode;
}

const getDatesInNextOneDay = (date: Date): Dayjs[] => {
  return [dayjs(date)];
};

const getDatesInNextThreeDaysFixed = (date: Date): Dayjs[] => {
  const day = dayjs(date);
  return [day, day.add(1, "day"), day.add(2, "day")];
};

export default memo(function DaysCalendarPager({
  baseDate,
  allEvents,
  currentPageIndex,
  setCurrentPageIndex,
  pagerRef,
  viewMode,
}: DaysCalendarPagerProps) {
  const { height } = useWindowDimensions();

  const pageCount = 200; // For day/3-day view - increased to support wider date range
  const initialPage = 100; // Centered around the baseDate - increased accordingly
  const offscreenPageLimit = 3;



  const allDayEvents = useMemo(
    () =>
      allEvents.filter((event) => {
        const start = dayjs(event.start);
        const end = dayjs(event.end);
        return (
          start.hour() === 0 &&
          start.minute() === 0 &&
          end.hour() === 23 &&
          end.minute() === 59
        );
      }),
    [allEvents]
  );

  const daytimeEvents = useMemo(
    () =>
      allEvents.filter((event) => {
        const start = dayjs(event.start);
        const end = dayjs(event.end);
        return !(
          start.hour() === 0 &&
          start.minute() === 0 &&
          end.hour() === 23 &&
          end.minute() === 59
        );
      }),
    [allEvents]
  );

  const pages = useMemo(() => {
    const pagesArray = Array.from({ length: pageCount }, (_, index) => {
      let pageDate: Dayjs;
      if (viewMode === "day") {
        pageDate = baseDate.add(index - initialPage, "day");
      } else {
        // 3days
        pageDate = baseDate.add((index - initialPage) * 3, "day");
      }
      const dateRange =
        viewMode === "day"
          ? getDatesInNextOneDay(pageDate.toDate())
          : getDatesInNextThreeDaysFixed(pageDate.toDate());
      
      // 调试当前页面
      if (index === currentPageIndex) {
        console.log('[DaysCalendarPager] Displaying page:', index, 'date:', pageDate.format('YYYY-MM-DD'));
      }
      
      return { key: index, date: pageDate, dateRange };
    });
    
    return pagesArray;
  }, [baseDate, pageCount, initialPage, viewMode, currentPageIndex]);

  const offset =
    viewMode === "day"
      ? currentPageIndex - initialPage
      : (currentPageIndex - initialPage) * 3;
  const currentDisplayDate = baseDate.add(offset, "day");
  const endDate =
    viewMode === "day" ? currentDisplayDate : currentDisplayDate.add(2, "day");

  const cellHeight = 60;
  const containerHeight = height - 220;
  const scrollOffsetMinutes = 480; // 8:00 AM

  const onPageSelected = (event: any) => {
    const position = event.nativeEvent.position;
    setCurrentPageIndex(position);
  };

  return (
    <>
      <PagerView
        offscreenPageLimit={3}
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={currentPageIndex}
        key={`${viewMode}-${currentPageIndex}`}
        onPageSelected={onPageSelected}
      >
        {pages.map((page, index) => {
          const dateRange: Dayjs[] = page.dateRange;
          const isPageCached =
            Math.abs(index - currentPageIndex) <= offscreenPageLimit;

          if (!isPageCached) {
            return <View key={page.key} style={styles.pageContainer} />;
          }

          return (
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
        })}
      </PagerView>
    </>
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
