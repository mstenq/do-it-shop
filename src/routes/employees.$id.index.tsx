import { DataTable } from "@/components/data-table";
import { useOverlay } from "@/components/overlay";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStableQuery } from "@/hooks/use-stable-query";
import { CreateTimeForm, EditTimeForm, useTimesColumns } from "@/modules/times";
import { ConvexType } from "@/utils/convex-type";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/employees/$id/")({
  component: PaySheduleLoader,
});

function PaySheduleLoader() {
  const start = dayjs().subtract(6, "months").valueOf();
  const end = dayjs().add(2, "weeks").valueOf();
  const paySchedule = useQuery(api.paySchedule.all, { start, end });
  if (!paySchedule) {
    return (
      <div className="grid w-full  h-[calc(100vh-160px)] place-items-center">
        Loading...
      </div>
    );
  }
  return <RouteComponent paySchedule={paySchedule} />;
}

function RouteComponent({
  paySchedule,
}: {
  paySchedule: ConvexType<"paySchedule.all">;
}) {
  console.log("Pay Schedule Data:", paySchedule);
  const overlay = useOverlay();
  const params = Route.useParams();
  const employeeId = String(params.id) as Id<"employees">;
  const [startDate, setStartDate] = useState<Date | undefined>(
    paySchedule?.[0]?.startDate ? new Date(paySchedule[0].startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    paySchedule?.[0]?.endDate ? new Date(paySchedule[0].endDate) : undefined
  );

  // Prepare date range for query
  const dateRange =
    startDate || endDate
      ? {
          start: startDate ? startDate.getTime() : undefined,
          end: endDate ? endDate.getTime() : undefined,
        }
      : undefined;

  // Use the stable paginated query hook
  const data =
    useStableQuery(api.times.all, {
      employeeId,
      dateRange,
    }) ?? [];

  const { columns, groupBy } = useTimesColumns();

  const selectedPaySchedule = useMemo(() => {
    return paySchedule.find(
      (item) =>
        item.startDate === startDate?.getTime() &&
        item.endDate === endDate?.getTime()
    )?._id;
  }, [paySchedule, startDate, endDate]);

  const handleScheduleChange = (value: string) => {
    const foundSchedule = paySchedule.find((item) => item._id === value);
    if (foundSchedule) {
      setStartDate(new Date(foundSchedule.startDate));
      setEndDate(new Date(foundSchedule.endDate));
    }
  };

  const showCreateForm = () => {
    overlay.show(
      <Dialog open={true} onOpenChange={() => overlay.close()}>
        <DialogTitle>Add Time Entry</DialogTitle>
        <DialogContent>
          <CreateTimeForm
            employeeId={employeeId}
            onSuccess={() => overlay.close()}
            onCancel={() => overlay.close()}
          />
        </DialogContent>
      </Dialog>
    );
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
    <div className="space-y-4">
      <div className="p-0">
        <div className="flex flex-row items-end justify-between gap-4 pt-2 pb-2">
          <div>
            <CardTitle>Timesheet</CardTitle>
            <CardDescription>Time entries for this employee</CardDescription>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <label className="block mb-1 text-xs font-medium">
                Pay Period
              </label>
              <Select
                value={selectedPaySchedule}
                onValueChange={handleScheduleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pay period" />
                </SelectTrigger>
                <SelectContent>
                  {paySchedule.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name} -{" "}
                      <span className="text-muted-foreground">
                        {dayjs(item.startDate).format("M/D/YYYY")} -{" "}
                        {dayjs(item.endDate).format("M/D/YYYY")}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate ? startDate.toISOString().slice(0, 10) : ""}
                onChange={(e) =>
                  setStartDate(
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className="w-36"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium">End Date</label>
              <Input
                type="date"
                value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                onChange={(e) =>
                  setEndDate(
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className="w-36"
              />
            </div>

            <Button onClick={showCreateForm}>Add Time</Button>
          </div>
        </div>
        <div className="">
          <DataTable
            id="times-table"
            data={data}
            columns={columns}
            activeColumnIds={["date", "startTime", "endTime", "totalTime"]}
            groupBy={groupBy}
            className="max-h-[calc(100svh-190px)]"
            sorting={[
              { id: "week", desc: true },
              { id: "date", desc: false },
            ]}
            hideSearch
            onRowClick={showEditForm}
          />
        </div>
      </div>
    </div>
  );
}
