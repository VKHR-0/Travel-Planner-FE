import Link from "next/link"
import { CreateProjectForm } from "@/components/projects/create-project-form"

export default function NewProjectPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center p-6">
      <div className="w-full space-y-4">
        <Link
          className="border-border bg-background inline-flex h-8 w-fit items-center rounded-lg border px-3 text-sm font-medium"
          href="/"
        >
          Back to projects
        </Link>
        <CreateProjectForm />
      </div>
    </main>
  )
}
