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
          <div className="  min-h-[calc(100svh-theme(spacing.16))]">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
