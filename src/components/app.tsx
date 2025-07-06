import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useOrganization } from "@clerk/clerk-react";
import {
  Outlet,
  useRouteContext,
  useRouterState,
} from "@tanstack/react-router";
import { TooltipProvider } from "./ui/tooltip";
import { useMemo } from "react";

export function App() {
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
