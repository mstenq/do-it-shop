import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: ({ location }) => {
    if (location.pathname === "/dashboard") {
      throw redirect({ to: "/dashboard/overview" }); // Redirect to overview if no specific route is provided
    }
  },
});

function DashboardLayout() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
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
            to="/dashboard/projects"
            className="data-[status=active]:border-primary data-[status=active]:text-primary border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            Projects
          </Link>
          <Link
            to="/dashboard/waiting-on"
            className="data-[status=active]:border-primary data-[status=active]:text-primary border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            Waiting On
          </Link>
        </nav>
      </div>

      {/* Tab Content */}
      <Outlet />
    </div>
  );
}
