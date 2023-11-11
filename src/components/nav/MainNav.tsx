"use client";
import "@/styles/globals.css";
import "@/styles/grids.css";

import {
  Bell,
  CircleDollarSign,
  FolderInput,
  Gauge,
  Hammer,
  ListChecks,
  Menu,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";

import { DarkModeToggle } from "@/components/DarkModeToggle";
import { DbUpdater } from "@/components/DbUpdater";
import { OrganizationSwitcher } from "@/components/OrganizationSwitcher";
import { type Session } from "@/schemas/sessionSchema";
import { cn } from "@/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { MainNavItem } from "./MainNavItem";
import { useMobileMenuOpenAtom } from "@/atoms";
import { type PropsWithChildren } from "react";

type Props = {
  session: Session | null;
  currentVersion: number | null;
  latestVersion: number | null;
};

const NavigationContainer = ({ children }: PropsWithChildren) => (
  <nav className="grid grid-cols-1 px-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-1 xl:gap-1">
    {children}
  </nav>
);

export const MainNav = ({ session, currentVersion, latestVersion }: Props) => {
  // const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isOpen, toggle } = useMobileMenuOpenAtom();
  return (
    <div className={cn(`col-span-2 xl:col-span-1 xl:border-r`)}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-[--mobile-nav-height] items-center justify-between border-b  bg-muted p-3  pl-8 xl:border-b-0">
          <div className="flex items-center gap-2 font-bold">
            <Hammer />
            Do It Shop Manager
          </div>
          <Button
            className=" xl:hidden"
            variant="outline"
            size="icon"
            onClick={toggle}
          >
            {!isOpen ? <Menu /> : <X />}
          </Button>
        </div>

        {/* Collapsible Content */}
        <div className="h-full">
          <div
            className={cn(
              `duration-400 absolute z-10 w-full rounded-b-xl bg-white/80 backdrop-blur-lg transition-all dark:bg-black/80 xl:static xl:h-full xl:rounded-b-none xl:bg-muted/100 dark:xl:bg-muted`,
              !isOpen &&
                "max-h-[0px] overflow-hidden opacity-0 xl:max-h-[unset] xl:opacity-100",
              isOpen &&
                "scroll max-h-[70vh] overflow-y-auto opacity-100 shadow-lg  xl:max-h-[unset]  xl:shadow-none ",
            )}
          >
            <div className="flex h-full flex-col justify-between px-4 pb-4">
              <div className="space-y-10 pt-6">
                {/* DB Updater */}
                <div className="flex items-center gap-2 px-4 text-xs text-muted-foreground">
                  <span>v.{currentVersion}</span>
                  <DbUpdater
                    latestVersion={latestVersion}
                    currentVersion={currentVersion}
                  />
                </div>

                {/* Search and Notifications */}
                <NavigationContainer>
                  <MainNavItem href="/search" icon={<Search />} exact>
                    Search
                  </MainNavItem>
                  <MainNavItem href="/notifications" icon={<Bell />} exact>
                    Notifications
                  </MainNavItem>
                </NavigationContainer>

                {/* Main Navigation */}
                <NavigationContainer>
                  <MainNavItem href="/" icon={<Gauge />} exact>
                    Dashboard
                  </MainNavItem>
                  <MainNavItem href="/users" icon={<Users />}>
                    Users
                  </MainNavItem>
                  <MainNavItem href="/payroll" icon={<CircleDollarSign />}>
                    Payroll
                  </MainNavItem>
                  <MainNavItem href="/projects" icon={<FolderInput />}>
                    Projects
                  </MainNavItem>
                  <MainNavItem href="/tasks" icon={<ListChecks />}>
                    Tasks
                  </MainNavItem>
                  <MainNavItem href="/settings" icon={<Settings />}>
                    Settings
                  </MainNavItem>
                </NavigationContainer>
              </div>
              <div className="flex items-center justify-between gap-2 pt-8">
                <OrganizationSwitcher session={session} />
                <DarkModeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
