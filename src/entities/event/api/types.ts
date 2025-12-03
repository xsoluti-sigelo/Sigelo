
export interface CreateEventResponse {
  success: true
  eventId: string
}

export interface CreateEventErrorResponse {
  success: false
  error: string
  errors?: Record<string, string[]>
}

export type CreateEventResult = CreateEventResponse | CreateEventErrorResponse

export interface UpdateEventResponse {
  success: true
  eventId: string
}

export interface UpdateEventErrorResponse {
  success: false
  error: string
  errors?: Record<string, string[]>
}

export type UpdateEventResult = UpdateEventResponse | UpdateEventErrorResponse

export interface DownloadAttachmentResponse {
  success: true
  data: string
  fileName: string
  mimeType: string
}

export interface DownloadAttachmentErrorResponse {
  success: false
  error: string
}

export type DownloadAttachmentResult = DownloadAttachmentResponse | DownloadAttachmentErrorResponse

export interface ResolveIssueResponse {
  success: true
}

export interface ResolveIssueErrorResponse {
  success: false
  error: string
}

export type ResolveIssueResult = ResolveIssueResponse | ResolveIssueErrorResponse

export interface GenerateOperationsSuccessResponse {
  success: true
  operationsCount: number
  message: string
}

export interface GenerateOperationsErrorResponse {
  success: false
  error: string
}

export type GenerateOperationsResult = GenerateOperationsSuccessResponse | GenerateOperationsErrorResponse

export interface GenerateOperationsForEventSuccessResponse {
  success: true
  operations: unknown[]
}

export interface GenerateOperationsForEventErrorResponse {
  success: false
  error: string
}

export type GenerateOperationsForEventResult =
  | GenerateOperationsForEventSuccessResponse
  | GenerateOperationsForEventErrorResponse
