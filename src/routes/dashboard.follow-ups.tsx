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
import { AlertCircle, NotebookPen } from "lucide-react";

// Mock data
const mockFollowUpNotes = [
  {
    id: 1,
    type: "public-transport",
    reference: "Flight DL123",
    note: "Passenger dietary restrictions to confirm",
    priority: "high" as const,
    dueDate: "2025-07-01",
  },
  {
    id: 2,
    type: "guest",
    reference: "John Doe",
    note: "Requires wheelchair accessibility",
    priority: "medium" as const,
    dueDate: "2025-07-02",
  },
  {
    id: 3,
    type: "activity",
    reference: "Tech Workshop A",
    note: "Need additional AV equipment",
    priority: "high" as const,
    dueDate: "2025-07-01",
  },
  {
    id: 4,
    type: "vendor",
    reference: "Catering Plus",
    note: "Menu changes requested for dietary needs",
    priority: "low" as const,
    dueDate: "2025-07-03",
  },
  {
    id: 5,
    type: "transport",
    reference: "Bus Transfer #3",
    note: "Driver schedule conflict needs resolution",
    priority: "high" as const,
    dueDate: "2025-07-01",
  },
  {
    id: 6,
    type: "venue",
    reference: "Main Conference Hall",
    note: "Temperature control system maintenance required",
    priority: "medium" as const,
    dueDate: "2025-07-02",
  },
];

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export const Route = createFileRoute("/dashboard/follow-ups")({
  component: DashboardFollowUps,
});

function DashboardFollowUps() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <NotebookPen className="w-5 h-5" />
            <span>Follow-up Notes</span>
          </CardTitle>
          <CardDescription>
            Items requiring attention across different record types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockFollowUpNotes.map((note) => (
              <div key={note.id} className="p-4 space-y-2 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {note.type.replace("-", " ")}
                  </Badge>
                  <Badge className={priorityColors[note.priority]}>
                    {note.priority}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium">{note.reference}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {note.note}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Due: {format(new Date(note.dueDate), "MMM d")}
                  </span>
                  {note.priority === "high" && (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
