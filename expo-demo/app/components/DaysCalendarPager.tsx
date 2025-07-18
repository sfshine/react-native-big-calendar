import dayjs, { Dayjs } from "dayjs";
import React, { useRef, useState, useMemo } from "react";
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

export default function DaysCalendarPager({
  baseDate,
  allEvents,
  currentPageIndex,
  setCurrentPageIndex,
  pagerRef,
  viewMode,
}: DaysCalendarPagerProps) {
  const { height } = useWindowDimensions();

  const pageCount = 20; // For day/3-day view
  const initialPage = 10; // Centered around the baseDate

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
    return Array.from({ length: pageCount }, (_, index) => {
      let pageDate;
      if (viewMode === "day") {
        pageDate = baseDate.add(index - initialPage, "day");
      } else {
        // 3days
        pageDate = baseDate.add((index - initialPage) * 3, "day");
      }
      return { key: index, date: pageDate };
    });
  }, [baseDate, pageCount, initialPage, viewMode]);

  const offset =
    viewMode === "day" ? currentPageIndex - initialPage : (currentPageIndex - initialPage) * 3;
  const currentDisplayDate = baseDate.add(offset, "day");
  const endDate =
    viewMode === "day"
      ? currentDisplayDate
      : currentDisplayDate.add(2, "day");

  const cellHeight = 60;
  const containerHeight = height - 220;
  const scrollOffsetMinutes = 480; // 8:00 AM

  const onPageSelected = (event: any) => {
    const position = event.nativeEvent.position;
    setCurrentPageIndex(position);
  };

  const formatDateRange = (startDate: Dayjs, endDate: Dayjs) => {
    if (viewMode === "day") {
      return startDate.format("MMM DD, YYYY");
    }
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
    <>
      <Text style={styles.header}>
        {formatDateRange(currentDisplayDate, endDate)}
      </Text>
      <Text style={styles.subHeader}>
        {viewMode === "day" ? "Day View" : "3 Days View"}
      </Text>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={initialPage}
        onPageSelected={onPageSelected}
      >
        {pages.map((page) => {
          const dateRange: Dayjs[] =
            viewMode === "day"
              ? getDatesInNextOneDay(page.date.toDate())
              : getDatesInNextThreeDaysFixed(page.date.toDate());

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
}

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