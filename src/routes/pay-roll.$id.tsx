import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { PayScheduleEmployeeRow } from "@/modules/pay-schedule/pay-schedule-employee-row";
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
  const payRoll = useQuery(api.paySchedule.get, { id });

  if (!payRoll) return null;

  return (
    <div className=" h-[calc(100vh-65px)]   p-4">
      <h1 className="text-lg font-bold">{payRoll?.name}</h1>
      <div>
        {payRoll?.employees.map((employee) => (
          <PayScheduleEmployeeRow key={employee._id} employee={employee} />
        ))}
      </div>
    </div>
  );
}
