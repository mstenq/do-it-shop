import { DataTable } from "@/components/data-table";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStableQuery } from "@/hooks/use-stable-query";
import { useTimesColumns } from "@/modules/times/use-times-columns";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/employees/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const employeeId = String(params.id) as Id<"employees">;
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(2025, 5, 22)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(2025, 6, 5)
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

  return (
    <div className="space-y-4">
      <div className="p-0">
        <div className="flex flex-row items-start justify-between gap-4 pt-2 pb-2">
          <div>
            <CardTitle>Timesheet</CardTitle>
            <CardDescription>Time entries for this employee</CardDescription>
          </div>
          <div className="flex items-end gap-4">
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
          />
        </div>
      </div>
    </div>
  );
}
