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
import { useState } from "react";
import { Button } from "./ui/button";

type Props = {
  session: Session | null;
  currentVersion: number | null;
  latestVersion: number | null;
};

export const MainNav = ({ session, currentVersion, latestVersion }: Props) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  return (
    <div className={cn(`col-span-2 xl:col-span-1 xl:border-r`)}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-[--mobile-nav-height] items-center justify-between  border-b bg-muted  p-3 xl:border-b-0">
          <div className="flex items-center gap-2 font-bold">
            <Hammer />
            Do It Shop Manager
          </div>
          <Button
            className=" xl:hidden"
            variant="outline"
            size="icon"
            onClick={() => setIsMobileOpen((p) => !p)}
          >
            {!isMobileOpen ? <Menu /> : <X />}
          </Button>
        </div>

        {/* Collapsible Content */}
        <div className="h-full">
          <div
            className={cn(
              `duration-400 absolute z-10 h-full w-full bg-white/80 backdrop-blur-lg transition-all dark:bg-black/80 xl:static xl:bg-muted/100 dark:xl:bg-muted`,
              !isMobileOpen &&
                "max-h-[0px] overflow-hidden opacity-0 xl:max-h-[unset] xl:opacity-100",
              isMobileOpen &&
                "scroll max-h-[70vh] overflow-y-auto opacity-100 shadow-lg  xl:max-h-[unset]  xl:shadow-none ",
            )}
          >
            <div className="flex h-full flex-col justify-between px-4 pb-4">
              <div>
                <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
                  <span>v.{currentVersion}</span>
                  <DbUpdater
                    latestVersion={latestVersion}
                    currentVersion={currentVersion}
                  />
                </div>

                <nav className="flex flex-col gap-4 pb-10">
                  <Link href="/" className="flex items-center gap-2">
                    <Search className="w-4" /> Search
                  </Link>
                  <Link href="/" className="flex items-center gap-2">
                    <Bell className="w-4" /> Notifications
                  </Link>
                </nav>
                <nav className="flex flex-col gap-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-primary dark:text-violet-400 "
                  >
                    <Gauge className="w-4" /> Dashboard
                  </Link>
                  <Link href="/users" className="flex items-center gap-2">
                    <Users className="w-4" /> Users
                  </Link>
                  <Link href="/" className="flex items-center gap-2">
                    <CircleDollarSign className="w-4" /> Payroll
                  </Link>
                  <Link href="/projects" className="flex items-center gap-2">
                    <FolderInput className="w-4" /> Projects
                  </Link>
                  <Link href="/" className="flex items-center gap-2">
                    <ListChecks className="w-4" /> Tasks
                  </Link>
                  <Link href="/" className="flex items-center gap-2">
                    <Settings className="w-4" /> Settings
                  </Link>
                </nav>
              </div>
              <div className="flex items-center justify-between gap-2 pt-4">
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
