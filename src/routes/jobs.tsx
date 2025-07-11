import { AppHeader } from "@/components/app-header";
import { RecordNavigation } from "@/components/record-navigation";
import { Button } from "@/components/ui/button";
import { EditJob, NewJob } from "@/modules/jobs";
import {
  createFileRoute,
  Link,
  Outlet,
  stripSearchParams,
  useLocation,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const defaultSearch = {
  showAdd: false,
  showEdit: "",
} as const;

const rootSearchSchema = z.object({
  showAdd: z.boolean().default(defaultSearch.showAdd),
  showEdit: z.string().default(defaultSearch.showEdit),
});

export const Route = createFileRoute("/jobs")({
  component: RouteComponent,
  validateSearch: zodValidator(rootSearchSchema),
  beforeLoad: () => {
    return { title: "Jobs" };
  },
  search: {
    middlewares: [stripSearchParams(defaultSearch)],
  },
});

function RouteComponent() {
  const location = useLocation();
  const search = Route.useSearch();

  return (
    <>
      <AppHeader>
        {/* <RecordNavigation storageKey="/jobs/$id" /> */}

        <Button variant="outline" className="" asChild>
          <Link to={location.pathname} search={{ showAdd: true }}>
            New
          </Link>
        </Button>
      </AppHeader>

      <Outlet />
      <NewJob />
      <EditJob />
    </>
  );
}
