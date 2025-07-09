import { PrintForm } from "@/components/print-form";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { PayScheduleEmployeeRow } from "@/modules/pay-schedule/pay-schedule-employee-row";
import { PayScheduleSummary } from "@/modules/pay-schedule/pay-schedule-summary";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import { MailIcon, PhoneIcon } from "lucide-react";

export const Route = createFileRoute("/pay-roll/$id")({
  beforeLoad: async ({ params }: { params: any }) => {
    return {
      title: "Pay Roll Details",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const paySchedule = useQuery(api.paySchedule.get, { id });

  if (!paySchedule) return null;

  return (
    <div className=" min-h-[calc(100vh-65px)]   p-4">
      <h1 className="pb-3 text-lg font-bold">{paySchedule?.name}</h1>
      <div className="flex flex-col w-full gap-6 2xl:flex-row">
        <PrintForm name="Pay Roll Summary">
          <PayScheduleSummary paySchedule={paySchedule} />
        </PrintForm>
        <PrintForm
          name="Pay Roll Detail"
          className="2xl:max-h-[calc(100vh-140px)] overflow-y-auto"
        >
          <div>
            {paySchedule?.employees.map((employee) => (
              <PayScheduleEmployeeRow
                key={employee._id}
                employee={employee}
                paySchedule={paySchedule}
              />
            ))}
          </div>
        </PrintForm>
      </div>
    </div>
  );
}
