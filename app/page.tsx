import { ProjectsList } from "@/components/projects/projects-list"

export default function Page() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 p-6">
      <header className="space-y-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Travel Projects Management</h1>
          <p className="text-muted-foreground">
            Browse all travel projects synced from your backend API.
          </p>
        </div>
      </header>

      <ProjectsList />
    </main>
  )
}
