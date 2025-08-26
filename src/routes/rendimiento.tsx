import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/rendimiento')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/rendimiento"!</div>
}
