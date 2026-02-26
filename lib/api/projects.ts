import { apiRequest } from "@/lib/api/client"

export type PlaceImportRequest = {
  external_id: number
  notes?: string | null
}

export type ProjectCreateRequest = {
  name: string
  description?: string | null
  start_date?: string | null
  places: PlaceImportRequest[]
}

export type ProjectPlaceResponse = {
  id: number
  project_id: number
  external_id: number
  title: string
  artist_title: string | null
  image_id: string | null
  notes: string | null
  visited: boolean
  created_at: string
  updated_at: string
}

export type ProjectResponse = {
  id: number
  name: string
  description: string | null
  start_date: string | null
  completed: boolean
  places_count: number
  created_at: string
  updated_at: string
}

export type ProjectWithPlacesResponse = ProjectResponse & {
  places: ProjectPlaceResponse[]
}

export async function listProjects(): Promise<ProjectResponse[]> {
  return apiRequest<ProjectResponse[]>("/projects")
}

export async function createProject(
  payload: ProjectCreateRequest,
): Promise<ProjectWithPlacesResponse> {
  return apiRequest<ProjectWithPlacesResponse>("/projects", {
    method: "POST",
    json: payload,
  })
}
