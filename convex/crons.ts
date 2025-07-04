import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "generatePaySchedule",
  {
    hourUTC: 6,
    minuteUTC: 0,
  },
  internal.paySchedule.generatePaySchedule
);

crons.daily(
  "calculateEmployeeHours",
  {
    hourUTC: 7,
    minuteUTC: 0,
  },
  internal.employees.calculateAllEmployeeHours
);

export default crons;
