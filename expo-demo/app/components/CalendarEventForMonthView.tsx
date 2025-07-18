import type dayjs from 'dayjs'
import * as React from 'react'
import type { AccessibilityProps, ViewStyle } from 'react-native'
import { Text, View, StyleSheet, Platform } from 'react-native'
import type { EventCellStyle, EventRenderer, ICalendarEventBase, CalendarTouchableOpacityProps } from 'react-native-big-calendar'
import { getEventSpanningInfo } from 'react-native-big-calendar'

const u = StyleSheet.create({
  'mt-2': {
    marginTop: 2,
  },
  truncate:
    Platform.OS === 'web'
      ? {
          overflow: 'hidden',
          // textOverflow: 'ellipsis',
          // whiteSpace: 'nowrap',
        }
      : {},
})

const defaultTheme = {
  isRTL: false,
  palette: {
    primary: {
      main: 'rgb(66, 133, 244)',
      contrastText: '#fff',
    },
    nowIndicator: 'red',
    gray: {
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      500: '#9e9e9e',
      800: '#424242',
    },
    moreLabel: '#000000',
  },
  eventCellOverlappings: [
    { main: '#E26245', contrastText: '#fff' }, // orange
    { main: '#4AC001', contrastText: '#fff' }, // green
    { main: '#5934C7', contrastText: '#fff' }, // purple
  ],
  typography: {
    xs: {
      fontSize: 10,
    },
    sm: {
      fontSize: 12,
    },
    xl: {
      fontSize: 22,
    },
    moreLabel: {
      fontSize: 11,
      fontWeight: 'bold',
    },
  },
}

const typedMemo: <T>(c: T) => T = React.memo

interface CalendarEventProps<T extends ICalendarEventBase> {
  event: T
  onPressEvent?: (event: T) => void
  eventCellStyle?: EventCellStyle<T>
  eventCellAccessibilityProps?: AccessibilityProps
  renderEvent?: EventRenderer<T>
  date: dayjs.Dayjs
  dayOfTheWeek: number
  calendarWidth: number
  isRTL: boolean
  eventMinHeightForMonthView: number
  showAdjacentMonths: boolean
}

function _CalendarEventForMonthView<T extends ICalendarEventBase>({
  event,
  eventCellStyle,
  eventCellAccessibilityProps = {},
  renderEvent,
  date,
  dayOfTheWeek,
  calendarWidth,
  isRTL,
  eventMinHeightForMonthView,
  showAdjacentMonths,
}: CalendarEventProps<T>) {
  const theme = defaultTheme

  const { eventWidth, isMultipleDays, isMultipleDaysStart, eventWeekDuration } = React.useMemo(
    () => getEventSpanningInfo(event, date, dayOfTheWeek, calendarWidth, showAdjacentMonths),
    [date, dayOfTheWeek, event, calendarWidth, showAdjacentMonths],
  )

  const eventStyles: ViewStyle[] = [
    { backgroundColor: theme.palette.primary.main },
    isMultipleDaysStart && eventWeekDuration > 1
      ? ({
          position: 'absolute',
          width: eventWidth,
          zIndex: 10000,
        } as ViewStyle)
      : {},
    isRTL ? { right: 0 } : { left: 0 },
    typeof eventCellStyle === 'function'
      ? eventCellStyle(event)
      : eventCellStyle,
  ].filter(Boolean) as ViewStyle[];

  const dummyTouchableOpacityProps: CalendarTouchableOpacityProps = {
    delayPressIn: 0,
    key: event.title + event.start.toISOString(),
    style: eventStyles,
    onPress: () => {},
    disabled: true,
  };

  return (
    <View
      style={[{ minHeight: eventMinHeightForMonthView }, u['mt-2']]}
    >
      {(!isMultipleDays && date.isSame(event.start, 'day')) ||
      (isMultipleDays && isMultipleDaysStart) ? (
        renderEvent ? (
          renderEvent(event, { ...dummyTouchableOpacityProps, ...eventCellAccessibilityProps })
        ) : (
          <View style={eventStyles} {...eventCellAccessibilityProps}>
            <Text
              style={[
                { color: theme.palette.primary.contrastText },
                theme.typography.xs,
                u.truncate,
                isRTL && { textAlign: 'right' },
              ]}
              numberOfLines={1}
            >
              {event.title}
            </Text>
          </View>
        )
      ) : null}
    </View>
  )
}

export const CalendarEventForMonthView = typedMemo(_CalendarEventForMonthView)
