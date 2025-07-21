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
  // 添加标志位来跟踪 PagerView 是否已经完成布局
  const isPagerLayoutReady = React.useRef(false);
  // 存储待执行的页面索引
  const pendingPageIndex = React.useRef<number | null>(null);

  // 找到当前选中日期在这一周中的索引
  const selectedIndex = React.useMemo(
    () => weekDates.findIndex((date) => date.isSame(selectedDate, "day")),
    [weekDates, selectedDate]
  );

  // 只在组件首次挂载或weekDates变化时计算 initialPage，避免频繁重复初始化
  const initialPage = React.useMemo(() => {
    const index = weekDates.findIndex((date) =>
      date.isSame(selectedDate, "day")
    );
    return index >= 0 ? index : 0;
  }, [weekDates]); // 只依赖 weekDates，避免因 selectedDate 频繁变化导致的重新初始化

  console.log("selectedIndex", selectedIndex);

  // PagerView 布局完成的回调
  const handlePagerLayout = React.useCallback(() => {
    isPagerLayoutReady.current = true;

    // 如果有待执行的页面索引，使用双重延迟确保稳定性
    if (pendingPageIndex.current !== null && pagerRef.current) {
      const targetIndex = pendingPageIndex.current;
      pendingPageIndex.current = null;

      // 使用 requestAnimationFrame + setTimeout 的组合确保 PagerView 完全稳定
      requestAnimationFrame(() => {
        setTimeout(() => {
          // 再次确认 ref 仍然有效
          if (pagerRef.current) {
            isSettingPageProgrammatically.current = true;
            pagerRef.current.setPageWithoutAnimation(targetIndex);
            console.log(
              "setPage:selectedIndex (after layout + RAF + timeout)",
              targetIndex
            );
          }
        }, 100); // 100ms 延迟确保 PagerView 完全稳定
      });
    }
  }, []);

  // 页面滚动结束时的回调
  const handlePageScrollStateChanged = React.useCallback((e: any) => {
    const state = e.nativeEvent.pageScrollState;
    // 当页面滚动结束时，重置程序化设置标志位
    if (state === "idle") {
      isSettingPageProgrammatically.current = false;
      console.log("Page scroll ended, reset programmatic flag");
    }
  }, []);

  // 当选中日期改变时，切换到对应的页面
  React.useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex !== currentPageIndex.current) {
      if (isPagerLayoutReady.current && pagerRef.current) {
        // PagerView 已经准备好，使用双重延迟确保稳定性
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (pagerRef.current) {
              isSettingPageProgrammatically.current = true;
              pagerRef.current.setPageWithoutAnimation(selectedIndex);
              console.log(
                "setPage:selectedIndex (immediate + RAF + timeout)",
                selectedIndex
              );
            }
          }, 100); // 100ms 延迟确保 PagerView 完全稳定
        });
      } else {
        // PagerView 还没准备好，存储待执行的索引
        pendingPageIndex.current = selectedIndex;
        console.log("setPage:selectedIndex (pending)", selectedIndex);
      }
    }
  }, [selectedIndex]);

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
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
      onDateChange?.(weekDates[newIndex]);
      console.log("handlePageSelected:newIndex", newIndex);
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
        initialPage={initialPage}
        onPageSelected={handlePageSelected}
        onLayout={handlePagerLayout}
        onPageScrollStateChanged={handlePageScrollStateChanged}
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
