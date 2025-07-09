import { ReportHeader } from "@/components/report-header";
import { ConvexType } from "@/utils/convex-type";
import { formatHours } from "@/utils/number-formatters";
import { formatTime } from "@/utils/time-formatters";
import { formatDate } from "date-fns";
import React from "react";

type EmployeeWithTimes = ConvexType<"paySchedule.get">["employees"][number];
type Props = {
  paySchedule: ConvexType<"paySchedule.get">;
  employee: EmployeeWithTimes;
};

export const PayScheduleEmployeeRow = ({ employee, paySchedule }: Props) => {
  return (
    <div className="min-h-screen print:p-6 page-break-after-always">
      <ReportHeader>
        <div className="text-right">
          <div className="text-lg font-bold">
            {employee.nameFirst} {employee.nameLast}
          </div>
          <div className="text-sm">
            Payroll Detail Report - {paySchedule.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(new Date(paySchedule.startDate), "M/d/yyyy")} to{" "}
            {formatDate(new Date(paySchedule.endDate), "M/d/yyyy")}
          </div>
        </div>
      </ReportHeader>

      {/* Time Entries by Week */}
      <div className="space-y-6">
        {employee.weekGroups.map((weekGroup) => (
          <div key={weekGroup.week}>
            {/* Time Entry Table */}
            <div className="border border-b-0 border-muted">
              {/* Table Header */}
              <div className="grid grid-cols-5 text-sm font-medium border-b border-muted bg-muted">
                <div className="p-1 pl-3 border-muted">Date</div>
                <div className="p-1 text-right border-muted">Time In</div>
                <div className="p-1 text-right border-muted">Time Out</div>
                <div className="p-1 text-right border-muted">Total</div>
                <div className="p-1 pr-3 text-right">Daily Total</div>
              </div>

              {/* Time Entry Rows */}
              <div className="grid grid-cols-5 text-xs">
                {weekGroup.days.map((day) =>
                  day.dayTimeEntries.map((record, index) => (
                    <React.Fragment key={record._id}>
                      {index === 0 && (
                        <div
                          className="p-1 pl-3 border-t border-muted "
                          style={{
                            gridRow: `span ${day.dayTimeEntries.length}`,
                          }}
                        >
                          {day.date}
                        </div>
                      )}
                      <div
                        data-index={index}
                        className="p-1 text-right border-muted data-[index=0]:border-t"
                      >
                        {formatTime(record.startTime)}
                      </div>
                      <div
                        data-index={index}
                        className="p-1 text-right border-muted data-[index=0]:border-t"
                      >
                        {formatTime(record.endTime)}
                      </div>
                      <div
                        data-index={index}
                        className="p-1 text-right border-muted data-[index=0]:border-t"
                      >
                        {formatHours(record.totalTime)} hrs
                      </div>
                      {index === 0 && (
                        <div
                          className="h-full p-1 pr-3 text-right border-t border-muted place-content-end"
                          style={{
                            gridRow: `span ${day.dayTimeEntries.length}`,
                          }}
                        >
                          {formatHours(day.dayTotalHours)} hrs
                        </div>
                      )}
                    </React.Fragment>
                  ))
                )}
              </div>
            </div>

            {/* Week Summary */}
            <div className="grid grid-cols-5 text-right border-t border-muted">
              <div className="col-span-2 p-3 font-bold text-left border-b border-l border-muted">
                Week {weekGroup.week}
              </div>

              <div className="col-start-3 p-1 border-b border-muted">
                <div className="text-xs font-normal text-muted-foreground">
                  Week Reg Hours
                </div>
                <div className="font-bold ">
                  {formatHours(weekGroup.weekRegularHours)}
                </div>
              </div>
              <div className="col-start-4 p-1 border-b border-muted">
                <div className="text-xs font-normal text-muted-foreground">
                  Week Overtime Hours
                </div>
                <div className="font-bold">
                  {formatHours(weekGroup.weekOvertimeHours)}
                </div>
              </div>
              <div className="col-start-5 p-1 pr-3 border-b border-r">
                <div className="text-xs font-normal text-muted-foreground">
                  Week Total Hours
                </div>
                <div className="font-bold ">
                  {formatHours(weekGroup.weekTotalHours)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grand Totals */}
      <div className="flex justify-end mt-8 mb-8 print:mb-0">
        <div className="flex text-sm border-2 border-foreground">
          <div className="px-4 pt-1 font-bold text-background bg-foreground">
            Grand Totals
          </div>
          <div className="grid grid-cols-3 bg-background">
            <div className="px-3 py-1 text-right border-r border-muted">
              <div className="">Regular Hours</div>
              <div className="font-bold">
                {formatHours(employee.periodRegularHours)}
              </div>
            </div>
            <div className="px-3 py-1 text-right border-r border-muted">
              <div className="">Overtime Hours</div>
              <div className="font-bold">
                {formatHours(employee.periodOvertimeHours)}
              </div>
            </div>
            <div className="px-3 py-1 text-right">
              <div className="">Total Hours</div>
              <div className="font-bold">
                {formatHours(employee.periodTotalHours)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
