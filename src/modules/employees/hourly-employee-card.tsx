import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConvexType } from "@/utils/convexType";
import { formatHours } from "@/utils/numberFormatters";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { toast } from "sonner";

type Employee = ConvexType<"employees.all">[number];

export function HourlyEmployeeCard() {
  const employees =
    useQuery(api.employees.all, {
      isActive: true,
      type: "hourly",
    }) ?? [];

  const clockIn = useMutation(api.times.clockIn);
  const clockOut = useMutation(api.times.clockOut);

  const handleClockIn = (employee: Employee) => {
    clockIn({ employeeId: employee._id })
      .then(() => {
        toast.success(
          `Clocked in employee ${employee.nameFirst} ${employee.nameLast}`
        );
      })
      .catch((error) => {
        toast.error(
          `Error clocking in employee ${employee.nameFirst} ${employee.nameLast}:`,
          error
        );
      });
  };

  const handleClockOut = (employee: Employee) => {
    if (!employee.mostRecentOpenTime) {
      toast.error(
        `Employee ${employee.nameFirst} ${employee.nameLast} is not clocked in.`
      );
      return;
    }
    clockOut({ id: employee.mostRecentOpenTime._id })
      .then(() => {
        toast.success(
          `Clocked out employee ${employee.nameFirst} ${employee.nameLast}`
        );
      })
      .catch((error) => {
        toast.error(
          `Error clocking out employee ${employee.nameFirst} ${employee.nameLast}:`,
          error
        );
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees</CardTitle>
        <CardDescription>Showing active hourly employees</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-w-[580px]">
          <div className="divide-y">
            {employees.map((employee) => (
              <div
                key={employee._id}
                className="flex items-center justify-between py-1.5 "
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={employee.photo ?? ""}
                      alt={`${employee.nameFirst} ${employee.nameLast}`}
                    />
                    <AvatarFallback className="">
                      {employee.nameFirst[0]}
                      {employee.nameLast[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold ">
                      {employee.nameFirst} {employee.nameLast}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>
                        Daily: {formatHours(employee.currentDailyHours)} hrs
                      </div>
                      <div>
                        Period: {formatHours(employee.currentPayPeriodHours)}{" "}
                        hrs Week: {formatHours(employee.currentWeekHours)} hrs
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant={"ghost"}
                    size="sm"
                    disabled={Boolean(employee.mostRecentOpenTime)}
                    className={
                      !Boolean(employee.mostRecentOpenTime)
                        ? "text-primary hover:text-primary"
                        : ""
                    }
                    onClick={() => handleClockIn(employee)}
                  >
                    Clock In
                  </Button>
                  <Button
                    variant={"ghost"}
                    size="sm"
                    disabled={employee.mostRecentOpenTime === null}
                    className={
                      employee.mostRecentOpenTime !== null
                        ? "text-primary hover:text-primary"
                        : ""
                    }
                    onClick={() => handleClockOut(employee)}
                  >
                    Clock Out
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
