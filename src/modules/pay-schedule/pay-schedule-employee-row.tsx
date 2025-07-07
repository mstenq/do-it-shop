import { ReportHeader } from "@/components/report-header";
import { ConvexType } from "@/utils/convex-type";
import { formatHours } from "@/utils/number-formatters";
import { formatTime } from "@/utils/time-formatters";
import { formatDate } from "date-fns";

type EmployeeWithTimes = ConvexType<"paySchedule.get">["employees"][number];
type Props = {
  paySchedule: ConvexType<"paySchedule.get">;
  employee: EmployeeWithTimes;
};

export const PayScheduleEmployeeRow = ({ employee, paySchedule }: Props) => {
  return (
    <div className="min-h-screen bg-white print:p-6 page-break-after-always">
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
        {employee.timeEntries.map((timeEntry) => (
          <div key={timeEntry.week}>
            {/* Week Header */}
            <div className="">
              <h3 className="px-3 py-2 text-base font-bold bg-gray-100 border-t border-l border-r border-gray-300">
                Week {timeEntry.week}
              </h3>
            </div>

            {/* Time Entry Table */}
            <div className="border border-b-0 border-gray-300">
              {/* Table Header */}
              <div className="grid grid-cols-5 text-sm font-medium border-b border-gray-300 bg-gray-50">
                <div className="p-2 border-r border-gray-300">Date</div>
                <div className="p-2 text-right border-r border-gray-300">
                  Time In
                </div>
                <div className="p-2 text-right border-r border-gray-300">
                  Time Out
                </div>
                <div className="p-2 text-right border-r border-gray-300">
                  Total
                </div>
                <div className="p-2 text-right">Daily Total</div>
              </div>

              {/* Time Entry Rows */}
              {timeEntry.timeEntries.map((record, index) => (
                <div
                  key={record._id}
                  className="grid grid-cols-5 text-sm border-b border-gray-300"
                >
                  <div className="p-2 border-r border-gray-300">
                    {formatDate(new Date(record.startTime), "M/d/yyyy")}
                  </div>
                  <div className="p-2 text-right border-r border-gray-300">
                    {formatTime(record.startTime)}
                  </div>
                  <div className="p-2 text-right border-r border-gray-300">
                    {formatTime(record.endTime)}
                  </div>
                  <div className="p-2 text-right border-r border-gray-300">
                    {formatHours(record.totalTime)} hrs
                  </div>
                  <div className="p-2 text-right">
                    {/* Show daily total only for the last entry of each day */}
                    {index === timeEntry.timeEntries.length - 1 ||
                    formatDate(new Date(record.startTime), "M/d/yyyy") !==
                      formatDate(
                        new Date(
                          timeEntry.timeEntries[index + 1]?.startTime ||
                            record.startTime
                        ),
                        "M/d/yyyy"
                      )
                      ? `${formatHours(record.totalTime)} hrs`
                      : ""}
                  </div>
                </div>
              ))}
            </div>

            {/* Week Summary */}
            <div className="grid grid-cols-5 text-right">
              <div className="col-start-3 p-2 border-b border-l border-r border-gray-300">
                <div className="text-xs font-normal">Week Reg Hours</div>
                <div className="font-bold ">
                  {formatHours(timeEntry.weekRegularHours)}
                </div>
              </div>
              <div className="col-start-4 p-2 border-b border-r border-gray-300">
                <div className="text-xs font-normal">Week OT Hours</div>
                <div className="font-bold ">
                  {formatHours(timeEntry.weekOvertimeHours)}
                </div>
              </div>
              <div className="col-start-5 p-2 border-b border-r">
                <div className="text-xs font-normal">Week Total Hours</div>
                <div className="font-bold ">
                  {formatHours(timeEntry.weekTotalHours)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grand Totals */}
      <div className="mt-8 mb-8 print:mb-0">
        <div className="inline-block border-2 border-black">
          <div className="px-4 py-2 font-bold text-white bg-black">
            Grand Totals
          </div>
          <div className="grid grid-cols-3 bg-gray-50">
            <div className="p-3 text-center border-r border-gray-300">
              <div className="font-medium">Total Reg Hours</div>
              <div className="font-bold">
                {formatHours(employee.periodRegularHours)}
              </div>
            </div>
            <div className="p-3 text-center border-r border-gray-300">
              <div className="font-medium">Total OT Hours</div>
              <div className="font-bold">
                {formatHours(employee.periodOvertimeHours)}
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="font-medium">Total Hours</div>
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
