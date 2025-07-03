import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isSameDay } from "date-fns";
import {
  Bus,
  Calendar as CalendarIcons,
  Car,
  Coffee,
  Plane,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardContext } from "@/routes/index.new";

// Mock data
const mockPublicTransports = [
  {
    id: 1,
    type: "flight",
    carrier: "Delta Airlines",
    number: "DL123",
    departure: "2025-07-01T14:30:00",
    arrival: "2025-07-01T17:45:00",
    from: "NYC",
    to: "LAX",
    passengers: 156,
    status: "on-time" as const,
  },
  {
    id: 2,
    type: "flight",
    carrier: "United",
    number: "UA456",
    departure: "2025-07-01T09:15:00",
    arrival: "2025-07-01T12:30:00",
    from: "CHI",
    to: "MIA",
    passengers: 134,
    status: "delayed" as const,
  },
  {
    id: 3,
    type: "bus",
    carrier: "Greyhound",
    number: "GH789",
    departure: "2025-07-02T08:00:00",
    arrival: "2025-07-02T16:00:00",
    from: "BOS",
    to: "NYC",
    passengers: 45,
    status: "on-time" as const,
  },
  {
    id: 4,
    type: "flight",
    carrier: "Southwest",
    number: "SW321",
    departure: "2025-07-02T11:20:00",
    arrival: "2025-07-02T14:55:00",
    from: "DAL",
    to: "PHX",
    passengers: 142,
    status: "boarding" as const,
  },
];

const mockTransfers = [
  {
    id: 1,
    from: "Airport",
    to: "Hotel Grand",
    status: "standby" as const,
    scheduledTime: "2025-07-01T18:00:00",
    passengers: 12,
    vehicle: "Bus #3",
    driver: "John Smith",
  },
  {
    id: 2,
    from: "Hotel Plaza",
    to: "Convention Center",
    status: "in-progress" as const,
    scheduledTime: "2025-07-01T13:30:00",
    passengers: 8,
    vehicle: "Van #7",
    driver: "Sarah Jones",
  },
  {
    id: 3,
    from: "Convention Center",
    to: "Restaurant District",
    status: "completed" as const,
    scheduledTime: "2025-07-01T12:00:00",
    passengers: 15,
    vehicle: "Bus #1",
    driver: "Mike Wilson",
  },
  {
    id: 4,
    from: "Hotel Elite",
    to: "Airport",
    status: "standby" as const,
    scheduledTime: "2025-07-01T19:30:00",
    passengers: 6,
    vehicle: "Sedan #4",
    driver: "Lisa Brown",
  },
];

const mockAttendanceData = [
  { date: "Jul 28", attendees: 245 },
  { date: "Jul 29", attendees: 312 },
  { date: "Jul 30", attendees: 456 },
  { date: "Jul 1", attendees: 523 },
  { date: "Jul 2", attendees: 487 },
  { date: "Jul 3", attendees: 398 },
  { date: "Jul 4", attendees: 267 },
];

const mockActivities = [
  {
    id: 1,
    name: "Opening Ceremony",
    time: "09:00-10:30",
    location: "Main Auditorium",
    capacity: 500,
    registered: 487,
    category: "ceremony",
    date: "2025-07-01",
  },
  {
    id: 2,
    name: "Networking Lunch",
    time: "12:00-13:30",
    location: "Garden Terrace",
    capacity: 200,
    registered: 156,
    category: "meal",
    date: "2025-07-01",
  },
  {
    id: 3,
    name: "Tech Workshop A",
    time: "14:00-16:00",
    location: "Conference Room A",
    capacity: 50,
    registered: 45,
    category: "workshop",
    date: "2025-07-02",
  },
  {
    id: 4,
    name: "Panel Discussion",
    time: "16:30-18:00",
    location: "Theater",
    capacity: 150,
    registered: 132,
    category: "session",
    date: "2025-07-01",
  },
];

const statusColors = {
  "on-time": "bg-green-100 text-green-800",
  delayed: "bg-red-100 text-red-800",
  boarding: "bg-blue-100 text-blue-800",
  standby: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export function DashboardOverview() {
  const { selectedDate } = useDashboardContext();
  const [transferStatus, setTransferStatus] = useState<
    "standby" | "in-progress" | "all"
  >("standby");

  // Filter data based on selected date
  const filteredTransports = mockPublicTransports.filter((transport) => {
    const transportDate = new Date(transport.departure);
    return isSameDay(transportDate, selectedDate);
  });

  const filteredTransfers = mockTransfers.filter((transfer) => {
    if (transferStatus === "all") return true;
    return transfer.status === transferStatus;
  });

  const filteredActivities = mockActivities.filter((activity) => {
    return isSameDay(new Date(activity.date), selectedDate);
  });

  return (
    <div className="space-y-6">
      {/* Transport and Transfers Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Public Transports */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Plane className="w-5 h-5" />
              <CardTitle>Public Transports</CardTitle>
            </div>
            <CardDescription>
              Arrivals and departures for {format(selectedDate, "MMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredTransports.map((transport) => (
              <div
                key={transport.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {transport.type === "flight" ? (
                    <Plane className="w-4 h-4" />
                  ) : (
                    <Bus className="w-4 h-4" />
                  )}
                  <div>
                    <div className="font-medium">{transport.number}</div>
                    <div className="text-sm text-muted-foreground">
                      {transport.from} → {transport.to}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(transport.arrival), "HH:mm")}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={statusColors[transport.status]}>
                    {transport.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {transport.passengers} pax
                  </div>
                </div>
              </div>
            ))}
            {filteredTransports.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No transports scheduled for {format(selectedDate, "MMM d")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transfers by Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Car className="w-5 h-5" />
                <CardTitle>Transfers</CardTitle>
              </div>
              <Select
                value={transferStatus}
                onValueChange={(value) => setTransferStatus(value as any)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standby">Standby</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>Transfer status and scheduling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Car className="w-4 h-4" />
                  <div>
                    <div className="font-medium">
                      {transfer.from} → {transfer.to}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transfer.vehicle} • {transfer.driver}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(transfer.scheduledTime), "HH:mm")}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={statusColors[transfer.status]}>
                    {transfer.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {transfer.passengers} pax
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Event Attendance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Event Attendance Forecast</span>
          </CardTitle>
          <CardDescription>
            Daily attendee count based on arrival/departure dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="attendees"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CalendarIcons className="w-5 h-5" />
            <CardTitle>Activities</CardTitle>
          </div>
          <CardDescription>
            Scheduled activities for {format(selectedDate, "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Coffee className="w-4 h-4" />
                <div>
                  <div className="font-medium">{activity.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {activity.location} • {activity.time}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activity.registered}/{activity.capacity} registered
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {Math.round((activity.registered / activity.capacity) * 100)}%
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(activity.registered / activity.capacity) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          {filteredActivities.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No activities scheduled for {format(selectedDate, "MMM d")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
