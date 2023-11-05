"use client";

import { type Session } from "@/schemas/sessionSchema";
import { api } from "@/trpc/react";
import { cn } from "@/utils";
import { ArrowRightLeft, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type OrganizationSwitcherProps = {
  session: Session | null;
};

export const OrganizationSwitcher = ({
  session,
}: OrganizationSwitcherProps) => {
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
    onSuccess() {
      //router refresh is not refreshing tokens access in root layout
      window.location.reload();
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
            <div className="text-xs font-thin text-muted-foreground">Admin</div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-80">
        {isLoading && <div>Loading...</div>}
        {user && (
          <div>
            <p className="p-2 text-xs text-muted-foreground">
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
                    <p className="text-xs text-muted-foreground">
                      {access?.tenant?.dbUrl}
                    </p>
                  </div>
                  <div>
                    {session.currentTenantId !== access.tenantId ? (
                      <ArrowRightLeft className="mr-2 w-4 text-muted-foreground transition-all delay-75 duration-500 group-hover:text-primary" />
                    ) : (
                      <Check className="mr-2 w-4 text-primary transition-all delay-75 duration-500 group-hover:text-primary dark:group-hover:text-white" />
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
