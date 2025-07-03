import { PageTabs } from "@/components/page-tabs";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { ImageUploadInput } from "@/components/ui/image-upload-input";
import { api } from "@convex/api";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import {
  CalendarIcon,
  IdCardIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  BuildingIcon,
  ClockIcon,
} from "lucide-react";
import { useState, useTransition } from "react";

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
  const employee = useQuery(api.employees.get, { _id: id });
  const updateEmployee = useMutation(api.employees.update);

  if (!employee) return null;

  const fullName = `${employee.nameFirst} ${employee.nameLast}`;

  const handlePhotoUpload = async (storageId: string | undefined) => {
    if (!employee._id) return;
    startTransition(async () => {
      try {
        await updateEmployee({
          _id: employee._id,
          photoStorageId: storageId as any,
        });
      } catch (error) {
        console.error("Failed to update driver's license photo:", error);
      }
    });
  };

  return (
    <div className="flex flex-col h-full gap-4 xl:flex-row">
      <div className="xl:min-w-[380px] py-4 pl-4">
        <div className="flex items-center">
          <span className="p-1 text-xs border rounded bg-muted">
            # {employee.id}
          </span>
          <Spacer />
          <Button variant="outline" className="" asChild>
            <Link to="." search={{ showEdit: employee.id }}>
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

          {employee.department && (
            <div>
              <div className="text-xs text-muted-foreground">Department</div>
              <div className="flex items-center gap-1">
                <BuildingIcon className="w-3 h-3" />
                <span>{employee.department}</span>
              </div>
            </div>
          )}

          {(employee.level || employee.grade) && (
            <div>
              <div className="text-xs text-muted-foreground">Level / Grade</div>
              <div className="flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                <span>
                  {[employee.level, employee.grade].filter(Boolean).join(" / ")}
                </span>
              </div>
            </div>
          )}

          <ImageUploadInput
            existingImageUrl={employee.photo}
            value={employee.photoStorageId}
            onChange={handlePhotoUpload}
            disabled={isUpdatingPhoto}
            placeholder="Upload employees photo"
          />
        </div>
      </div>
      <main className="w-full h-full p-4 border-l">
        <PageTabs
          tabs={[
            {
              label: "Details",
              path: "/employees/$id",
            },
            {
              label: "Schedule",
              path: "/employees/$id/schedule",
            },
            {
              label: "Time Off",
              path: "/employees/$id/time-off",
            },
          ]}
        />
        <div className="pt-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
