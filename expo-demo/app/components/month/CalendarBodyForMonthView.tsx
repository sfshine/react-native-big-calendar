import calendarize from "calendarize";
import * as React from "react";
import {
  type AccessibilityProps,
  LayoutAnimation,
  Platform,
  Text,
  UIManager,
  View,
  type ViewStyle,
} from "react-native";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  CalendarCellStyle,
  CalendarCellTextStyle,
  EventCellStyle,
  EventRenderer,
  HorizontalDirection,
  ICalendarEventBase,
  SIMPLE_DATE_FORMAT,
  WeekNum,
  getWeeksWithAdjacentMonths,
  typedMemo,
  useNow,
} from "react-native-big-calendar";
import { styles } from "./CalendarBodyForMonthView.styles";
import { CalendarEventForMonthView } from "./dayevent/CalendarEventForMonthView";
import { DayEventsListPager } from "./dayevent/DayEventsListPager";
import { BWTouchableOpacity as TouchableOpacity } from "../../BWTouchableOpacity";

dayjs.extend(duration);
dayjs.extend(isoWeek);

interface MemoizedDayEventsProps<T extends ICalendarEventBase> {
  date: dayjs.Dayjs;
  sortedEvents: (date: dayjs.Dayjs) => T[];
  maxVisibleEventCount: number;
  dayOfTheWeek: number;
  calendarWidth: number;
  eventMinHeightForMonthView: number;
  showAdjacentMonths: boolean;
  moreLabel: string;
  onPressMoreLabel?: (events: T[], date: Date) => void;
  onPressEvent?: (event: T) => void;
  renderEvent?: EventRenderer<T>;
  eventCellStyle?: EventCellStyle<T>;
  eventCellAccessibilityProps: AccessibilityProps;
}

function _MemoizedDayEvents<T extends ICalendarEventBase>({
  date,
  sortedEvents,
  maxVisibleEventCount,
  dayOfTheWeek,
  calendarWidth,
  eventMinHeightForMonthView,
  showAdjacentMonths,
  moreLabel,
  onPressMoreLabel,
  onPressEvent,
  renderEvent,
  eventCellStyle,
  eventCellAccessibilityProps,
}: MemoizedDayEventsProps<T>) {
  const dayEvents = sortedEvents(date);
  const eventsToShow = dayEvents.slice(0, maxVisibleEventCount);
  const moreCount = dayEvents.length - maxVisibleEventCount;

  return (
    <React.Fragment>
      {eventsToShow.map((event, index) => (
        <CalendarEventForMonthView
          key={`${index}-${event.start}-${event.title}-${event.end}`}
          event={event}
          eventCellStyle={eventCellStyle}
          eventCellAccessibilityProps={
            eventCellAccessibilityProps as AccessibilityProps
          }
          onPressEvent={onPressEvent}
          renderEvent={renderEvent}
          date={date}
          dayOfTheWeek={dayOfTheWeek}
          calendarWidth={calendarWidth}
          isRTL={false}
          eventMinHeightForMonthView={eventMinHeightForMonthView}
          showAdjacentMonths={showAdjacentMonths}
        />
      ))}
      {moreCount > 0 && (
        <Text
          key={`more-${date.toString()}`}
          style={styles.moreLabelText}
          onPress={() => onPressMoreLabel?.(dayEvents, date.toDate())}
        >
          {moreLabel.replace("{moreCount}", `${moreCount}`)}
        </Text>
      )}
    </React.Fragment>
  );
}

const areEventsEqual = <T extends ICalendarEventBase>(
  prev: Readonly<MemoizedDayEventsProps<T>>,
  next: Readonly<MemoizedDayEventsProps<T>>
) => {
  if (!prev.date.isSame(next.date, "day")) {
    return false;
  }
  return (
    prev.sortedEvents === next.sortedEvents &&
    prev.maxVisibleEventCount === next.maxVisibleEventCount &&
    prev.dayOfTheWeek === next.dayOfTheWeek &&
    prev.calendarWidth === next.calendarWidth &&
    prev.eventMinHeightForMonthView === next.eventMinHeightForMonthView &&
    prev.showAdjacentMonths === next.showAdjacentMonths &&
    prev.moreLabel === next.moreLabel &&
    prev.onPressMoreLabel === next.onPressMoreLabel &&
    prev.onPressEvent === next.onPressEvent &&
    prev.renderEvent === next.renderEvent &&
    prev.eventCellStyle === next.eventCellStyle &&
    Object.is(
      prev.eventCellAccessibilityProps,
      next.eventCellAccessibilityProps
    )
  );
};

const MemoizedDayEvents = React.memo(
  _MemoizedDayEvents,
  areEventsEqual
) as typeof _MemoizedDayEvents;

interface CalendarBodyForMonthViewProps<T extends ICalendarEventBase> {
  targetDate: dayjs.Dayjs;
  events: T[];
  style: ViewStyle;
  eventCellStyle?: EventCellStyle<T>;
  eventCellAccessibilityProps?: AccessibilityProps;
  calendarCellStyle?: CalendarCellStyle;
  calendarCellAccessibilityPropsForMonthView?: AccessibilityProps;
  calendarCellAccessibilityProps?: AccessibilityProps;
  calendarCellTextStyle?: CalendarCellTextStyle;
  hideNowIndicator?: boolean;
  showAdjacentMonths: boolean;
  onLongPressCell?: (date: Date) => void;
  onPressCell?: (date: Date) => void;
  onPressDateHeader?: (date: Date) => void;
  onPressEvent?: (event: T) => void;
  onSwipeHorizontal?: (d: HorizontalDirection) => void;
  renderEvent?: EventRenderer<T>;
  maxVisibleEventCount: number;
  weekStartsOn: WeekNum;
  eventMinHeightForMonthView: number;
  moreLabel: string;
  onPressMoreLabel?: (events: T[], date: Date) => void;
  sortedMonthView: boolean;
  showWeekNumber?: boolean;
  renderCustomDateForMonth?: (date: Date) => React.ReactElement | null;
  disableMonthEventCellPress?: boolean;
  onExpandedStateChange?: (isExpanded: boolean) => void;
  calendarWidth: number;
  calendarBodyHeight: number;
}

function _CalendarBodyForMonthView<T extends ICalendarEventBase>({
  targetDate,
  style,
  onLongPressCell,
  onPressCell,
  onPressDateHeader,
  events,
  onPressEvent,
  eventCellStyle,
  eventCellAccessibilityProps = {},
  calendarCellStyle,
  calendarCellAccessibilityPropsForMonthView = {},
  calendarCellAccessibilityProps = {},
  calendarCellTextStyle,
  hideNowIndicator,
  showAdjacentMonths,
  renderEvent,
  maxVisibleEventCount,
  weekStartsOn,
  eventMinHeightForMonthView,
  moreLabel,
  onPressMoreLabel,
  sortedMonthView,
  showWeekNumber = false,
  renderCustomDateForMonth,
  disableMonthEventCellPress,
  onExpandedStateChange,
  calendarWidth,
  calendarBodyHeight,
}: CalendarBodyForMonthViewProps<T>) {
  const renderCount = React.useRef(0);
  React.useEffect(() => {
    renderCount.current += 1;
    console.log(
      `[Perf] CalendarBodyForMonthView render count: ${renderCount.current}`
    );
  });

  const { now } = useNow(!hideNowIndicator);
  const [selectedDate, setSelectedDate] = React.useState<dayjs.Dayjs | null>(
    null
  );
  const [expandedWeek, setExpandedWeek] = React.useState<number | null>(null);

  const weeksCalculationStart = Date.now();
  const weeks = showAdjacentMonths
    ? getWeeksWithAdjacentMonths(targetDate, weekStartsOn)
    : calendarize(targetDate.toDate(), weekStartsOn);
  console.log(`[Perf] weeks calculation took ${Date.now() - weeksCalculationStart}ms`);

  const calendarCellHeight = calendarBodyHeight / weeks.length;

  const getCalendarCellStyle = React.useMemo(
    () =>
      typeof calendarCellStyle === "function"
        ? calendarCellStyle
        : () => calendarCellStyle,
    [calendarCellStyle]
  );

  const getCalendarCellTextStyle = React.useMemo(
    () =>
      typeof calendarCellTextStyle === "function"
        ? calendarCellTextStyle
        : () => calendarCellTextStyle,
    [calendarCellTextStyle]
  );

  const handleDayPress = (date: dayjs.Dayjs, weekIndex: number) => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true)
      }
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    const start = Date.now();
    if (selectedDate && selectedDate.isSame(date, "day")) {
      console.log("handleDayPress: collapsing");
      setSelectedDate(null);
      setExpandedWeek(null);
      onExpandedStateChange?.(false);
    } else {
      const previouslySelected = !!selectedDate;
      if (previouslySelected) {
        console.log(
          `handleDayPress: switching from week ${expandedWeek} to ${weekIndex}`
        );
      } else {
        console.log(`handleDayPress: expanding week ${weekIndex}`);
      }
      setSelectedDate(date);
      setExpandedWeek(weekIndex);
      onExpandedStateChange?.(true);
    }
    console.log(`handleDayPress took ${Date.now() - start}ms`);
  };

  const handleDateChange = (newDate: dayjs.Dayjs) => {
    if (!newDate.isSame(selectedDate, "day")) {
      setSelectedDate(newDate);
    }
  };

  // 计算展开周的所有日期
  const weekDates = React.useMemo(() => {
    if (expandedWeek === null) return [];

    const week = weeks[expandedWeek];
    if (showAdjacentMonths) {
      // 处理相邻月份的日期
      return week.map((d) => {
        if (d <= 0) {
          // 前一个月的日期
          return targetDate.add(-1, "month").endOf("month").add(d, "day");
        } else if (d > targetDate.daysInMonth()) {
          // 下一个月的日期
          return targetDate.add(1, "month").date(d - targetDate.daysInMonth());
        } else {
          // 当前月的日期
          return targetDate.date(d);
        }
      });
    } else {
      // 不显示相邻月份时，只显示当前月份的日期
      return week
        .map((d) =>
          d > 0 && d <= targetDate.daysInMonth() ? targetDate.date(d) : null
        )
        .filter((date): date is dayjs.Dayjs => date !== null);
    }
  }, [expandedWeek, weeks, targetDate, showAdjacentMonths]);

  const eventsInMonth = React.useMemo(() => {
    const eventsInMonthCalculationStart = Date.now();
    const map = new Map<string, T[]>();

    // Define the visible date range
    const startDate = showAdjacentMonths
      ? targetDate.startOf('month').startOf('week')
      : targetDate.startOf('month');
    const endDate = showAdjacentMonths
      ? targetDate.endOf('month').endOf('week')
      : targetDate.endOf('month');

    // Filter events that fall within the visible date range
    const filteredEvents = events.filter(
      (event) =>
        dayjs(event.start).isBefore(endDate) &&
        dayjs(event.end).isAfter(startDate)
    );

    // Initialize map with all days in the calendar view
    for (const week of weeks) {
      for (const day of week) {
        if (day === 0) {
          continue;
        }
        // TODO: This date calculation might be incorrect for adjacent months.
        const date = targetDate.date(day);
        const dayStr = date.format(SIMPLE_DATE_FORMAT);
        if (!map.has(dayStr)) {
          map.set(dayStr, []);
        }
      }
    }

    // Iterate through the filtered events and add them to the map
    for (const event of filteredEvents) {
      const start = dayjs(event.start);
      const end = dayjs(event.end);

      // Iterate from start to end date of the event
      let current = start.startOf("day");
      while (current.isBefore(end)) {
        const dayStr = current.format(SIMPLE_DATE_FORMAT);
        if (map.has(dayStr)) {
          map.get(dayStr)?.push(event);
        }
        current = current.add(1, "day");
      }
    }
    console.log(
      `[Perf] eventsInMonth calculation took ${
        Date.now() - eventsInMonthCalculationStart
      }ms`
    );
    return map;
  }, [events, targetDate, weeks, showAdjacentMonths]);

  const sortedEvents = React.useCallback(
    (day: dayjs.Dayjs) => {
      const sortedEventsStart = Date.now();
      if (!sortedMonthView) {
        const result = eventsInMonth.get(day.format(SIMPLE_DATE_FORMAT)) || [];
        console.log(`[Perf] sortedEvents (unsorted) for ${day.format(SIMPLE_DATE_FORMAT)} took ${Date.now() - sortedEventsStart}ms`);
        return result;
      }

      /**
       * Better way to sort overlapping events that spans accross multiple days
       * For example, if you want following events
       * Event 1, start = 01/01 12:00, end = 02/01 12:00
       * Event 2, start = 02/01 12:00, end = 03/01 12:00
       * Event 3, start = 03/01 12:00, end = 04/01 12:00
       *
       * When drawing calendar in month view, event 3 should be placed at 3rd index for 03/01, because Event 2 are placed at 2nd index for 02/01 and 03/01
       *
       */
      let min = day.startOf("day");
      const max = day.endOf("day");

      //filter all events that starts from the current week until the current day, and sort them by reverse starting time
      let filteredEvents = (
        eventsInMonth.get(day.format(SIMPLE_DATE_FORMAT)) || []
      )
        .filter(
          ({ start, end }) =>
            dayjs(end).isAfter(day.startOf("week")) &&
            dayjs(start).isBefore(max)
        )
        .sort((a, b) => {
          if (dayjs(a.start).isSame(b.start, "day")) {
            const aDuration = dayjs
              .duration(dayjs(a.end).diff(dayjs(a.start)))
              .days();
            const bDuration = dayjs
              .duration(dayjs(b.end).diff(dayjs(b.start)))
              .days();
            return aDuration - bDuration;
          }
          return b.start.getTime() - a.start.getTime();
        });

      /**
       * find the most relevant min date to filter the events
       * in the example:
       * 1. when rendering for 01/01, min date will be 01/01 (start of day for event 1)
       * 2. when rendering for 02/01, min date will be 01/01 (start of day for event 1)
       * 3. when rendering for 03/01, min date will be 01/01 (start of day for event 1)
       * 4. when rendering for 04/01, min date will be 01/01 (start of day for event 1)
       * 5. when rendering for 05/01, min date will be 05/01 (no event overlaps with 05/01)
       */
      for (const { start, end } of filteredEvents) {
        if (dayjs(end).isAfter(min) && dayjs(start).isBefore(min)) {
          min = dayjs(start).startOf("day");
        }
      }

      filteredEvents = filteredEvents
        .filter(
          ({ start, end }) =>
            dayjs(end).endOf("day").isAfter(min) && dayjs(start).isBefore(max)
        )
        .reverse();
      /**
       * We move eligible event to the top
       * For example, when rendering for 03/01, Event 3 should be moved to the top, since there is a gap left by Event 1
       */
      const finalEvents: T[] = [];
      let tmpDay: dayjs.Dayjs = day.startOf("week");
      //re-sort events from the start of week until the calendar cell date
      //optimize sorting of event nodes and make sure that no empty gaps are left on top of calendar cell
      while (!tmpDay.isAfter(day)) {
        for (const event of filteredEvents) {
          if (dayjs(event.end).isBefore(tmpDay.startOf("day"))) {
            const eventToMoveUp = filteredEvents.find((e) =>
              dayjs(e.start).startOf("day").isSame(tmpDay.startOf("day"))
            );
            if (eventToMoveUp !== undefined) {
              //remove eventToMoveUp from finalEvents first
              if (finalEvents.indexOf(eventToMoveUp) > -1) {
                finalEvents.splice(finalEvents.indexOf(eventToMoveUp), 1);
              }

              if (finalEvents.indexOf(event) > -1) {
                finalEvents.splice(
                  finalEvents.indexOf(event),
                  1,
                  eventToMoveUp
                );
              } else {
                finalEvents.push(eventToMoveUp);
              }
            }
          } else if (finalEvents.indexOf(event) === -1) {
            finalEvents.push(event);
          }
        }

        tmpDay = tmpDay.add(1, "day");
      }

      console.log(`[Perf] sortedEvents (sorted) for ${day.format(SIMPLE_DATE_FORMAT)} took ${Date.now() - sortedEventsStart}ms`);
      return finalEvents;
    },
    [eventsInMonth, sortedMonthView]
  );

  const renderDateCell = (date: dayjs.Dayjs | null, index: number) => {
    if (date && renderCustomDateForMonth) {
      return renderCustomDateForMonth(date.toDate());
    }

    return (
      <Text
        style={[
          styles.dateCellText,
          {
            color:
              date?.format(SIMPLE_DATE_FORMAT) ===
              now.format(SIMPLE_DATE_FORMAT)
                ? "#007AFF"
                : date?.month() !== targetDate.month()
                ? "#9E9E9E"
                : "#212121",
          },
          getCalendarCellTextStyle(date?.toDate(), index),
        ]}
      >
        {date?.format("D")}
      </Text>
    );
  };

  const renderWeekRow = (week: (number | 0)[], i: number) => {
    const renderWeekRowStart = Date.now();
    const jsx = (
      <View
        style={[
          styles.weekRow,
          Platform.OS === "android" && style, // TODO: in Android, backgroundColor is not applied to child components
          { backgroundColor: "red" },
          { height: calendarCellHeight },
        ]}
      >
        {showWeekNumber ? (
          <View
            style={[styles.weekNumberContainer, i > 0 && { borderTopWidth: 1 }]}
            key={"weekNumber"}
            {...calendarCellAccessibilityProps}
          >
            <Text style={styles.weekNumberText}>
              {week.length > 0
                ? targetDate
                    .date(week[0])
                    .startOf("week")
                    .add(4, "days")
                    .isoWeek()
                : ""}
            </Text>
          </View>
        ) : null}
        {week
          .map((d) =>
            showAdjacentMonths
              ? targetDate.date(d)
              : d > 0
              ? targetDate.date(d)
              : null
          )
          .map((date, ii) => {
            const isCellSelected =
              selectedDate && date && selectedDate.isSame(date, "day");
            return (
              <TouchableOpacity
                onLongPress={() =>
                  date && onLongPressCell && onLongPressCell(date.toDate())
                }
                onPress={() => date && handleDayPress(date, i)}
                style={[
                  styles.dateCell,
                  i > 0 && { borderTopWidth: 1 },
                  (ii > 0 || showWeekNumber) && { borderLeftWidth: 1 },
                  getCalendarCellStyle(date?.toDate(), i),
                  isCellSelected && { backgroundColor: "rgba(0,0,0,0.1)" },
                ]}
                key={`${ii}-${date?.toDate()}`}
                {...calendarCellAccessibilityPropsForMonthView}
              >
                <React.Fragment>
                  <View>{renderDateCell(date, i)}</View>
                  {
                    //Calendar body will re-render after calendarWidth/calendarCellHeight is set from layout event, prevent expensive operation during first render
                    calendarWidth > 0 &&
                      (!disableMonthEventCellPress ||
                        calendarCellHeight > 0) &&
                      date && (
                        <MemoizedDayEvents
                          date={date}
                          sortedEvents={sortedEvents}
                          maxVisibleEventCount={maxVisibleEventCount}
                          dayOfTheWeek={ii}
                          calendarWidth={calendarWidth}
                          eventMinHeightForMonthView={
                            eventMinHeightForMonthView
                          }
                          showAdjacentMonths={showAdjacentMonths}
                          moreLabel={moreLabel}
                          onPressMoreLabel={onPressMoreLabel}
                          onPressEvent={onPressEvent}
                          renderEvent={renderEvent}
                          eventCellStyle={eventCellStyle}
                          eventCellAccessibilityProps={
                            eventCellAccessibilityProps
                          }
                        />
                      )
                  }
                </React.Fragment>
                {isCellSelected ? (
                  <View style={styles.collapseContainer}>
                    <Text style={styles.collapseText}>收起</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
      </View>
    );
    console.log(`[Perf] renderWeekRow ${i} took ${Date.now() - renderWeekRowStart}ms`);
    return jsx;
  };

  const renderStart = Date.now();
  const result = (
    <View style={[styles.container, style, { height: calendarBodyHeight }]}>
      {(() => {
        const generationStart = Date.now();
        if (expandedWeek === null) {
          console.log("Rendering collapsed view with all weeks.");
          const weeksJsx = weeks.map((week, i) => (
            <React.Fragment key={`${i}-${week.join("-")}`}>
              {renderWeekRow(week, i)}
            </React.Fragment>
          ));
          console.log(`Finished generating JSX for collapsed view. Took ${Date.now() - generationStart}ms`);
          return weeksJsx;
        }

        console.log(`Rendering expanded view for week ${expandedWeek}.`);
        const elements = [];
        elements.push(
          <React.Fragment
            key={`${expandedWeek}-${weeks[expandedWeek].join("-")}`}
          >
            {renderWeekRow(weeks[expandedWeek], expandedWeek)}
          </React.Fragment>
        );

        if (selectedDate && weekDates.length > 0) {
          const isLastWeek = expandedWeek === weeks.length - 1;
          const eventListHeight = isLastWeek
            ? calendarCellHeight * (weeks.length - 1)
            : calendarCellHeight * (weeks.length - 2);
          elements.push(
            <DayEventsListPager
              key={weekDates.map((d) => d.format("YYYY-MM-DD")).join("-")}
              events={events}
              selectedDate={selectedDate}
              weekDates={weekDates}
              onPressEvent={onPressEvent}
              onDateChange={handleDateChange}
              style={{ height: eventListHeight }}
            />
          );
        }

        if (expandedWeek < weeks.length - 1) {
          elements.push(
            <React.Fragment
              key={`${expandedWeek + 1}-${weeks[expandedWeek + 1].join("-")}`}
            >
              {renderWeekRow(weeks[expandedWeek + 1], expandedWeek + 1)}
            </React.Fragment>
          );
        }
        console.log(`Finished generating JSX for expanded view. Took ${Date.now() - generationStart}ms`);
        return elements;
      })()}
    </View>
  );
  console.log(`[Perf] CalendarBodyForMonthView render took ${Date.now() - renderStart}ms`);
  return result;
}

export const CalendarBodyForMonthView = typedMemo(_CalendarBodyForMonthView);
