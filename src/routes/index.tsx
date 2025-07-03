import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    throw redirect({
      to: "/dashboard",
    });
  },
});

function RouteComponent() {
  return <div>Redirecting to dashboard...</div>;
}
