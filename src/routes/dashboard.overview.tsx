import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Clock, LogOut, Search, X } from "lucide-react";
import { useState } from "react";
import { Line, LineChart, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/dashboard/overview")({
  component: RouteComponent,
});

// Mock data
const mockEmployees = [
  {
    id: "1",
    nameFirst: "Alex",
    nameLast: "Munoz",
    isClockedIn: true,
    position: "Senior Upholsterer",
    dailyHours: 8.82,
    periodHours: 68.44,
    weekHours: 26.5,
    avatar: "/avatars/alex.jpg",
  },
  {
    id: "2",
    nameFirst: "Eduardo",
    nameLast: "Fierro",
    isClockedIn: true,
    position: "Fabric Specialist",
    dailyHours: 9.19,
    periodHours: 75.35,
    weekHours: 28.11,
    avatar: "/avatars/eduardo.jpg",
  },
  {
    id: "3",
    nameFirst: "Oscar",
    nameLast: "Guzman",
    isClockedIn: true,
    position: "Upholsterer",
    dailyHours: 9.14,
    periodHours: 73.82,
    weekHours: 27.51,
    avatar: "/avatars/oscar.jpg",
  },
  {
    id: "4",
    nameFirst: "Ricardo",
    nameLast: "Flores",
    isClockedIn: false,
    position: "Frame Repair",
    dailyHours: 9.12,
    periodHours: 73.67,
    weekHours: 27.33,
    avatar: "/avatars/ricardo.jpg",
  },
  {
    id: "5",
    nameFirst: "Rodrigo",
    nameLast: "Jimenez",
    isClockedIn: true,
    position: "Apprentice",
    dailyHours: 8.19,
    periodHours: 71.94,
    weekHours: 27.6,
    avatar: "/avatars/rodrigo.jpg",
  },
];

const mockTimeEntries = [
  {
    id: "1",
    employeeName: "Alex Munoz",
    timeIn: "7:07 AM",
    timeOut: "1:00 PM",
    total: 5.87,
    type: "Time Entry",
    notes: "Notes",
    status: "completed",
  },
  {
    id: "2",
    employeeName: "Alex Munoz",
    timeIn: "2:03 PM",
    timeOut: "5:00 PM",
    total: 2.95,
    type: "Time Entry",
    notes: "Notes",
    status: "completed",
  },
  {
    id: "3",
    employeeName: "Eduardo Fierro",
    timeIn: "6:58 AM",
    timeOut: "1:16 PM",
    total: 6.3,
    type: "Time Entry",
    notes: "Notes",
    status: "completed",
  },
  {
    id: "4",
    employeeName: "Eduardo Fierro",
    timeIn: "2:09 PM",
    timeOut: "5:02 PM",
    total: 2.89,
    type: "Time Entry",
    notes: "Notes",
    status: "completed",
  },
  {
    id: "5",
    employeeName: "Oscar Guzman",
    timeIn: "7:06 AM",
    timeOut: "1:16 PM",
    total: 6.18,
    type: "Time Entry",
    notes: "Notes",
    status: "completed",
  },
  {
    id: "6",
    employeeName: "Oscar Guzman",
    timeIn: "2:04 PM",
    timeOut: "5:01 PM",
    total: 2.96,
    type: "Time Entry",
    notes: "Notes",
    status: "completed",
  },
  {
    id: "7",
    employeeName: "Ricardo Flores",
    timeIn: "7:06 AM",
    timeOut: "1:17 PM",
    total: 6.17,
    type: "Time Entry",
    notes: "Notes",
    status: "completed",
  },
  {
    id: "8",
    employeeName: "Ricardo Flores",
    timeIn: "2:04 PM",
    timeOut: "5:01 PM",
    total: 2.95,
    type: "Time Entry",
    notes: "Notes",
    status: "completed",
  },
  {
    id: "9",
    employeeName: "Rodrigo Jimenez",
    timeIn: "7:10 AM",
    timeOut: "1:22 PM",
    total: 6.2,
    type: "Time Entry",
    notes: "Notes",
    status: "completed",
  },
  {
    id: "10",
    employeeName: "Rodrigo Jimenez",
    timeIn: "2:02 PM",
    timeOut: "5:02 PM",
    total: 2.99,
    type: "Time Entry",
    notes: "Notes",
    status: "completed",
  },
];

// Mock chart data for 2-week period (current stops at 3/4 mark - day 10)
const mockChartData = [
  { day: "Mon", date: "Dec 16", current: 7.8, average: 8.2 },
  { day: "Tue", date: "Dec 17", current: 16.5, average: 16.8 },
  { day: "Wed", date: "Dec 18", current: 23.9, average: 25.1 },
  { day: "Thu", date: "Dec 19", current: 33.2, average: 33.7 },
  { day: "Fri", date: "Dec 20", current: 41.8, average: 42.2 },
  { day: "Sat", date: "Dec 21", current: 44.1, average: 45.8 },
  { day: "Sun", date: "Dec 22", current: 44.1, average: 45.8 },
  { day: "Mon", date: "Dec 23", current: 52.6, average: 54.3 },
  { day: "Tue", date: "Dec 24", current: 61.9, average: 62.8 },
  { day: "Wed", date: "Dec 25", current: 69.4, average: 71.2 },
  { day: "Thu", date: "Dec 26", current: null, average: 79.8 },
  { day: "Fri", date: "Dec 27", current: null, average: 88.1 },
  { day: "Sat", date: "Dec 28", current: null, average: 91.7 },
  { day: "Sun", date: "Dec 29", current: null, average: 91.7 },
];

const chartConfig = {
  current: {
    label: "Current Period",
    color: "hsl(var(--chart-1))",
  },
  average: {
    label: "Average",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

function RouteComponent() {
  const [timeEntryFilter, setTimeEntryFilter] = useState("");

  const filteredTimeEntries = mockTimeEntries.filter(
    (entry) =>
      entry.employeeName
        .toLowerCase()
        .includes(timeEntryFilter.toLowerCase()) ||
      entry.type.toLowerCase().includes(timeEntryFilter.toLowerCase())
  );

  const handleClockToggle = (employeeId: string, isClockedIn: boolean) => {
    // This would normally call a mutation to update the employee's clock status
    console.log(
      `${isClockedIn ? "Clocking out" : "Clocking in"} employee ${employeeId}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex h-full gap-6">
        {/* Left Side - Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
            <CardDescription>
              Hourly employees can clock in and out to track their time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-w-[580px]">
              <div className="divide-y">
                {mockEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between py-1.5 "
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={employee.avatar}
                          alt={`${employee.nameFirst} ${employee.nameLast}`}
                        />
                        <AvatarFallback className="font-medium text-gray-700 bg-gray-100">
                          {employee.nameFirst[0]}
                          {employee.nameLast[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {employee.nameFirst} {employee.nameLast}
                        </div>
                        <div className="space-y-1 text-sm text-gray-500">
                          <div>Daily: {employee.dailyHours} hrs</div>
                          <div>
                            Period: {employee.periodHours} hrs Week:{" "}
                            {employee.weekHours} hrs
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant={"ghost"}
                        size="sm"
                        disabled={!employee.isClockedIn}
                        className={
                          employee.isClockedIn
                            ? "text-primary hover:text-primary"
                            : ""
                        }
                        onClick={() =>
                          handleClockToggle(employee.id, employee.isClockedIn)
                        }
                      >
                        Clock In
                      </Button>
                      <Button
                        variant={"ghost"}
                        size="sm"
                        disabled={employee.isClockedIn}
                        className={
                          !employee.isClockedIn
                            ? "text-primary hover:text-primary"
                            : ""
                        }
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

        {/* Right Side - Time Entries */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Time Entries</CardTitle>
                <CardDescription>
                  Todays time entries and PTO records
                </CardDescription>
              </div>
              <Input
                placeholder="Filter by employee"
                type="search"
                value={timeEntryFilter}
                onChange={(e) => setTimeEntryFilter(e.target.value)}
                className="h-8 w-46"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="">
                  <TableHead>Employee</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimeEntries.map((entry) => (
                  <TableRow key={entry.id} className="">
                    <TableCell className="py-2 text-sm">
                      {entry.employeeName}
                    </TableCell>
                    <TableCell className="py-2 text-sm">
                      {entry.timeIn}
                    </TableCell>
                    <TableCell className="py-2 text-sm">
                      {entry.timeOut}
                    </TableCell>
                    <TableCell className="py-2 text-sm">
                      {entry.total}
                    </TableCell>
                    <TableCell className="py-2 text-sm">{entry.type}</TableCell>

                    <TableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0 "
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>Accumulated Hours - 2 Week Period</CardTitle>
          <CardDescription>
            Current period vs average accumulated hours over 14 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <LineChart
              accessibilityLayer
              data={mockChartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value, index) => {
                  const item = mockChartData[index];
                  return `${value} ${item?.date}`;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}h`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="average"
                type="monotone"
                stroke="var(--color-average)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-average)",
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />
              <Line
                dataKey="current"
                type="monotone"
                stroke="var(--color-current)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-current)",
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
                connectNulls={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
