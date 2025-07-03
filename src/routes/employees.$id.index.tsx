import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employees/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employees/$id/"!</div>
}
