import got, { HTTPError } from "got"
import { ApiError, type ApiErrorPayload, getApiErrorMessage } from "@/lib/api/errors"

const BACKEND_API_BASE_URL =
  process.env.TRAVEL_API_BASE_URL ?? "http://127.0.0.1:8000"

const backendClient = got.extend({
  prefixUrl: BACKEND_API_BASE_URL,
  responseType: "json",
  throwHttpErrors: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export async function backendRequest<TResponse>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE"
    json?: unknown
  },
): Promise<TResponse> {
  try {
    const response = await backendClient(path, options)
    return response.body as TResponse
  } catch (error) {
    if (error instanceof HTTPError) {
      const payload = error.response.body as ApiErrorPayload | undefined
      const status = error.response.statusCode
      throw new ApiError(
        status,
        getApiErrorMessage(status, error.response.statusMessage ?? "", payload),
        payload,
      )
    }

    throw new ApiError(500, "Unable to reach backend API")
  }
}
