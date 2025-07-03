import { api } from "@convex/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  PlusIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UmbrellaIcon,
} from "lucide-react";
import { useState } from "react";

// Mock data for time off requests - in a real app this would come from Convex
const mockTimeOffRequests = [
  {
    id: "1",
    type: "vacation",
    startDate: "2025-07-15",
    endDate: "2025-07-19",
    days: 5,
    status: "approved",
    reason: "Family vacation to the beach",
    requestedDate: "2025-06-15",
    approvedBy: "Manager Name",
    approvedDate: "2025-06-16",
  },
  {
    id: "2",
    type: "sick",
    startDate: "2025-06-28",
    endDate: "2025-06-28",
    days: 1,
    status: "approved",
    reason: "Doctor's appointment",
    requestedDate: "2025-06-27",
    approvedBy: "Manager Name",
    approvedDate: "2025-06-27",
  },
  {
    id: "3",
    type: "personal",
    startDate: "2025-08-05",
    endDate: "2025-08-07",
    days: 3,
    status: "pending",
    reason: "Moving to new apartment",
    requestedDate: "2025-07-01",
    approvedBy: null,
    approvedDate: null,
  },
  {
    id: "4",
    type: "vacation",
    startDate: "2025-05-20",
    endDate: "2025-05-24",
    days: 5,
    status: "denied",
    reason: "Conference attendance",
    requestedDate: "2025-05-01",
    approvedBy: "Manager Name",
    approvedDate: "2025-05-02",
    denialReason: "Critical project deadline during requested dates",
  },
];

export const Route = createFileRoute("/employees/$id/time-off")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const employee = useQuery(api.employees.get, { _id: id });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  if (!employee) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="text-green-800 bg-green-100">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="destructive">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircleIcon className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "vacation":
        return "text-blue-600";
      case "sick":
        return "text-red-600";
      case "personal":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "vacation":
        return "Vacation";
      case "sick":
        return "Sick Leave";
      case "personal":
        return "Personal Time";
      default:
        return type;
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmitRequest = () => {
    // In a real app, this would call a Convex mutation
    console.log("Submitting time off request:", newRequest);
    setIsDialogOpen(false);
    setNewRequest({ type: "", startDate: "", endDate: "", reason: "" });
  };

  // Calculate time off summary
  const approvedDays = mockTimeOffRequests
    .filter((req) => req.status === "approved")
    .reduce((sum, req) => sum + req.days, 0);

  const pendingDays = mockTimeOffRequests
    .filter((req) => req.status === "pending")
    .reduce((sum, req) => sum + req.days, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Time Off</h2>
          <p className="text-muted-foreground">
            Manage time off requests for {employee.nameFirst}{" "}
            {employee.nameLast}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Time Off Request</DialogTitle>
              <DialogDescription>
                Submit a new time off request for approval.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newRequest.type}
                  onValueChange={(value) =>
                    setNewRequest({ ...newRequest, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time off type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newRequest.startDate}
                    onChange={(e) =>
                      setNewRequest({
                        ...newRequest,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Brief description of the request..."
                  value={newRequest.reason}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, reason: e.target.value })
                  }
                />
              </div>
              {newRequest.startDate && newRequest.endDate && (
                <div className="text-sm text-muted-foreground">
                  Duration:{" "}
                  {calculateDays(newRequest.startDate, newRequest.endDate)}{" "}
                  day(s)
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleSubmitRequest}
                disabled={
                  !newRequest.type ||
                  !newRequest.startDate ||
                  !newRequest.endDate
                }
              >
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Days Used</CardTitle>
            <CheckCircleIcon className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedDays}
            </div>
            <p className="text-xs text-muted-foreground">
              Approved time off this year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ClockIcon className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingDays}
            </div>
            <p className="text-xs text-muted-foreground">
              Days awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <UmbrellaIcon className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {25 - approvedDays}
            </div>
            <p className="text-xs text-muted-foreground">
              Days remaining (assumed 25 total)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Off Requests */}
      <div className="grid gap-4">
        {mockTimeOffRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <CardTitle className={`text-lg ${getTypeColor(request.type)}`}>
                  {getTypeLabel(request.type)}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  ({request.days} day{request.days !== 1 ? "s" : ""})
                </span>
              </div>
              {getStatusBadge(request.status)}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-sm font-medium text-muted-foreground">
                    Dates
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(request.startDate).toLocaleDateString()} -{" "}
                      {new Date(request.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-sm font-medium text-muted-foreground">
                    Requested
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(request.requestedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {request.reason && (
                <div>
                  <div className="mb-1 text-sm font-medium text-muted-foreground">
                    Reason
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.reason}
                  </p>
                </div>
              )}

              {request.status === "approved" && request.approvedBy && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Approved by:</span>{" "}
                  <span className="font-medium">{request.approvedBy}</span>
                  {request.approvedDate && (
                    <span className="text-muted-foreground">
                      {" "}
                      on {new Date(request.approvedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {request.status === "denied" && request.denialReason && (
                <div className="p-3 border border-red-200 rounded-md bg-red-50">
                  <div className="mb-1 text-sm font-medium text-red-800">
                    Denial Reason
                  </div>
                  <p className="text-sm text-red-700">{request.denialReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {mockTimeOffRequests.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircleIcon className="w-5 h-5 text-muted-foreground" />
              No Time Off Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <UmbrellaIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2 text-muted-foreground">
                This employee hasn't submitted any time off requests.
              </p>
              <p className="text-sm text-muted-foreground">
                Click "New Request" to submit a time off request.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
