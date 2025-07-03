import { useStableQuery } from "@/hooks/use-stable-query";
import { Id } from "@convex/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import { useTimesColumns } from "@/modules/times/use-times-columns";
import { TimesRow } from "@/modules/times/types";

export const Route = createFileRoute("/employees/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const employeeId = String(params.id) as Id<"employees">;
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Prepare date range for query
  const dateRange =
    startDate || endDate
      ? {
          start: startDate
            ? startDate.toISOString().slice(0, 10)
            : "1000-01-01",
          end: endDate ? endDate.toISOString().slice(0, 10) : "3000-01-01",
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
      <Card className="p-0">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
          <div>
            <CardTitle>Timesheet</CardTitle>
            <CardDescription>
              All time entries for this employee
            </CardDescription>
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
        </CardHeader>
        <div className="p-4 pt-0">
          <DataTable
            id="times-table"
            data={data}
            columns={columns}
            groupBy={groupBy}
            sorting={[
              { id: "week", desc: true },
              { id: "date", desc: true },
            ]}
            hideSearch
          />
        </div>
      </Card>
    </div>
  );
}
