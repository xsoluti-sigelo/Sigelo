import { NextResponse } from 'next/server'
import { createAuditLog } from '@/entities/audit-log'
import { createActivityLog } from '@/features/logs'
import { logger } from '@/shared/lib/logger'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body?.action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    const result = await createAuditLog({
      action: body.action,
      entityType: body.entityType,
      entityId: body.entityId,
      description: body.description,
      metadata: body.metadata,
      success: body.success ?? true,
      errorMessage: body.errorMessage,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to log audit entry' },
        { status: 500 },
      )
    }

    if (body.action === 'LOGIN' || body.action === 'LOGOUT') {
      try {
        await createActivityLog({
          action_type: body.action,
          success: body.success ?? true,
          error_message: body.errorMessage,
          metadata: body.metadata,
        })
      } catch (error) {
        logger.error('Failed to create activity log for auth action', error as Error, {
          action: body.action,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
