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
import {
  Calendar,
  Clock,
  Search,
  Package,
  User,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/waiting-on")({
  component: RouteComponent,
});

// Mock data
const mockWaitingOnItems = [
  {
    id: "1",
    projectName: "Victorian Sofa Restoration",
    clientName: "Mrs. Henderson",
    description: "Waiting for antique fabric delivery from specialty supplier",
    category: "fabric",
    priority: "high",
    expectedDate: "2025-07-08",
    notes: "Supplier confirmed shipment on July 5th, tracking #ABC123",
    isResolved: false,
    daysSinceCreated: 3,
  },
  {
    id: "2",
    projectName: "Dining Chair Set (6 chairs)",
    clientName: "The Johnsons",
    description: "Waiting for client to approve fabric sample",
    category: "client_approval",
    priority: "medium",
    expectedDate: "2025-07-05",
    notes: "Sent samples on June 30th, following up today",
    isResolved: false,
    daysSinceCreated: 5,
  },
  {
    id: "3",
    projectName: "Custom Ottoman",
    clientName: "Mr. Williams",
    description: "Waiting for high-density foam delivery",
    category: "supplies",
    priority: "low",
    expectedDate: "2025-07-10",
    notes: "Standard delivery, should arrive on time",
    isResolved: false,
    daysSinceCreated: 2,
  },
  {
    id: "4",
    projectName: "Leather Armchair Repair",
    clientName: "Office Solutions Inc.",
    description: "Waiting for matching leather from tannery",
    category: "fabric",
    priority: "medium",
    expectedDate: "2025-07-12",
    notes: "Custom color match required, longer lead time",
    isResolved: false,
    daysSinceCreated: 7,
  },
  {
    id: "5",
    projectName: "Antique Rocking Chair",
    clientName: "Ms. Taylor",
    description: "Waiting for client to pick up completed chair",
    category: "client_pickup",
    priority: "urgent",
    expectedDate: "2025-07-03",
    notes: "Chair completed, client notified multiple times",
    isResolved: false,
    daysSinceCreated: 4,
  },
  {
    id: "6",
    projectName: "Executive Desk Chair",
    clientName: "Corporate Office",
    description: "Hardware delivery completed",
    category: "supplies",
    priority: "medium",
    expectedDate: "2025-07-01",
    notes: "All parts received, ready to proceed",
    isResolved: true,
    daysSinceCreated: 6,
  },
];

function RouteComponent() {
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "fabric" | "client_approval" | "supplies" | "client_pickup"
  >("all");
  const [showResolved, setShowResolved] = useState(false);

  const filteredItems = mockWaitingOnItems.filter((item) => {
    const matchesSearch =
      item.projectName.toLowerCase().includes(filter.toLowerCase()) ||
      item.clientName.toLowerCase().includes(filter.toLowerCase()) ||
      item.description.toLowerCase().includes(filter.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesResolved = showResolved || !item.isResolved;

    return matchesSearch && matchesCategory && matchesResolved;
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "fabric":
        return <Package className="w-4 h-4" />;
      case "client_approval":
        return <User className="w-4 h-4" />;
      case "supplies":
        return <Package className="w-4 h-4" />;
      case "client_pickup":
        return <User className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "fabric":
        return "Fabric";
      case "client_approval":
        return "Client Approval";
      case "supplies":
        return "Supplies";
      case "client_pickup":
        return "Client Pickup";
      default:
        return "Other";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (expectedDate: string) => {
    const expected = new Date(expectedDate);
    const today = new Date();
    return expected < today;
  };

  const handleMarkResolved = (itemId: string) => {
    // This would normally call a mutation to update the item status
    console.log(`Marking item ${itemId} as resolved`);
  };

  return (
    <div className="space-y-6">
      {/* Waiting Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waiting On Items</CardTitle>
          <CardDescription>
            Items that projects are waiting for before work can continue
          </CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search waiting items..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={categoryFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("all")}
              >
                All
              </Button>
              <Button
                variant={categoryFilter === "fabric" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("fabric")}
              >
                Fabric
              </Button>
              <Button
                variant={
                  categoryFilter === "client_approval" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setCategoryFilter("client_approval")}
              >
                Client
              </Button>
              <Button
                variant={categoryFilter === "supplies" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("supplies")}
              >
                Supplies
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showResolved"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showResolved" className="text-sm">
                Show resolved
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Waiting For</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.isResolved ? "opacity-60" : ""}
                >
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        {isOverdue(item.expectedDate) && !item.isResolved && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        {item.projectName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.clientName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{item.description}</div>
                      {item.notes && (
                        <div className="mt-1 text-xs text-gray-500">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(item.category)}
                      <span className="text-sm">
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span
                        className={
                          isOverdue(item.expectedDate) && !item.isResolved
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {formatDate(item.expectedDate)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.daysSinceCreated} days ago
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!item.isResolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkResolved(item.id)}
                        >
                          Mark Resolved
                        </Button>
                      )}
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
