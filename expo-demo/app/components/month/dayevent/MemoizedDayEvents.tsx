import * as React from "react";
import { Text, type AccessibilityProps } from "react-native";
import dayjs from "dayjs";
import {
  EventCellStyle,
  EventRenderer,
  ICalendarEventBase,
} from "react-native-big-calendar";
import { styles } from "../styles/CalendarBodyForMonthView.styles";
import { CalendarEventForMonthView } from "./CalendarEventForMonthView";

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

export const MemoizedDayEvents = React.memo(
  _MemoizedDayEvents,
  areEventsEqual
) as typeof _MemoizedDayEvents;