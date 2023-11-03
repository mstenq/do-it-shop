"use client";

import { type Session } from "@/schemas/sessionSchema";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { api } from "@/trpc/react";
import { ArrowRightLeft, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/utils";

type OrganizationSwitcherProps = {
  session: Session | null;
};

export const OrganizationSwitcher = ({
  session,
}: OrganizationSwitcherProps) => {
  console.log({ session });
  const userId = session?.user.id;
  const { data: user, isLoading } = api.user.get.useQuery(userId ?? -1, {
    enabled: Boolean(userId),
  });

  const { mutate: createTenant } = api.tenant.create.useMutation({
    onSuccess(data) {
      window.location.replace("/tenants/" + data.id);
    },
  });

  const { mutate: switchTenant } = api.user.switchTenant.useMutation({
    onSuccess(_data, variables) {
      //router refresh is not refreshing tokens access in root layout
      window.location.replace("/tenants/" + variables.tenantId);
    },
  });

  if (!session) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <div className="py-2 text-right">
            <div className="text-sm">
              {session.user.firstName} {session.user.lastName}
            </div>
            <div className="text-muted-foreground text-xs font-thin">Admin</div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-80">
        {isLoading && <div>Loading...</div>}
        {user && (
          <div>
            <p className="text-muted-foreground p-2 text-xs">
              SWITCH ORGANIZATIONS
            </p>
            <div className="space-y-2">
              {user.tenantAccess.map((access) => (
                <button
                  key={access.id}
                  onClick={() => switchTenant({ tenantId: access.tenantId })}
                  className={cn(
                    "group flex w-full items-center rounded p-2 text-left transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-900",
                    session.currentTenantId == access.tenantId &&
                      "bg-violet-50 hover:bg-violet-100 dark:bg-violet-950 dark:hover:bg-violet-900",
                  )}
                >
                  <div className="flex-grow">
                    <div>{access?.tenant.companyName}</div>
                    <p className="text-muted-foreground text-xs">
                      {access?.tenant?.dbUrl}
                    </p>
                  </div>
                  <div>
                    {session.currentTenantId !== access.tenantId ? (
                      <ArrowRightLeft className="text-muted-foreground group-hover:text-primary mr-2 w-4 transition-all delay-75 duration-500" />
                    ) : (
                      <Check className="text-primary group-hover:text-primary mr-2 w-4 transition-all delay-75 duration-500 dark:group-hover:text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-3">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() =>
                  createTenant({
                    companyName: "New Organization",
                  })
                }
              >
                Create New Organization
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
