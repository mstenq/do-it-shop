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
import { Calendar, Clock, Search, User, AlertCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/projects")({
  component: RouteComponent,
});

// Mock data
const mockProjects = [
  {
    id: "1",
    name: "Victorian Sofa Restoration",
    clientName: "Mrs. Henderson",
    status: "in_progress",
    priority: "high",
    estimatedHours: 40,
    actualHours: 24,
    dueDate: "2025-07-15",
    assignedEmployees: ["John Smith", "Sarah Johnson"],
    description:
      "Complete restoration of 1890s Victorian sofa including frame repair and reupholstery",
  },
  {
    id: "2",
    name: "Dining Chair Set (6 chairs)",
    clientName: "The Johnsons",
    status: "ready",
    priority: "medium",
    estimatedHours: 24,
    actualHours: 0,
    dueDate: "2025-07-20",
    assignedEmployees: ["Mike Davis"],
    description: "Reupholster 6 dining chairs with new fabric and foam",
  },
  {
    id: "3",
    name: "Custom Ottoman",
    clientName: "Mr. Williams",
    status: "in_progress",
    priority: "low",
    estimatedHours: 8,
    actualHours: 6,
    dueDate: "2025-07-10",
    assignedEmployees: ["Lisa Wilson"],
    description: "Build custom ottoman to match existing armchair",
  },
  {
    id: "4",
    name: "Leather Armchair Repair",
    clientName: "Office Solutions Inc.",
    status: "ready",
    priority: "medium",
    estimatedHours: 12,
    actualHours: 0,
    dueDate: "2025-07-25",
    assignedEmployees: ["Tom Brown"],
    description: "Repair tears in leather and replace worn cushions",
  },
  {
    id: "5",
    name: "Antique Rocking Chair",
    clientName: "Ms. Taylor",
    status: "in_progress",
    priority: "urgent",
    estimatedHours: 30,
    actualHours: 18,
    dueDate: "2025-07-08",
    assignedEmployees: ["John Smith"],
    description:
      "Restore antique rocking chair - frame stabilization and new upholstery",
  },
];

function RouteComponent() {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "ready" | "in_progress"
  >("all");

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(filter.toLowerCase()) ||
      project.clientName.toLowerCase().includes(filter.toLowerCase()) ||
      project.description.toLowerCase().includes(filter.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "default";
      case "ready":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const threeDaysFromNow = new Date(
      today.getTime() + 3 * 24 * 60 * 60 * 1000
    );
    return due <= threeDaysFromNow;
  };

  const getProgress = (actual: number, estimated: number) => {
    return Math.round((actual / estimated) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
          <CardDescription>
            Projects that are ready to work on or currently in progress
          </CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search projects..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "ready" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ready")}
              >
                Ready
              </Button>
              <Button
                variant={statusFilter === "in_progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("in_progress")}
              >
                In Progress
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        {isDueSoon(project.dueDate) && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        {project.name}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {project.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{project.clientName}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status === "in_progress"
                        ? "In Progress"
                        : "Ready"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        {project.actualHours}h / {project.estimatedHours}h
                      </div>
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{
                            width: `${Math.min(getProgress(project.actualHours, project.estimatedHours), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span
                        className={
                          isDueSoon(project.dueDate)
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {formatDate(project.dueDate)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm">
                        {project.assignedEmployees.join(", ")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
