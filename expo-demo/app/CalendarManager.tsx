import { Ionicons } from "@expo/vector-icons";
import dayjs, { Dayjs } from "dayjs";
import React, { useMemo, useRef, useState } from "react";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  CalendarBody,
  CalendarBodyForMonthView,
  CalendarHeader,
  defaultTheme,
  ICalendarEventBase,
  Schedule,
  ThemeContext,
} from "react-native-big-calendar";
import PagerView from "react-native-pager-view";
import { events as eventList } from "../events";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BWTouchableOpacity } from "./BWTouchableOpacity";

// Dummy events, can be shared
const DUMMY_EVENTS: ICalendarEventBase[] = [
  {
    title: "Morning Meeting",
    start: dayjs().set("hour", 9).set("minute", 0).toDate(),
    end: dayjs().set("hour", 10).set("minute", 30).toDate(),
  },
  {
    title: "Meeting",
    start: dayjs().set("date", 10).set("hour", 10).toDate(),
    end: dayjs().set("date", 10).set("hour", 12).toDate(),
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
  {
    title: "Project Deadline",
    start: dayjs().set("date", 20).set("hour", 9).toDate(),
    end: dayjs().set("date", 22).set("hour", 17).toDate(),
  },
];

const allEvents = [...DUMMY_EVENTS, ...eventList];

type ViewMode = "day" | "3days" | "month" | "schedule";

// A helper function for day view
const getDatesInNextOneDay = (date: Date): Dayjs[] => {
  return [dayjs(date)];
};

const getDatesInNextThreeDaysFixed = (date: Date): Dayjs[] => {
  const day = dayjs(date);
  return [day, day.add(1, "day"), day.add(2, "day")];
};

export default function CalendarManager() {
  const { height, width } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>("schedule");
  const [menuVisible, setMenuVisible] = useState(true);
  const [baseDate] = useState(dayjs());
  const [currentPageIndex, setCurrentPageIndex] = useState(10);
  const pagerRef = useRef<PagerView>(null);

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
    []
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
    []
  );

  const onPageSelected = (event: any) => {
    const position = event.nativeEvent.position;
    setCurrentPageIndex(position);
  };

  const switchViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setMenuVisible(false);
    // Reset pager to initial page when view mode changes to avoid index out of bounds
    if (mode !== "schedule") {
      const initialPage = mode === "month" ? 6 : 10;
      setCurrentPageIndex(initialPage);
      pagerRef.current?.setPage(initialPage);
    }
  };

  const renderMenuView = () => (
    <Modal
      transparent={true}
      visible={menuVisible}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
    >
      <BWTouchableOpacity
        style={styles.modalOverlay}
        onPress={() => setMenuVisible(false)}
      >
        <GestureHandlerRootView
          style={[styles.menuContainer, { width: width * 0.6 }]}
        >
          <BWTouchableOpacity
            style={styles.menuItem}
            onPress={() => switchViewMode("day")}
          >
            <Text>Day</Text>
          </BWTouchableOpacity>
          <BWTouchableOpacity
            style={styles.menuItem}
            onPress={() => switchViewMode("3days")}
          >
            <Text>3 Days</Text>
          </BWTouchableOpacity>
          <BWTouchableOpacity
            style={styles.menuItem}
            onPress={() => switchViewMode("month")}
          >
            <Text>Month</Text>
          </BWTouchableOpacity>
          <BWTouchableOpacity
            style={styles.menuItem}
            onPress={() => switchViewMode("schedule")}
          >
            <Text>Schedule</Text>
          </BWTouchableOpacity>
        </GestureHandlerRootView>
      </BWTouchableOpacity>
    </Modal>
  );

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

  const renderCalendar = () => {
    if (viewMode === "schedule") {
      return (
        <Schedule
          events={allEvents}
          style={{ flex: 1 }}
          locale="en"
          ampm={false}
          showTime={true}
          //Dummy props
          cellHeight={60}
          containerHeight={height - 100}
          dateRange={[dayjs().subtract(1, "week"), dayjs().add(1, "week")]}
          scrollOffsetMinutes={0}
        />
      );
    }

    const pageCount = viewMode === "month" ? 12 : 20;
    const initialPage = viewMode === "month" ? 6 : 10;

    const pages = Array.from({ length: pageCount }, (_, index) => {
      let pageDate;
      if (viewMode === "day") {
        pageDate = baseDate.add(index - initialPage, "day");
      } else if (viewMode === "3days") {
        pageDate = baseDate.add((index - initialPage) * 3, "day");
      } else {
        // month
        pageDate = baseDate.add(index - initialPage, "month");
      }
      return { key: index, date: pageDate };
    });

    if (viewMode === "month") {
      const currentDisplayDate = baseDate.add(currentPageIndex - 6, "month");
      return (
        <>
          <Text style={styles.header}>
            {currentDisplayDate.format("MMMM YYYY")}
          </Text>
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={6}
            onPageSelected={onPageSelected}
          >
            {pages.map((page) => (
              <View key={page.key} style={styles.pageContainer}>
                <CalendarBodyForMonthView
                  containerHeight={height - 180}
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
            ))}
          </PagerView>
        </>
      );
    }

    const offset =
      viewMode === "day" ? currentPageIndex - 10 : (currentPageIndex - 10) * 3;
    const currentDisplayDate = baseDate.add(offset, "day");
    const endDate =
      viewMode === "day"
        ? currentDisplayDate
        : currentDisplayDate.add(2, "day");

    const cellHeight = 60;
    const containerHeight = height - 220;
    const scrollOffsetMinutes = 480; // 8:00 AM

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
          initialPage={10}
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
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ThemeContext.Provider value={defaultTheme}>
          <View style={styles.topHeader}>
            <View style={{ width: 50 }} />
            <Text style={styles.title}>Calendar</Text>
            <BWTouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.menuButton}
            >
              <Ionicons name="menu" size={32} color="black" />
            </BWTouchableOpacity>
          </View>
          {renderCalendar()}
          {renderMenuView()}
        </ThemeContext.Provider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  menuButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  menuContainer: {
    backgroundColor: "white",
    height: "100%",
    paddingTop: 50,
  },
  menuItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
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
