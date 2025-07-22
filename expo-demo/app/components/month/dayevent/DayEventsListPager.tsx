import * as React from "react";
import { FlatList, Text, View, type ViewStyle } from "react-native";
import PagerView from "react-native-pager-view";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ICalendarEventBase } from "react-native-big-calendar";
import { styles } from "./DayEventsList.styles";

dayjs.extend(isBetween);

interface DayEventsListPagerProps<T extends ICalendarEventBase> {
  events: T[];
  selectedDate: dayjs.Dayjs;
  weekDates: dayjs.Dayjs[]; // 这一周的所有日期
  onPressEvent?: (event: T) => void;
  onDateChange?: (date: dayjs.Dayjs) => void; // 当滑动改变日期时的回调
  style?: ViewStyle;
}

export function DayEventsListPager<T extends ICalendarEventBase>({
  events,
  selectedDate,
  weekDates,
  onPressEvent,
  onDateChange,
  style,
}: DayEventsListPagerProps<T>) {
  const pagerRef = React.useRef<PagerView>(null);
  const currentPageIndex = React.useRef<number | null>(null);
  // 添加标志位来防止程序化页面切换时触发不必要的回调
  const isSettingPageProgrammatically = React.useRef(false);
  // 添加初始化完成标志位
  const isInitialized = React.useRef(false);
  const initializationTimer = React.useRef<NodeJS.Timeout | null>(null);

  // 找到当前选中日期在这一周中的索引
  const selectedIndex = React.useMemo(
    () => {
      const index = weekDates.findIndex((date) => date.isSame(selectedDate, "day"));
      console.log("🔍 weekDates:", weekDates.map(d => d.format("YYYY-MM-DD")));
      console.log("🔍 looking for selectedDate:", selectedDate.format("YYYY-MM-DD"));
      console.log("🔍 calculated selectedIndex:", index);
      return index;
    },
    [weekDates, selectedDate]
  );

  // 初始化完成后设置标志位
  React.useEffect(() => {
    // 清除之前的定时器
    if (initializationTimer.current) {
      clearTimeout(initializationTimer.current);
    }
    
    isInitialized.current = false;
    console.log("🏁 Starting initialization...");
    
    // 给 PagerView 一些时间完成初始化
    initializationTimer.current = setTimeout(() => {
      isInitialized.current = true;
      // 初始化完成后，确保 currentPageIndex 与 selectedIndex 同步
      if (selectedIndex >= 0) {
        currentPageIndex.current = selectedIndex;
        console.log("✅ Initialization complete, currentPageIndex synced to:", selectedIndex);
        
        // 强制 PagerView 跳转到正确的页面
        if (pagerRef.current) {
          console.log("🔧 Force setting PagerView to correct page:", selectedIndex);
          isSettingPageProgrammatically.current = true;
          pagerRef.current.setPageWithoutAnimation(selectedIndex);
          setTimeout(() => {
            isSettingPageProgrammatically.current = false;
            console.log("🔧 Force page setting complete");
          }, 100);
        }
      }
      console.log("✅ Initialization complete, enabling page selection handling");
    }, 500); // 500ms 应该足够 PagerView 完成初始化

    return () => {
      if (initializationTimer.current) {
        clearTimeout(initializationTimer.current);
      }
    };
  }, [weekDates, selectedIndex]); // 依赖 selectedIndex 以确保正确同步

  // 初始化 currentPageIndex
  React.useEffect(() => {
    if (selectedIndex >= 0 && currentPageIndex.current === null) {
      currentPageIndex.current = selectedIndex;
      console.log("🎯 Initialize currentPageIndex to:", selectedIndex);
    }
  }, [selectedIndex]);

  // 当 weekDates 变化时，重置 currentPageIndex
  React.useEffect(() => {
    if (selectedIndex >= 0) {
      currentPageIndex.current = selectedIndex;
      console.log("🔄 Reset currentPageIndex to:", selectedIndex, "due to weekDates change");
    }
  }, [weekDates, selectedIndex]);

  console.log("selectedDate = ", selectedDate);
  console.log("selectedIndex = ", selectedIndex);
  console.log("🚀 PagerView initialPage will be:", selectedIndex >= 0 ? selectedIndex : 0);

  // 当选中日期改变时，切换到对应的页面
  React.useEffect(() => {
    console.log(
      "useEffect:selectedIndex = ",
      selectedIndex,
      "currentPageIndex = ",
      currentPageIndex.current
    );
    // 只有当 selectedIndex 有效且与当前页面不同时才切换
    if (selectedIndex >= 0 && selectedIndex !== currentPageIndex.current && pagerRef.current) {
      // 使用 requestAnimationFrame 确保在下一个渲染周期执行, 避免 iOS 展开下周日程列表时不显示问题
      requestAnimationFrame(() => {
        if (pagerRef.current && selectedIndex !== currentPageIndex.current) {
          console.log("🔧 Setting page programmatically to:", selectedIndex);
          isSettingPageProgrammatically.current = true;
          pagerRef.current.setPageWithoutAnimation(selectedIndex);
          setTimeout(() => {
            isSettingPageProgrammatically.current = false;
            console.log("🔧 Programmatic setting complete");
          }, 100);
          console.log("setPageWithoutAnimation:selectedIndex", selectedIndex);
        }
      });
    }
  }, [selectedIndex]);

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;

    console.log("📄 handlePageSelected called with newIndex:", newIndex);
    console.log("📄 isInitialized:", isInitialized.current);
    console.log("📄 isSettingPageProgrammatically:", isSettingPageProgrammatically.current);
    console.log("📄 weekDates length:", weekDates.length);
    console.log("📄 current selectedDate:", selectedDate.format("YYYY-MM-DD"));

    // 如果还在初始化期间，忽略所有页面切换
    if (!isInitialized.current) {
      console.log("⚠️ Ignoring page selection during initialization");
      return;
    }

    // 更新当前页面索引
    currentPageIndex.current = newIndex;

    // 如果是程序化设置页面，则不触发日期变化回调
    if (isSettingPageProgrammatically.current) {
      console.log(
        "handlePageSelected: ignoring programmatic page change",
        newIndex
      );
      return;
    }

    if (
      newIndex >= 0 &&
      newIndex < weekDates.length &&
      !weekDates[newIndex].isSame(selectedDate)
    ) {
      console.log("📄 Triggering date change to:", weekDates[newIndex].format("YYYY-MM-DD"));
      onDateChange?.(weekDates[newIndex]);
      console.log("handlePageSelected:newIndex", newIndex);
    } else {
      console.log("📄 No date change needed - same date or invalid index");
    }
  };

  const renderDayEvents = (date: dayjs.Dayjs) => {
    const dayEvents = events.filter(({ start, end }) =>
      date.isBetween(
        dayjs(start).startOf("day"),
        dayjs(end).endOf("day"),
        null,
        "[)"
      )
    );

    const renderItem = ({ item }: { item: T }) => (
      <View style={styles.eventItem}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventTime}>
          {dayjs(item.start).format("HH:mm")} -{" "}
          {dayjs(item.end).format("HH:mm")}
        </Text>
      </View>
    );

    return (
      <View style={{ flex: 1, backgroundColor: "yellow" }}>
        {dayEvents.length > 0 ? (
          <FlatList
            data={dayEvents}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.start}-${item.title}`}
            style={styles.flatList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noEvents}>
            <Text style={styles.noEventsText}>No Events</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[style, { backgroundColor: "green" }]}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={selectedIndex >= 0 ? selectedIndex : 0}
        onPageSelected={handlePageSelected}
      >
        {weekDates.map((date, index) => (
          <View key={date.format("YYYY-MM-DD")} style={{ flex: 1 }}>
            {renderDayEvents(date)}
          </View>
        ))}
      </PagerView>
    </View>
  );
}
