import dayjs, { Dayjs } from "dayjs";
import React, { useRef, useState, useMemo, memo, useEffect } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ICalendarEventBase } from "react-native-big-calendar";
import { CalendarBodyForMonthView } from "./CalendarBodyForMonthView";
import { CalendarHeaderForMonthView } from "./CalendarHeaderForMonthView";
import PagerView from "react-native-pager-view";

interface MonthCalendarPagerProps {
  baseDate: Dayjs;
  allEvents: ICalendarEventBase[];
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  pagerRef: React.RefObject<PagerView>;
  minDate: Dayjs;
  maxDate: Dayjs;
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
  minDate,
  maxDate,
}: MonthCalendarPagerProps) {
  const [isEventExpanded, setIsEventExpanded] = useState(false);
  const { height, width } = useWindowDimensions();
  const calendarBodyHeight = height * 0.8;

  const { pageCount, initialPage } = useMemo(() => {
    const start = minDate.startOf('month');
    const end = maxDate.endOf('month');
    const totalMonths = end.diff(start, 'month') + 1;
    const initialPage = baseDate.diff(start, 'month');
    return { pageCount: totalMonths, initialPage };
  }, [minDate, maxDate, baseDate]);

  const offscreenPageLimit = 3;



  const pages = useMemo(() => {
    return Array.from({ length: pageCount }, (_, index) => {
      const pageDate = minDate.add(index, "month");
      return { key: index, date: pageDate };
    });
  }, [minDate, pageCount]);

  const onPageSelected = (event: any) => {
    const position = event.nativeEvent.position;
    setCurrentPageIndex(position);
  };

  return (
    <PagerView
      offscreenPageLimit={offscreenPageLimit}
      ref={pagerRef}
      style={[styles.pagerView, { height: calendarBodyHeight }]}
      initialPage={currentPageIndex}
      key={`month-${currentPageIndex}`}
      onPageSelected={onPageSelected}
      scrollEnabled={!isEventExpanded}
    >
      {pages.map((page, index) => {
        const isPageCached =
          Math.abs(index - currentPageIndex) <= offscreenPageLimit;

        if (!isPageCached) {
          return <View key={page.key} style={styles.pageContainer} />;
        }

        const eventsForMonth = allEvents.filter((event) => {
          const eventStart = dayjs(event.start);
          const eventEnd = dayjs(event.end);
          const pageStart = page.date.startOf("month");
          const pageEnd = page.date.endOf("month");

          // Check if the event overlaps with the current month
          return eventStart.isBefore(pageEnd) && eventEnd.isAfter(pageStart);
        });

        return (
          <View key={page.key} style={styles.pageContainer}>
            <CalendarHeaderForMonthView
              displayDate={page.date}
              style={styles.headerComponent}
              locale="en"
              weekStartsOn={0}
              showWeekNumber={false}
              weekNumberPrefix=""
              headerContainerAccessibilityProps={{}}
              headerCellAccessibilityProps={{}}
            />
            <CalendarBodyForMonthView
              targetDate={page.date}
              events={eventsForMonth}
              style={{ height: calendarBodyHeight }}
              maxVisibleEventCount={3}
              weekStartsOn={0} // Sunday
              eventMinHeightForMonthView={15}
              moreLabel={"{moreCount} More"}
              showAdjacentMonths={true}
              sortedMonthView={true}
              onExpandedStateChange={setIsEventExpanded}
              calendarWidth={width}
              calendarBodyHeight={calendarBodyHeight}
            />
          </View>
        );
      })}
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
  pagerView: {
    flex: 1,
    width: "100%",
  },
  pageContainer: {
    flex: 1,
  },
  headerComponent: {
    backgroundColor: "#f5f5f5",
  },
});
