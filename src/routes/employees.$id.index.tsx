import { api } from "@convex/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadInput } from "@/components/ui/image-upload-input";
import { Button } from "@/components/ui/button";
import {
  UserIcon,
  IdCardIcon,
  CalendarIcon,
  MapPinIcon,
  MailIcon,
  PhoneIcon,
  BuildingIcon,
  ClockIcon,
  FileImageIcon,
  AlertCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { Badge } from "@/components/ui/badge";
import { PositionBadges } from "@/modules/positions/position-badges";

export const Route = createFileRoute("/employees/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const employee = useQuery(api.employees.get, { _id: id });
  const updateEmployee = useMutation(api.employees.update);

  if (!employee) return null;

  const fullName = `${employee.nameFirst} ${employee.nameLast}`;
  const formattedAddress = employee.address
    ? [
        employee.address.street,
        employee.address.city,
        employee.address.state,
        employee.address.zipCode,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Full Name
              </div>
              <div className="text-lg">{fullName}</div>
            </div>

            {employee.email && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Email
                </div>
                <div className="flex items-center gap-2">
                  <MailIcon className="w-4 h-4 text-muted-foreground" />
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
                <div className="text-sm font-medium text-muted-foreground">
                  Phone Number
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={`tel:${employee.phoneNumber}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {employee.phoneNumber}
                  </a>
                </div>
              </div>
            )}

            {employee.dateOfBirth && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Date of Birth
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {new Date(employee.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {formattedAddress && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Address
                </div>
                <div className="flex items-start gap-2">
                  <MapPinIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{formattedAddress}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BuildingIcon className="w-4 h-4" />
              Event Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employee.positions?.[0] && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Position:
                </span>
                <PositionBadges positions={employee.positions} />
              </div>
            )}
            {employee.department && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Department
                </div>
                <div>{employee.department}</div>
              </div>
            )}

            {(employee.level || employee.grade) && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Level / Grade
                </div>
                <div>
                  {[employee.level, employee.grade].filter(Boolean).join(" / ")}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
