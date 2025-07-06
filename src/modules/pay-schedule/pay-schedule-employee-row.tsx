import { ConvexType } from "@/utils/convex-type";
import { formatHours } from "@/utils/number-formatters";
import { formatTime } from "@/utils/time-formatters";
import { formatDate } from "date-fns";
import { SofaIcon } from "lucide-react";

type EmployeeWithTimes = ConvexType<"paySchedule.get">["employees"][number];
type Props = {
  paySchedule: ConvexType<"paySchedule.get">;
  employee: EmployeeWithTimes;
};

export const PayScheduleEmployeeRow = ({ employee, paySchedule }: Props) => {
  return (
    <div className="pb-4">
      <div className="flex justify-between gap-2 py-2 border-b">
        <div className="flex items-center gap-2">
          <SofaIcon />
          Jacks Do It Shop
        </div>
        <div className="text-right">
          <div className="font-bold">
            {employee.nameFirst} {employee.nameLast}
          </div>
          <div>Payroll Detail Report - {paySchedule.name}</div>
          <div>
            {formatDate(new Date(paySchedule.startDate), "M/d/YYY")} to{" "}
            {formatDate(new Date(paySchedule.endDate), "M/d/YYY")}
          </div>
        </div>
      </div>
      {employee.timeEntries.map((timeEntry) => (
        <div key={timeEntry.week} className="pl-4">
          <div className="flex gap-2 py-2 border-b">
            <div className="font-bold">Week: {timeEntry.week}</div>
            <div>regular hours: {formatHours(timeEntry.weekRegularHours)}</div>
            <div>
              overtime hours: {formatHours(timeEntry.weekOvertimeHours)}
            </div>
            <div>total hours: {formatHours(timeEntry.weekTotalHours)}</div>
          </div>
          <div>
            {timeEntry.timeEntries.map((record) => (
              <div key={record._id} className="pl-4">
                <div className="flex gap-2 py-1">
                  <div>
                    Date: {formatDate(new Date(record.startTime), "M/d/yyyy")}
                  </div>
                  <div>Time In: {formatTime(record.startTime)}</div>
                  <div>Time Out: {formatTime(record.endTime)}</div>
                  <div>Daily Total: {formatHours(record.totalTime)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <div>regular hours: {formatHours(employee.periodRegularHours)}</div>
        <div>overtime hours: {formatHours(employee.periodOvertimeHours)}</div>
        <div>total hours: {formatHours(employee.periodTotalHours)}</div>
      </div>
    </div>
  );
};
