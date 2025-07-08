import { test, expect } from "@jest/globals";
import dayjs from "dayjs";
import WeekOfYear from "dayjs/plugin/weekOfYear";
import Timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs.extend(Timezone);
dayjs.extend(WeekOfYear);

const weekTestCases = [
  {
    input: new Date("2025-07-07T07:00:00Z"),
    expected: {
      week: 28,
    },
  },
  {
    input: new Date(1751781600000),
    expected: {
      week: 28,
    },
  },
  {
    input: new Date(1752991199000),
    expected: {
      week: 29,
    },
  },
];

const periodTestCases = [
  {
    input: new Date("2025-07-07"),
    expected: {
      name: "2025-PP15",
      startDate: 1751781600000,
      endDate: 1752991199000,
    },
  },
  {
    input: new Date("2024-12-25"),
    expected: {
      name: "2025-PP1",
      startDate: 1734850800000,
      endDate: 1736060399000,
    },
  },
  {
    input: new Date("2025-01-04"),
    expected: {
      name: "2025-PP1",
      startDate: 1734850800000,
      endDate: 1736060399000,
    },
  },
];

const getWeekOfYear = (date) => {
  const djs = dayjs.tz(date, "America/Denver");
  const week = djs.week();
  return {
    week: week,
  };
};

test.each(weekTestCases)(
  "getWeekOfYear returns correct week for %s",
  ({ input, expected }) => {
    const result = getWeekOfYear(input);
    console.log(
      `Input: ${input}, Expected Week: ${expected.week}, Result Week: ${result.week}`
    );
    expect(result.week).toBe(expected.week);
  }
);
