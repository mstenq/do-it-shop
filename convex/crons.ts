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

export default crons;
