import { api } from "@convex/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  MapPinIcon,
} from "lucide-react";
import { useState } from "react";

// Mock data for shifts - in a real app this would come from Convex
const mockShifts = [
  {
    id: "1",
    date: "2025-07-01",
    scheduledStart: "08:00",
    scheduledEnd: "16:00",
    actualStart: "07:55",
    actualEnd: "16:10",
    location: "Downtown Office",
    status: "completed",
    notes: "Overtime for client meeting",
  },
  {
    id: "2",
    date: "2025-07-02",
    scheduledStart: "09:00",
    scheduledEnd: "17:00",
    actualStart: "09:05",
    actualEnd: "17:00",
    location: "Remote",
    status: "completed",
    notes: "",
  },
  {
    id: "3",
    date: "2025-07-03",
    scheduledStart: "08:00",
    scheduledEnd: "16:00",
    actualStart: null,
    actualEnd: null,
    location: "Downtown Office",
    status: "scheduled",
    notes: "",
  },
  {
    id: "4",
    date: "2025-07-04",
    scheduledStart: "10:00",
    scheduledEnd: "18:00",
    actualStart: null,
    actualEnd: null,
    location: "Client Site",
    status: "scheduled",
    notes: "Important client presentation",
  },
];

export const Route = createFileRoute("/employees/$id/schedule")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const employee = useQuery(api.employees.get, { _id: id });
  const [showActualTimes, setShowActualTimes] = useState(false);

  if (!employee) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="text-green-800 bg-green-100">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="secondary">
            <ClockIcon className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      default:
        return (
          <Badge variant="destructive">
            <AlertCircleIcon className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateHours = (start: string, end: string) => {
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Schedule</h2>
          <p className="text-muted-foreground">
            View shifts and work hours for {employee.nameFirst}{" "}
            {employee.nameLast}
          </p>
        </div>
        <Button
          variant={showActualTimes ? "default" : "outline"}
          onClick={() => setShowActualTimes(!showActualTimes)}
          className="flex items-center gap-2"
        >
          <ClockIcon className="w-4 h-4" />
          {showActualTimes ? "Show Scheduled Times" : "Show Actual Times"}
        </Button>
      </div>

      <div className="grid gap-4">
        {mockShifts.map((shift) => (
          <Card key={shift.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-lg">
                  {new Date(shift.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
              </div>
              {getStatusBadge(shift.status)}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="mb-1 text-sm font-medium text-muted-foreground">
                    {showActualTimes ? "Actual Times" : "Scheduled Times"}
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    {showActualTimes && shift.actualStart && shift.actualEnd ? (
                      <span>
                        {formatTime(shift.actualStart)} -{" "}
                        {formatTime(shift.actualEnd)}
                      </span>
                    ) : (
                      <span>
                        {formatTime(shift.scheduledStart)} -{" "}
                        {formatTime(shift.scheduledEnd)}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-sm font-medium text-muted-foreground">
                    Hours Worked
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    {showActualTimes && shift.actualStart && shift.actualEnd ? (
                      <span className="font-mono">
                        {calculateHours(shift.actualStart, shift.actualEnd)}h
                      </span>
                    ) : (
                      <span className="font-mono">
                        {calculateHours(
                          shift.scheduledStart,
                          shift.scheduledEnd
                        )}
                        h
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-sm font-medium text-muted-foreground">
                    Location
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{shift.location}</span>
                  </div>
                </div>
              </div>

              {shift.notes && (
                <div>
                  <div className="mb-1 text-sm font-medium text-muted-foreground">
                    Notes
                  </div>
                  <p className="text-sm text-muted-foreground">{shift.notes}</p>
                </div>
              )}

              {showActualTimes && shift.status === "completed" && (
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Start Variance:
                    </span>
                    <span
                      className={
                        shift.actualStart &&
                        shift.scheduledStart &&
                        shift.actualStart < shift.scheduledStart
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {shift.actualStart &&
                        shift.scheduledStart &&
                        Math.round(
                          (new Date(
                            `2000-01-01T${shift.actualStart}`
                          ).getTime() -
                            new Date(
                              `2000-01-01T${shift.scheduledStart}`
                            ).getTime()) /
                            (1000 * 60)
                        ) + " min"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Variance:</span>
                    <span
                      className={
                        shift.actualEnd &&
                        shift.scheduledEnd &&
                        shift.actualEnd > shift.scheduledEnd
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {shift.actualEnd &&
                        shift.scheduledEnd &&
                        Math.round(
                          (new Date(`2000-01-01T${shift.actualEnd}`).getTime() -
                            new Date(
                              `2000-01-01T${shift.scheduledEnd}`
                            ).getTime()) /
                            (1000 * 60)
                        ) + " min"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {mockShifts.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircleIcon className="w-5 h-5 text-muted-foreground" />
              No Schedule Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2 text-muted-foreground">
                This employee doesn't have any scheduled shifts.
              </p>
              <p className="text-sm text-muted-foreground">
                Schedule shifts to track work hours and attendance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
