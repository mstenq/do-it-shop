import { ReportHeader } from "@/components/report-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConvexType } from "@/utils/convex-type";
import { formatHours } from "@/utils/number-formatters";
import { formatDate } from "date-fns";

type Props = {
  paySchedule: ConvexType<"paySchedule.get">;
};

export const PayScheduleSummary = ({ paySchedule }: Props) => {
  const employees = paySchedule.employees;
  const allEntries = employees.flatMap((employee) => employee.allTimeEntries);
  const totalEntries = allEntries.length;
  const totalRegularHours = employees.reduce(
    (sum, emp) => sum + (emp.periodRegularHours ?? 0),
    0
  );
  const totalOvertimeHours = employees.reduce(
    (sum, emp) => sum + (emp.periodOvertimeHours ?? 0),
    0
  );
  const totalHours = employees.reduce(
    (sum, emp) => sum + (emp.periodTotalHours ?? 0),
    0
  );

  return (
    <div>
      <ReportHeader>
        <div className="text-right">
          <div className="text-lg font-bold">
            Payroll Summary Report - {paySchedule.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(new Date(paySchedule.startDate), "M/d/yyyy")} to{" "}
            {formatDate(new Date(paySchedule.endDate), "M/d/yyyy")}
          </div>
        </div>
      </ReportHeader>
      <div>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead className="text-right">Time Entries</TableHead>
              <TableHead className="text-right">Regular Time</TableHead>
              <TableHead className="text-right">Overtime</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paySchedule.employees.map((employee) => (
              <TableRow key={employee._id}>
                <TableCell>
                  {employee.nameFirst} {employee.nameLast}
                </TableCell>
                <TableCell className="text-right">
                  {employee.allTimeEntries.length}
                </TableCell>
                <TableCell className="text-right">
                  {formatHours(employee.periodRegularHours)}
                </TableCell>
                <TableCell className="text-right">
                  {formatHours(employee.periodOvertimeHours)}
                </TableCell>
                <TableCell className="text-right">
                  {formatHours(employee.periodTotalHours)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-bold">Grand Totals</TableCell>
              <TableCell className="font-bold text-right">
                {totalEntries}
              </TableCell>
              <TableCell className="font-bold text-right">
                {formatHours(totalRegularHours)}
              </TableCell>
              <TableCell className="font-bold text-right">
                {formatHours(totalOvertimeHours)}
              </TableCell>
              <TableCell className="font-bold text-right">
                {formatHours(totalHours)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
