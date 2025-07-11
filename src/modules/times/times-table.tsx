import { useOverlay } from "@/components/overlay";
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
import { ScrollAreaWithShadows } from "@/components/scroll-area-with-shadows";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConvexType } from "@/utils/convex-type";
import { formatHours } from "@/utils/number-formatters";
import { formatTime } from "@/utils/time-formatters";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EditTimeForm } from "./edit-time-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getEndOfDay, getStartOfDay } from "@/utils/date-utils";

export function TimesTable() {
  const overlay = useOverlay();
  const [timeEntryFilter, setTimeEntryFilter] = useState("");
  const [timeEntryToDelete, setTimeEntryToDelete] =
    useState<Id<"times"> | null>(null);

  const dateRange = useMemo(() => {
    return {
      start: getStartOfDay(),
      end: getEndOfDay(),
    };
  }, []);

  const times =
    useQuery(api.times.all, {
      dateRange,
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

  const showEditForm = (time: ConvexType<"times.all">[number]) => {
    overlay.show(
      <Dialog open={true} onOpenChange={() => overlay.close()}>
        <DialogTitle>Edit Time Entry</DialogTitle>
        <DialogContent>
          <EditTimeForm
            id={time._id}
            onSuccess={() => overlay.close()}
            onCancel={() => overlay.close()}
          />
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className="w-full sm-non-card">
      <CardHeader className="max-sm:p-0">
        <div className="flex flex-col justify-between gap-3 sm:items-center sm:flex-row max-sm:pb-5">
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
      <CardContent className="max-sm:p-0">
        <ScrollAreaWithShadows
          className="xl:max-h-[calc(100vh-297px)] overflow-auto"
          orientation="both"
          shadowColor="rgb(0, 0, 0)"
          shadowOpacity={0.1}
          animationDuration="300ms"
        >
          <Table className="">
            <TableHeader>
              <TableRow className="">
                <TableHead className="min-w-40">Employee</TableHead>
                <TableHead className="text-right min-w-24">Time In</TableHead>
                <TableHead className="text-right min-w-24">Time Out</TableHead>
                <TableHead className="text-right min-w-24">Total</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {filteredTimeEntries.map((entry) => (
                <TableRow
                  key={entry._id}
                  className=""
                  onClick={() => showEditForm(entry)}
                >
                  <TableCell className="">
                    {entry.employee?.nameFirst} {entry.employee?.nameLast}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatTime(entry.startTime)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatTime(entry.endTime)}
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
        </ScrollAreaWithShadows>
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
