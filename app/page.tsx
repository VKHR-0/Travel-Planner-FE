import Link from "next/link"
import { ProjectsList } from "@/components/projects/projects-list"

export default function Page() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Travel Projects Management</h1>
          <p className="text-muted-foreground">
            Browse all travel projects synced from your backend API.
          </p>
        </div>
        <Link
          className="bg-primary text-primary-foreground inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium"
          href="/new"
        >
          New Project
        </Link>
      </header>

      <ProjectsList />
    </main>
  )
}
