import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Calendar as CalendarIcons, Clock, UserRound } from "lucide-react";
import { useDashboardContext } from "./dashboard";
import { PositionMultiPicker, PositionPicker } from "@/modules/positions";

// Mock data
const mockEmployeeShifts = [
  {
    id: 1,
    employee: "Alice Johnson",
    role: "Event Coordinator",
    shift: "Morning",
    time: "08:00-16:00",
    location: "Main Hall",
    status: "confirmed" as const,
  },
  {
    id: 2,
    employee: "Bob Wilson",
    role: "Security",
    shift: "Night",
    time: "20:00-04:00",
    location: "Entrance",
    status: "confirmed" as const,
  },
  {
    id: 3,
    employee: "Carol Davis",
    role: "Catering",
    shift: "Afternoon",
    time: "12:00-20:00",
    location: "Kitchen",
    status: "pending" as const,
  },
  {
    id: 4,
    employee: "David Brown",
    role: "Tech Support",
    shift: "Morning",
    time: "07:00-15:00",
    location: "AV Room",
    status: "confirmed" as const,
  },
];

const statusColors = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export const Route = createFileRoute("/dashboard/scheduling")({
  component: DashboardScheduling,
});

function DashboardScheduling() {
  const { selectedDate } = useDashboardContext();

  const filteredShifts = mockEmployeeShifts.filter((shift) => {
    // For demo, showing all shifts for selected date
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Employee Shifts */}
        <Card>
          <CardHeader>
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <CardTitle>Employee Shifts</CardTitle>
                </div>
                <CardDescription>
                  Staff scheduling for the selected date
                </CardDescription>
              </div>
              <div className="">
                <PositionMultiPicker onValueChange={console.log} />
                <PositionPicker
                  label="Select"
                  onSelect={(v) => console.log(v)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredShifts.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <UserRound className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{shift.employee}</div>
                    <div className="text-sm text-muted-foreground">
                      {shift.role} • {shift.location}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {shift.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={statusColors[shift.status]}>
                    {shift.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Week at a Glance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcons className="w-5 h-5" />
              <span>Week at a Glance</span>
            </CardTitle>
            <CardDescription>
              Weekly calendar view for scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
              <div className="text-center">
                <CalendarIcons className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Calendar View Coming Soon</p>
                <p className="text-sm">
                  Weekly schedule and timeline management
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
