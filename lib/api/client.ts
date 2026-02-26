import { ApiError, type ApiErrorPayload, getApiErrorMessage } from "@/lib/api/errors"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api"

function buildUrl(path: string): string {
  if (API_BASE_URL.startsWith("http://") || API_BASE_URL.startsWith("https://")) {
    return new URL(path, API_BASE_URL).toString()
  }

  const base = API_BASE_URL.replace(/\/$/, "")
  const normalizedPath = path.replace(/^\//, "")

  return `${base}/${normalizedPath}`
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) {
    return undefined
  }

  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

export async function apiRequest<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    const typedPayload = payload as ApiErrorPayload | undefined
    throw new ApiError(
      response.status,
      getApiErrorMessage(response.status, response.statusText, typedPayload),
      typedPayload,
    )
  }

  return payload as TResponse
}
