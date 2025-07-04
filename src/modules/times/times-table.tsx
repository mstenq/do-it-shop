import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatHours } from "@/utils/numberFormatters";
import { formatTimeString } from "@/utils/timeFormatters";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function TimesTable() {
  const [timeEntryFilter, setTimeEntryFilter] = useState("");
  const [timeEntryToDelete, setTimeEntryToDelete] =
    useState<Id<"times"> | null>(null);

  const times =
    useQuery(api.times.all, {
      dateRange: {
        start: new Date().toISOString().split("T")[0], // Start of today
        end: new Date().toISOString().split("T")[0], // End of today
      },
    }) ?? [];

  const destroyTimeEntry = useMutation(api.times.destroy);

  const filteredTimeEntries = times.filter(
    (entry) =>
      entry.employee?.nameFirst
        .toLowerCase()
        .includes(timeEntryFilter.toLowerCase()) ||
      entry.employee?.nameLast
        .toLowerCase()
        .includes(timeEntryFilter.toLowerCase())
  );

  const handleDeleteClick = (timeEntryId: Id<"times">) => {
    setTimeEntryToDelete(timeEntryId);
  };

  const handleConfirmDelete = async () => {
    if (timeEntryToDelete) {
      try {
        await destroyTimeEntry({ id: timeEntryToDelete as any });
        toast.success("Time entry deleted successfully");
        setTimeEntryToDelete(null);
      } catch (error) {
        toast.error("Failed to delete time entry");
      }
    }
  };

  const handleCancelDelete = () => {
    setTimeEntryToDelete(null);
  };

  return (
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
        <ScrollArea className=" max-h-[calc(100vh-297px)] overflow-y-auto">
          <ScrollBar orientation="vertical" />
          <Table className="">
            <TableHeader>
              <TableRow className="">
                <TableHead className="">Employee</TableHead>
                <TableHead className="text-right">Time In</TableHead>
                <TableHead className="text-right">Time Out</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-y-auto">
              {filteredTimeEntries.map((entry) => (
                <TableRow key={entry._id} className="">
                  <TableCell className="">
                    {entry.employee?.nameFirst} {entry.employee?.nameLast}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatTimeString(entry.startTime)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatTimeString(entry.endTime)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatHours(entry.totalTime)}
                  </TableCell>

                  <TableCell className="">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(entry._id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      <AlertDialog
        open={Boolean(timeEntryToDelete)}
        onOpenChange={(v) => setTimeEntryToDelete(v ? timeEntryToDelete : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time entry? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
