import { ConvexType } from "@/utils/convex-type";
import { formatHours } from "@/utils/number-formatters";

type EmployeeWithTimes = ConvexType<"paySchedule.get">["employees"][number];
type Props = {
  employee: EmployeeWithTimes;
};

export const PayScheduleEmployeeRow = ({ employee }: Props) => {
  return (
    <div className="pb-4">
      <div className="flex gap-2 py-2 border-b">
        <div className="font-bold text-primary">
          {employee.nameFirst} {employee.nameLast}
        </div>
        <div>regular hours: {formatHours(employee.periodRegularHours)}</div>
        <div>overtime hours: {formatHours(employee.periodOvertimeHours)}</div>
        <div>total hours: {formatHours(employee.periodTotalHours)}</div>
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
                    {record.startTime} - {record.endTime}
                  </div>
                  <div>{formatHours(record.totalTime)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
