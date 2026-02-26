import ky, { HTTPError, type Options } from "ky"
import { ApiError, type ApiErrorPayload, getApiErrorMessage } from "@/lib/api/errors"

const BACKEND_API_BASE_URL =
  process.env.TRAVEL_API_BASE_URL ?? "http://127.0.0.1:8000"

const backendClient = ky.create({
  prefixUrl: `${BACKEND_API_BASE_URL.replace(/\/$/, "")}/`,
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

export async function backendRequest<TResponse>(
  path: string,
  options?: Options,
): Promise<TResponse> {
  try {
    const response = await backendClient(path.replace(/^\//, ""), options)

    if (response.status === 204) {
      return undefined as TResponse
    }

    return (await response.json()) as TResponse
  } catch (error) {
    if (error instanceof HTTPError) {
      const payload = await parseErrorPayload(error.response)
      const status = error.response.status
      throw new ApiError(
        status,
        getApiErrorMessage(status, error.response.statusText, payload),
        payload,
      )
    }

    throw new ApiError(500, "Unable to reach backend API")
  }
}
