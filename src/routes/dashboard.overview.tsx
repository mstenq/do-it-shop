import { HourlyEmployeeCard } from "@/modules/employees/hourly-employee-card";
import { TimesTable } from "@/modules/times/times-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/overview")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div className="flex h-full gap-6">
        <HourlyEmployeeCard />
        <TimesTable />
      </div>
    </div>
  );
}
