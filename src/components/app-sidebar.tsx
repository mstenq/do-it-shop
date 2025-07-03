import { House, IdCardIcon } from "lucide-react";
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
import { NavEvents } from "./nav-events";
import { ModeToggle } from "./mode-toggle";

// This is sample data.
const useDate = () => {
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: House,
        isActive: true,
        items: [],
      },
      {
        title: "Employees",
        url: "/employees",
        icon: IdCardIcon,
        items: [
          {
            title: "Positions",
            url: "/positions",
          },
        ],
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
        <ModeToggle />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
