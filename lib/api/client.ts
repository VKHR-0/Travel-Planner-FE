import ky, { HTTPError, type Options } from "ky"
import { ApiError, type ApiErrorPayload, getApiErrorMessage } from "@/lib/api/errors"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api"

function normalizePath(path: string): string {
  return path.replace(/^\//, "")
}

function buildUrl(path: string): string {
  const normalizedPath = normalizePath(path)
  const base = API_BASE_URL.replace(/\/$/, "")

  return `${base}/${normalizedPath}`
}

const apiClient = ky.create({
  headers: {
    "Content-Type": "application/json",
  },
})

async function parseErrorPayload(response: Response): Promise<ApiErrorPayload | undefined> {
  try {
    return (await response.json()) as ApiErrorPayload
  } catch {
    return undefined
  }
}

export async function apiRequest<TResponse>(path: string, options?: Options): Promise<TResponse> {
  try {
    const response = await apiClient(buildUrl(path), options)

    if (response.status === 204) {
      return undefined as TResponse
    }

    return (await response.json()) as TResponse
  } catch (error) {
    if (error instanceof HTTPError) {
      const payload = await parseErrorPayload(error.response)
      throw new ApiError(
        error.response.status,
        getApiErrorMessage(error.response.status, error.response.statusText, payload),
        payload,
      )
    }

    throw new ApiError(500, "Unable to reach API")
  }
}
