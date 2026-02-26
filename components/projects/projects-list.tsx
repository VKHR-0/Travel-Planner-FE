"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api/errors"
import { listProjects, type ProjectResponse } from "@/lib/api/projects"

function formatDate(value: string | null): string {
  if (!value) {
    return "Not set"
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

function ProjectsListLoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {["a", "b", "c", "d"].map((item) => (
        <Card key={item}>
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-5 w-20" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function ProjectsListErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Could not load travel projects</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={onRetry} variant="outline">
          Retry
        </Button>
      </CardFooter>
    </Card>
  )
}

function ProjectsListEmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No travel projects yet</CardTitle>
        <CardDescription>
          Your projects will appear here after you create the first one.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function ProjectCard({ project }: { project: ProjectResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-1">{project.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {project.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">Start date:</span>{" "}
          {formatDate(project.start_date)}
        </p>
        <p>
          <span className="text-muted-foreground">Places:</span>{" "}
          {project.places_count}
        </p>
        <p>
          <span className="text-muted-foreground">Updated:</span>{" "}
          {formatDate(project.updated_at)}
        </p>
      </CardContent>
      <CardFooter className="justify-between">
        <Badge variant={project.completed ? "secondary" : "default"}>
          {project.completed ? "Completed" : "Active"}
        </Badge>
      </CardFooter>
    </Card>
  )
}

export function ProjectsList() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  })

  if (isPending) {
    return <ProjectsListLoadingState />
  }

  if (isError) {
    const message =
      error instanceof ApiError ? error.message : "Failed to fetch project data"

    return <ProjectsListErrorState message={message} onRetry={() => refetch()} />
  }

  if (!data || data.length === 0) {
    return <ProjectsListEmptyState />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button render={<Link href="/new" />}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Create project
        </Button>
        <Button disabled={isFetching} onClick={() => refetch()} variant="outline">
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className={isFetching ? "animate-spin" : ""} />
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
