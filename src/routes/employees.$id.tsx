import { PageTabs } from "@/components/page-tabs";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { ImageUploadInput } from "@/components/ui/image-upload-input";
import { api } from "@convex/api";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { BuildingIcon, MailIcon, PhoneIcon, UserIcon } from "lucide-react";
import { useTransition } from "react";

export const Route = createFileRoute("/employees/$id")({
  beforeLoad: async ({ params }: { params: any }) => {
    return {
      title: "Employee Details",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const [isUpdatingPhoto, startTransition] = useTransition();
  const employee = useQuery(api.employees.get, { id });
  const updateEmployee = useMutation(api.employees.update);

  if (!employee) return null;

  const fullName = `${employee.nameFirst} ${employee.nameLast}`;

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] gap-4 xl:flex-row">
      <div className="xl:min-w-[380px] py-4 pl-4">
        <div className="flex items-center">
          <Spacer />
          <Button variant="outline" className="" asChild>
            <Link to="." search={{ showEdit: employee._id }}>
              Edit
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-4 py-4">
          <div>
            <div className="text-xs text-muted-foreground">Full Name</div>
            <div className="text-lg font-semibold">{fullName}</div>
          </div>

          {employee.email && (
            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="flex items-center gap-1">
                <MailIcon className="w-3 h-3" />
                <a
                  href={`mailto:${employee.email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {employee.email}
                </a>
              </div>
            </div>
          )}

          {employee.phoneNumber && (
            <div>
              <div className="text-xs text-muted-foreground">Phone</div>
              <div className="flex items-center gap-1">
                <PhoneIcon className="w-3 h-3" />
                <a
                  href={`tel:${employee.phoneNumber}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {employee.phoneNumber}
                </a>
              </div>
            </div>
          )}

          {employee.photo && (
            <img
              src={employee.photo}
              alt="Employee Photo"
              className="object-cover border rounded"
            />
          )}
        </div>
      </div>
      <main className="w-full p-4 border-l">
        <div className="">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
