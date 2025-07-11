import {
  CircleCheckIcon,
  House,
  IdCardIcon,
  PiggyBankIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";
import { NavEvents } from "./nav-events";

// This is sample data.
const useDate = () => {
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard/",
        icon: House,
        isActive: true,
        items: [],
      },
      {
        title: "Employees",
        url: "/employees",
        icon: IdCardIcon,
      },
      {
        title: "Pay Roll",
        url: "/pay-roll",
        icon: PiggyBankIcon,
      },
      {
        title: "Customers",
        url: "/customers",
        icon: UsersIcon,
      },
      {
        title: "Jobs",
        url: "/jobs",
        icon: CircleCheckIcon,
      },
    ],
  };
  return data;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = useDate();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavEvents />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center ">
          <ModeToggle />
          <NavUser />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
