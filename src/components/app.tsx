import { AppSidebar } from "@/components/app-sidebar";
import { NavBreadcrumbs } from "@/components/nav-breadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { OrganizationList, useOrganization } from "@clerk/clerk-react";
import { api } from "@convex/api";
import { DataModel } from "@convex/dataModel";
import { Outlet } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { TooltipProvider } from "./ui/tooltip";

export function App() {
  const { organization } = useOrganization();

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* <header className="z-20 bg-background sticky top-0 border-b flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4 mr-2" />
              <NavBreadcrumbs items={breadcrumbs} />
            </div>
          </header> */}
          <div className="  min-h-[calc(100svh-theme(spacing.16))]">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
