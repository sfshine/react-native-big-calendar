import { Ionicons } from "@expo/vector-icons";
import dayjs, { Dayjs } from "dayjs";
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Platform,
} from "react-native";

declare global {
  var nativeFabricUIManager: any;
}
import {
  defaultTheme,
  ICalendarEventBase,
  Schedule,
  ThemeContext,
} from "react-native-big-calendar";
import { events as eventList } from "../events";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BWTouchableOpacity } from "./BWTouchableOpacity";
import MonthCalendarPager from "./components/month/MonthCalendarPager";
import DaysCalendarPager from "./components/days/DaysCalendarPager";
import { fail } from "node:assert";

// Dummy events, can be shared
const DUMMY_EVENTS: ICalendarEventBase[] = [
  {
    title: "1Morning Meeting",
    start: dayjs().set("hour", 9).set("minute", 0).toDate(),
    end: dayjs().set("hour", 10).set("minute", 30).toDate(),
  },
  {
    title: "2Meeting",
    start: dayjs().set("date", 10).set("hour", 10).toDate(),
    end: dayjs().set("date", 10).set("hour", 12).toDate(),
  },
  {
    title: "3Lunch Break",
    start: dayjs().add(1, "day").set("hour", 12).set("minute", 0).toDate(),
    end: dayjs().add(1, "day").set("hour", 13).set("minute", 0).toDate(),
  },
  {
    title: "4Team Standup",
    start: dayjs().add(2, "day").set("hour", 15).set("minute", 0).toDate(),
    end: dayjs().add(2, "day").set("hour", 15).set("minute", 30).toDate(),
  },
  {
    title: "5All Day Event",
    start: dayjs().add(1, "day").startOf("day").toDate(),
    end: dayjs().add(1, "day").endOf("day").toDate(),
  },
  {
    title: "6Multi-day Event",
    start: dayjs().add(-10, "day").set("hour", 14).toDate(),
    end: dayjs().add(2, "day").set("hour", 16).toDate(),
  },
  {
    title: "7FProject Deadline",
    start: dayjs().set("date", 20).set("hour", 9).toDate(),
    end: dayjs().set("date", 22).set("hour", 17).toDate(),
  },
];

const allEvents = [...DUMMY_EVENTS, ...eventList];

type ViewMode = "day" | "3days" | "month" | "schedule";

export default function CalendarManager() {
  const { height, width } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [menuVisible, setMenuVisible] = useState(false);
  const [baseDate] = useState(dayjs());
  const [currentPageIndex, setCurrentPageIndex] = useState(10);
  const pagerRef = useRef(null);

  useEffect(() => {
    const isFabricEnabled = !!global.nativeFabricUIManager;
    console.log(
      "Is Fabric Enabled (via global.nativeFabricUIManager):",
      isFabricEnabled
    );
    console.log("React Native Version:", Platform.constants.reactNativeVersion);
  }, []);

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
      // pagerRef.current?.setPage(initialPage); // This line will be handled by the child components
    }
  };

  const renderMenuView = () => (
    <Modal
      transparent={true}
      visible={menuVisible}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
    >
      <GestureHandlerRootView>
        <BWTouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuContainer, { width: width * 0.6 }]}>
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
          </View>
        </BWTouchableOpacity>
      </GestureHandlerRootView>
    </Modal>
  );

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

    if (viewMode === "month") {
      return (
        <MonthCalendarPager
          baseDate={baseDate}
          allEvents={allEvents}
          currentPageIndex={currentPageIndex}
          setCurrentPageIndex={setCurrentPageIndex}
          pagerRef={pagerRef}
        />
      );
    }

    return (
      <DaysCalendarPager
        baseDate={baseDate}
        allEvents={allEvents}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndex={setCurrentPageIndex}
        pagerRef={pagerRef}
        viewMode={viewMode as "day" | "3days"}
      />
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
});
