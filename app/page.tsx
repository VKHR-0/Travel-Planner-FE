import { CreateProjectForm } from "@/components/projects/create-project-form"
import { ProjectsList } from "@/components/projects/projects-list"

export default function Page() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Travel Projects Management</h1>
        <p className="text-muted-foreground">
          Browse all travel projects synced from your backend API.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(300px,380px)_1fr] lg:items-start">
        <CreateProjectForm />
        <ProjectsList />
      </div>
    </main>
  )
}
