import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/estrategia')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/estrategia"!</div>
}
