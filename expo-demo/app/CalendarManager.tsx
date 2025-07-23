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
  // 根据默认视图模式设置正确的初始页面索引
  const [currentPageIndex, setCurrentPageIndex] = useState(() => {
    // 月视图初始页面是6，日/3日视图初始页面是100
    return 6; // 默认是月视图
  });
  // 添加currentDate状态来跟踪当前实际显示的日期
  const [currentDate, setCurrentDate] = useState(() => {
    // 根据默认视图模式计算初始日期
    return dayjs(); // 月视图显示当前月
  });
  const pagerRef = useRef(null);

  useEffect(() => {
    const isFabricEnabled = !!global.nativeFabricUIManager;
    console.log(
      "Is Fabric Enabled (via global.nativeFabricUIManager):",
      isFabricEnabled
    );
    console.log("React Native Version:", Platform.constants.reactNativeVersion);
  }, []);

  // 根据当前视图模式和页面索引计算实际显示的日期
  const calculateCurrentDate = (mode: ViewMode, pageIndex: number): Dayjs => {
    if (mode === "schedule") {
      return dayjs();
    }

    if (mode === "month") {
      const monthInitialPage = 6;
      return baseDate.add(pageIndex - monthInitialPage, "month");
    }

    // day 和 3days 模式
    const dayInitialPage = 100;
    
    if (mode === "day") {
      return baseDate.add(pageIndex - dayInitialPage, "day");
    } else {
      // 3days - 返回第一天的日期
      return baseDate.add((pageIndex - dayInitialPage) * 3, "day");
    }
  };

  // 更新currentDate当页面索引变化时
  useEffect(() => {
    const newCurrentDate = calculateCurrentDate(viewMode, currentPageIndex);
    setCurrentDate(newCurrentDate);
  }, [viewMode, currentPageIndex, baseDate]);

  // 计算当前视图显示的月份
  const currentDisplayMonth = useMemo(() => {
    const displayMonth = currentDate.format("YYYY年MM月");
    
    if (viewMode === "schedule") {
      return displayMonth;
    }

    if (viewMode === "month") {
      return displayMonth;
    }

    // day 和 3days 模式 - 显示当前日期所在的月份
    return displayMonth;
  }, [viewMode, currentDate]);

  const onPageSelected = (event: any) => {
    const position = event.nativeEvent.position;
    setCurrentPageIndex(position);
  };

  // 根据目标日期和视图模式计算应该跳转到的页面索引
  const calculatePageIndexForDate = (targetDate: Dayjs, mode: ViewMode): number => {
    if (mode === "month") {
      const monthInitialPage = 6;
      // 使用月份开始时间来计算差异，确保正确的月份计算
      const targetMonth = targetDate.startOf('month');
      const baseMonth = baseDate.startOf('month');
      const monthDiff = targetMonth.diff(baseMonth, "month");
      const pageIndex = monthInitialPage + monthDiff;
      console.log('[CalendarManager] Month page calculation:', {
        targetDate: targetDate.format('YYYY-MM-DD'),
        targetMonth: targetMonth.format('YYYY-MM-DD'),
        baseMonth: baseMonth.format('YYYY-MM-DD'),
        monthDiff,
        pageIndex
      });
      // 确保月视图页面索引在合理范围内 (0-99)
      return Math.max(0, Math.min(99, pageIndex));
    }

    // day 和 3days 模式
    const dayInitialPage = 100;
    
    if (mode === "day") {
      const dayDiff = targetDate.diff(baseDate, "day");
      const pageIndex = dayInitialPage + dayDiff;
      // 确保日视图页面索引在合理范围内 (0-199)
      return Math.max(0, Math.min(199, pageIndex));
    } else {
      // 3days - 计算三天组的索引
      const dayDiff = targetDate.diff(baseDate, "day");
      const groupIndex = Math.floor(dayDiff / 3);
      const pageIndex = dayInitialPage + groupIndex;
      // 确保3日视图页面索引在合理范围内 (0-199)
      return Math.max(0, Math.min(199, pageIndex));
    }
  };

  const switchViewMode = (mode: ViewMode) => {
    const previousMode = viewMode;
    let targetDate = currentDate;

    // 根据视图切换逻辑计算目标日期
    if (mode === "schedule") {
      // 日程视图被动展示，保持当前日期
      targetDate = currentDate;
    } else if (previousMode === "month" && (mode === "day" || mode === "3days")) {
      // 从月视图切换到日/3日视图：
      // 如果今天在当前显示的月份内，就显示今天，否则显示当前月的第一天
      const today = dayjs();
      const currentMonth = currentDate;
      
      if (today.month() === currentMonth.month() && today.year() === currentMonth.year()) {
        targetDate = today;
      } else {
        targetDate = currentMonth.startOf("month");
      }
    } else if ((previousMode === "day" || previousMode === "3days") && mode === "month") {
      // 从日/3日视图切换到月视图：显示当前日期所在的月
      targetDate = currentDate.startOf("month");
    } else if (previousMode === "day" && mode === "3days") {
      // 从日视图切换到3日视图：当前日期作为3日视图的第一天
      targetDate = currentDate;
    } else if (previousMode === "3days" && mode === "day") {
      // 从3日视图切换到日视图：使用3日视图的第一天
      targetDate = currentDate;
    } else if (previousMode === "schedule") {
      // 从日程视图切换到其他视图：根据目标视图类型设置合适的日期
      if (mode === "month") {
        targetDate = currentDate.startOf("month");
      } else {
        // day 或 3days：使用当前日期
        targetDate = currentDate;
      }
    } else {
      // 其他情况保持当前日期
      targetDate = currentDate;
    }

    setViewMode(mode);
    setMenuVisible(false);

    // 如果不是schedule视图，计算并设置正确的页面索引
    if (mode !== "schedule") {
      const newPageIndex = calculatePageIndexForDate(targetDate, mode);
      console.log('[CalendarManager] Switching to', mode, 'with targetDate:', targetDate.format('YYYY-MM-DD'), 'pageIndex:', newPageIndex);
      
      setCurrentPageIndex(newPageIndex);
      setCurrentDate(targetDate);
    } else {
      setCurrentDate(targetDate);
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
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Calendar</Text>
              <Text style={styles.monthText}>{currentDisplayMonth}</Text>
            </View>
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
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  monthText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
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
