export type ValidationErrorItem = {
  loc?: Array<string | number>
  msg?: string
  type?: string
}

export type ApiErrorPayload = {
  detail?: string | ValidationErrorItem[]
  message?: string
  error?: string
}

export class ApiError extends Error {
  status: number
  payload?: ApiErrorPayload

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

function formatValidationError(item: ValidationErrorItem): string {
  const location = item.loc?.filter((part) => part !== "body").join(".")
  if (location && item.msg) {
    return `${location}: ${item.msg}`
  }

  return item.msg || "Validation error"
}

export function getApiErrorMessage(
  status: number,
  statusText: string,
  payload?: ApiErrorPayload,
): string {
  if (!payload) {
    return statusText || "Request failed"
  }

  if (typeof payload.detail === "string") {
    return payload.detail
  }

  if (Array.isArray(payload.detail) && payload.detail.length > 0) {
    return payload.detail.map(formatValidationError).join("; ")
  }

  if (payload.message) {
    return payload.message
  }

  if (payload.error) {
    return payload.error
  }

  return statusText || `Request failed with status ${status}`
}
