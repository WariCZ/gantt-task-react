import type { ReactNode } from "react";

import format from "date-fns/format";

import { getWeekNumberISO8601 } from "../../helpers/date-helper";

import { DateSetup, ViewMode } from "../../types/public-types";

const fmtHourSafe = (date: Date, dateSetup: DateSetup) => {
  try {
    const pat = dateSetup?.dateFormats?.hourBottomHeaderFormat || "HH:mm";
    return format(date, pat, { locale: dateSetup.dateLocale });
  } catch {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
};

export const defaultRenderBottomHeader = (
  date: Date,
  viewMode: ViewMode,
  dateSetup: DateSetup,
  index: number,
  isUnknownDates: boolean
): ReactNode => {
  if (isUnknownDates) {
    const {
      dateLocale: { formatDistance },
      preStepsCount,
    } = dateSetup;

    const offsetFromStart = index - preStepsCount;

    if (offsetFromStart === 0) {
      return "0";
    }

    let value: string = "";

    if (!formatDistance) {
      value = `${offsetFromStart}`;
    } else {
      switch (viewMode) {
        case ViewMode.Year:
          value = formatDistance!("xYears", offsetFromStart);
          break;

        case ViewMode.Month:
          value = formatDistance!("xMonths", offsetFromStart);
          break;

        case ViewMode.Week:
          value = formatDistance!("xWeeks", offsetFromStart);
          break;

        case ViewMode.TwoDays:
          value = formatDistance!("xDays", offsetFromStart);
          break;

        case ViewMode.Day:
          value = formatDistance!("xDays", offsetFromStart);
          break;

        case ViewMode.QuarterDay:
          value = formatDistance!("xHours", offsetFromStart * 6);
          break;

        case ViewMode.HalfDay:
          value = formatDistance!("xHours", offsetFromStart * 12);
          break;

        case ViewMode.Hour:
          try {
            return format(date, dateSetup.dateFormats.hourBottomHeaderFormat, {
              locale: dateSetup.dateLocale,
            });
          } catch (e) {
            debugger;
            return String("popa");
          }

        default:
          throw new Error("Unknown viewMode");
      }
    }

    if (offsetFromStart > 0) {
      return `+${value}`;
    }

    return value;
  }

  switch (viewMode) {
    case ViewMode.Year:
      return date.getFullYear();

    case ViewMode.Month:
      try {
        return format(date, dateSetup.dateFormats.monthBottomHeaderFormat, {
          locale: dateSetup.dateLocale,
        });
      } catch (e) {
        return date.toLocaleString("default", { month: "long" });
      }

    case ViewMode.Week:
      return `W${getWeekNumberISO8601(date)}`;

    case ViewMode.Day:
    case ViewMode.TwoDays:
      try {
        return format(date, dateSetup.dateFormats.dayBottomHeaderFormat, {
          locale: dateSetup.dateLocale,
        });
      } catch (e) {
        return String(date.getDate());
      }

    case ViewMode.QuarterDay:
    case ViewMode.HalfDay:
    case ViewMode.Hour:
      return fmtHourSafe(date, dateSetup);

    default:
      throw new Error("Unknown viewMode");
  }
};
