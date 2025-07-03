import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { createContext, useContext, useState } from "react";

// Dashboard context for sharing state across routes
interface DashboardContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider"
    );
  }
  return context;
};

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: ({ location }) => {
    if (location.pathname === "/dashboard") {
      throw redirect({ to: "/dashboard/overview" }); // Redirect to overview if no specific route is provided
    }
  },
});

function DashboardLayout() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <DashboardContext.Provider value={{ selectedDate, setSelectedDate }}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Event management overview for {format(new Date(), "MMMM d, yyyy")}
            </p>
          </div>

          {/* Global Date Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[240px] justify-start text-left font-normal")}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8">
            <Link
              to="/dashboard/overview"
              className="data-[status=active]:border-primary data-[status=active]:text-primary border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 "
            >
              Overview
            </Link>
            <Link
              to="/dashboard/scheduling"
              className="data-[status=active]:border-primary data-[status=active]:text-primary border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              Scheduling
            </Link>
            <Link
              to="/dashboard/follow-ups"
              className="data-[status=active]:border-primary data-[status=active]:text-primary border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              Follow Ups
            </Link>
          </nav>
        </div>

        {/* Tab Content */}
        <Outlet />
      </div>
    </DashboardContext.Provider>
  );
}
