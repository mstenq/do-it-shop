import { AddressDisplay } from "@/components/address-display";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { UrlDisplay } from "@/components/url-display";
import { api } from "@convex/api";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex-helpers/react/cache";
import { NotebookIcon } from "lucide-react";

export const Route = createFileRoute("/jobs/$id")({
  beforeLoad: async () => {
    return {
      title: "Job Details",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const job = useQuery(api.jobs.get, { id });

  if (!job) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] gap-4 xl:flex-row">
      <div className="xl:min-w-[380px] py-4 pl-4 max-xl:pr-4">
        <div className="flex items-center">
          <div>
            <div className="text-xs text-muted-foreground">Job</div>
            <div className="text-lg font-semibold">{job.description}</div>
          </div>
          <Spacer />
          <Button variant="outline" className="" asChild>
            <Link to="." search={{ showEdit: job._id }}>
              Edit
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-4 py-4">
          {job.notes && (
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <NotebookIcon className="w-3 h-3" />
                Notes
              </div>
              <div className="text-sm">{job.notes}</div>
            </div>
          )}
        </div>
      </div>
      <main className="w-full p-4 border-l">
        <div className="">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
