import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/customers/$id")({
  component: RouteComponent,
  beforeLoad() {
    return {
      title: "Customer Details",
    };
  },
});

function RouteComponent() {
  return <div>Hello "/customers/$id"!</div>;
}
