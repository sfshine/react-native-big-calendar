import dayjs, { Dayjs } from "dayjs";
import React, { useRef, useState, useMemo, memo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import {
  CalendarHeaderForMonthView,
  ICalendarEventBase,
} from "react-native-big-calendar";
import { CalendarBodyForMonthView } from "./CalendarBodyForMonthView";
import PagerView from "react-native-pager-view";

interface MonthCalendarPagerProps {
  baseDate: Dayjs;
  allEvents: ICalendarEventBase[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  pagerRef: React.RefObject<PagerView>;
}

const getDatesInMonth = (date: Dayjs): Dayjs[] => {
  const startOfMonth = date.startOf("month");
  const endOfMonth = date.endOf("month");
  const startOfCalendar = startOfMonth.startOf("week");
  const endOfCalendar = endOfMonth.endOf("week");

  const dates: Dayjs[] = [];
  let current = startOfCalendar;

  while (
    current.isBefore(endOfCalendar) ||
    current.isSame(endOfCalendar, "day")
  ) {
    dates.push(current);
    current = current.add(1, "day");
  }

  return dates;
};

export default memo(function MonthCalendarPager({
  baseDate,
  allEvents,
  currentPageIndex,
  setCurrentPageIndex,
  pagerRef,
}: MonthCalendarPagerProps) {
  const { height } = useWindowDimensions();

  const pageCount = 12; // For month view, we can have a fixed number of pages
  const initialPage = 6; // Centered around the baseDate
  const offscreenPageLimit = 1;

  const pages = useMemo(() => {
    return Array.from({ length: pageCount }, (_, index) => {
      const pageDate = baseDate.add(index - initialPage, "month");
      return { key: index, date: pageDate };
    });
  }, [baseDate, pageCount, initialPage]);

  const currentDisplayDate = baseDate.add(
    currentPageIndex - initialPage,
    "month"
  );

  const onPageSelected = (event: any) => {
    const position = event.nativeEvent.position;
    setCurrentPageIndex(position);
  };

  return (
    <>
      <Text style={styles.header}>
        {currentDisplayDate.format("MMMM YYYY")}
      </Text>
      <PagerView
        offscreenPageLimit={offscreenPageLimit}
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={initialPage}
        onPageSelected={onPageSelected}
      >
        {pages.map((page, index) => {
          const isPageCached =
            Math.abs(index - currentPageIndex) <= offscreenPageLimit;

          if (!isPageCached) {
            return <View key={page.key} style={styles.pageContainer} />;
          }

          return (
            <View key={page.key} style={styles.pageContainer}>
              <CalendarHeaderForMonthView
                dateRange={getDatesInMonth(page.date)}
                style={styles.headerComponent}
                locale="en"
                weekStartsOn={0}
                showWeekNumber={false}
                weekNumberPrefix=""
                headerContainerAccessibilityProps={{}}
                headerCellAccessibilityProps={{}}
              />
              <CalendarBodyForMonthView
                containerHeight={height} // Adjusted for header
                targetDate={page.date}
                events={allEvents}
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
