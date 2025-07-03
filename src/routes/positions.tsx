import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { EditPosition } from "@/modules/positions/edit-position";
import { NewPosition } from "@/modules/positions/new-position";
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

export const Route = createFileRoute("/positions")({
  component: RouteComponent,
  validateSearch: zodValidator(rootSearchSchema),
  beforeLoad: () => {
    return { title: "Positions" };
  },
  search: {
    middlewares: [stripSearchParams(defaultSearch)],
  },
});

function RouteComponent() {
  const location = useLocation();

  return (
    <>
      <AppHeader>
        <Button variant="outline" className="" asChild>
          <Link to={location.pathname} search={{ showAdd: true }}>
            New
          </Link>
        </Button>
      </AppHeader>

      <Outlet />
      <NewPosition />
      <EditPosition />
    </>
  );
}
