import calendarize from "calendarize";
import * as React from "react";
import {
  type AccessibilityProps,
  FlatList,
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  type ViewStyle,
} from "react-native";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
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
import { CalendarEventForMonthView } from "./CalendarEventForMonthView";

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(isoWeek);

interface CalendarBodyForMonthViewProps<T extends ICalendarEventBase> {
  containerHeight: number;
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
}

function _CalendarBodyForMonthView<T extends ICalendarEventBase>({
  containerHeight,
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
}: CalendarBodyForMonthViewProps<T>) {
  const { now } = useNow(!hideNowIndicator);
  const [calendarWidth, setCalendarWidth] = React.useState<number>(0);
  const [calendarCellHeight, setCalendarCellHeight] = React.useState<number>(0);
  const [selectedDate, setSelectedDate] = React.useState<dayjs.Dayjs | null>(
    null
  );
  const [expandedWeek, setExpandedWeek] = React.useState<number | null>(null);

  const weeks = showAdjacentMonths
    ? getWeeksWithAdjacentMonths(targetDate, weekStartsOn)
    : calendarize(targetDate.toDate(), weekStartsOn);

  const cellHeight = weeks.length > 0 ? containerHeight / weeks.length : 0;

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
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectedDate && selectedDate.isSame(date, "day")) {
      setSelectedDate(null);
      setExpandedWeek(null);
    } else {
      setSelectedDate(date);
      setExpandedWeek(weekIndex);
    }
  };

  const sortedEvents = React.useCallback(
    (day: dayjs.Dayjs) => {
      if (!sortedMonthView) {
        return events.filter(({ start, end }) =>
          day.isBetween(
            dayjs(start).startOf("day"),
            dayjs(end).endOf("day"),
            null,
            "[)"
          )
        );
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
      let filteredEvents = events
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

      return finalEvents;
    },
    [events, sortedMonthView]
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
    return (
      <View
        style={[
          styles.weekRow,
          Platform.OS === "android" && style, // TODO: in Android, backgroundColor is not applied to child components
          { height: cellHeight },
        ]}
      >
        {showWeekNumber ? (
          <View
            style={[
              styles.weekNumberContainer,
              i > 0 && { borderTopWidth: 1 },
              { height: cellHeight },
            ]}
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
                  { height: cellHeight },
                  getCalendarCellStyle(date?.toDate(), i),
                  isCellSelected && { backgroundColor: "rgba(0,0,0,0.1)" },
                ]}
                key={`${ii}-${date?.toDate()}`}
                onLayout={({ nativeEvent: { layout } }) =>
                  // Only set calendarCellHeight once because they are all same
                  // Only set calendarCellHeight if disableMonthEventCellPress is true, since calendarCellHeihgt is only used when disableMonthEventCellPress is true
                  i === 0 &&
                  ii === 0 &&
                  disableMonthEventCellPress &&
                  setCalendarCellHeight(layout.height)
                }
                {...calendarCellAccessibilityPropsForMonthView}
              >
                <React.Fragment>
                  <TouchableOpacity
                    onPress={() =>
                      date &&
                      (onPressDateHeader
                        ? onPressDateHeader(date.toDate())
                        : onPressCell?.(date.toDate()))
                    }
                    onLongPress={() =>
                      date &&
                      (onPressDateHeader
                        ? onPressDateHeader(date.toDate())
                        : onLongPressCell?.(date.toDate()))
                    }
                    {...(calendarCellAccessibilityProps as AccessibilityProps)}
                  >
                    {renderDateCell(date, i)}
                  </TouchableOpacity>
                  {
                    //Calendar body will re-render after calendarWidth/calendarCellHeight is set from layout event, prevent expensive operation during first render
                    calendarWidth > 0 &&
                      (!disableMonthEventCellPress || calendarCellHeight > 0) &&
                      date &&
                      sortedEvents(date).reduce(
                        (elements, event, index, events) => [
                          // biome-ignore lint/performance/noAccumulatingSpread: Acceptable to use spread operator here
                          ...elements,
                          index > maxVisibleEventCount ? null : index ===
                            maxVisibleEventCount ? (
                            <Text
                              key={`${index}-${event.start}-${event.title}-${event.end}`}
                              style={styles.moreLabelText}
                              onPress={() =>
                                onPressMoreLabel?.(events, date.toDate())
                              }
                            >
                              {moreLabel.replace(
                                "{moreCount}",
                                `${events.length - maxVisibleEventCount}`
                              )}
                            </Text>
                          ) : (
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
                              dayOfTheWeek={ii}
                              calendarWidth={calendarWidth}
                              isRTL={false}
                              eventMinHeightForMonthView={
                                eventMinHeightForMonthView
                              }
                              showAdjacentMonths={showAdjacentMonths}
                            />
                          ),
                        ],
                        [] as (null | JSX.Element)[]
                      )
                  }
                </React.Fragment>
              </TouchableOpacity>
            );
          })}
      </View>
    );
  };

  return (
    <View
      style={[styles.container, { height: containerHeight }, style]}
      onLayout={({ nativeEvent: { layout } }) => {
        setCalendarWidth(layout.width);
      }}
    >
      {(() => {
        if (expandedWeek === null) {
          return weeks.map((week, i) => (
            <React.Fragment key={`${i}-${week.join("-")}`}>
              {renderWeekRow(week, i)}
            </React.Fragment>
          ));
        }

        const elements = [];
        elements.push(
          <React.Fragment
            key={`${expandedWeek}-${weeks[expandedWeek].join("-")}`}
          >
            {renderWeekRow(weeks[expandedWeek], expandedWeek)}
          </React.Fragment>
        );

        if (selectedDate) {
          const isLastWeek = expandedWeek === weeks.length - 1;
          const eventListHeight = isLastWeek
            ? cellHeight * (weeks.length - 1)
            : cellHeight * (weeks.length - 2);
          elements.push(
            <DayEventsList
              key="day-events-list"
              events={events}
              selectedDate={selectedDate}
              onPressEvent={onPressEvent}
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
        return elements;
      })()}
    </View>
  );
}

function DayEventsList<T extends ICalendarEventBase>({
  events,
  selectedDate,
  onPressEvent,
  style,
}: {
  events: T[];
  selectedDate: dayjs.Dayjs;
  onPressEvent?: (event: T) => void;
  style?: ViewStyle;
}) {
  const dayEvents = React.useMemo(
    () =>
      events.filter(({ start, end }) =>
        selectedDate.isBetween(
          dayjs(start).startOf("day"),
          dayjs(end).endOf("day"),
          null,
          "[)"
        )
      ),
    [events, selectedDate]
  );

  const renderItem = ({ item }: { item: T }) => (
    <View
      style={{
        padding: 8,
        marginHorizontal: 12,
        marginVertical: 4,
        backgroundColor: "white",
        borderRadius: 4,
      }}
    >
      <Text>{item.title}</Text>
      <Text style={{ fontSize: 12, color: "#888" }}>
        {dayjs(item.start).format("HH:mm")} - {dayjs(item.end).format("HH:mm")}
      </Text>
    </View>
  );

  return (
    <View style={[{ backgroundColor: "#f5f5f5" }, style]}>
      {dayEvents.length > 0 ? (
        <FlatList
          data={dayEvents}
          keyExtractor={(item, index) => `${item.start}${item.title}${index}`}
          renderItem={renderItem}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>No events for this day.</Text>
        </View>
      )}
    </View>
  );
}

export const CalendarBodyForMonthView = typedMemo(_CalendarBodyForMonthView);
