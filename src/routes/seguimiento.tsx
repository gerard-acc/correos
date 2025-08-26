import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/seguimiento')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/seguimiento"!</div>
}
