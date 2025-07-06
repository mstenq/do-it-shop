import { AppHeader } from "@/components/app-header";
import { RecordNavigation } from "@/components/record-navigation";
import {
  createFileRoute,
  Outlet,
  stripSearchParams,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const defaultSearch = {} as const;

const rootSearchSchema = z.object({});

export const Route = createFileRoute("/pay-roll")({
  component: RouteComponent,
  validateSearch: zodValidator(rootSearchSchema),
  beforeLoad: () => {
    return { title: "Pay Roll" };
  },
  search: {
    middlewares: [stripSearchParams(defaultSearch)],
  },
});

function RouteComponent() {
  return (
    <>
      <AppHeader>
        <RecordNavigation storageKey="/pay-roll" />
      </AppHeader>
      <Outlet />
    </>
  );
}
