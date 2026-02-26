import { NextResponse } from "next/server"
import { ApiError } from "@/lib/api/errors"
import {
  type ProjectCreateRequest,
  type ProjectResponse,
  type ProjectWithPlacesResponse,
} from "@/lib/api/projects"
import { backendRequest } from "@/lib/server/backend-client"

function handleRouteError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        message: error.message,
        detail: error.payload?.detail,
      },
      { status: error.status },
    )
  }

  return NextResponse.json(
    {
      message: "Unexpected server error",
    },
    { status: 500 },
  )
}

export async function GET() {
  try {
    const projects = await backendRequest<ProjectResponse[]>("projects")
    return NextResponse.json(projects)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ProjectCreateRequest
    const project = await backendRequest<ProjectWithPlacesResponse>("projects", {
      method: "POST",
      json: payload,
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return handleRouteError(error)
  }
}
