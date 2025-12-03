import { inviteValidationService, cookieManagementService } from '@/features/auth/services'
import { ROUTES } from '@/shared/config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const validationResult = inviteValidationService.validateInviteTokenFromUrl(searchParams)

  if (!validationResult.success) {
    return cookieManagementService.createErrorRedirect(ROUTES.AUTH_ERROR, request.url)
  }

  return cookieManagementService.createRedirectWithToken(
    ROUTES.LOGIN,
    validationResult.token!,
    request.url,
  )
}
