import { logger } from '@/shared/lib/logger'

export async function checkCancellationEmails(
  ofNumbers: string[],
  supplierEmail: string = 'ORDEMFORNECIMENTO@spturis.com',
): Promise<{
  hasCancellation: boolean
  cancelledOFs: string[]
  details: Array<{
    ofNumber: string
    emailSubject: string
    receivedAt: string
  }>
}> {
  const cancelledOFs: string[] = []
  const details: Array<{
    ofNumber: string
    emailSubject: string
    receivedAt: string
  }> = []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn('Supabase configuration missing, skipping cancellation check')
    return { hasCancellation: false, cancelledOFs: [], details: [] }
  }

  try {
    for (const ofNumber of ofNumbers) {
      const searchQuery = `from:${supplierEmail} subject:(Cancelamento O.F. ${ofNumber})`

      const response = await fetch(`${supabaseUrl}/functions/v1/gmail-processor/emails/search`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          maxResults: 5,
        }),
      })

      if (!response.ok) {
        logger.error(`Failed to search emails for OF ${ofNumber}`)
        continue
      }

      const result = await response.json()

      if (result.emails && result.emails.length > 0) {
        cancelledOFs.push(ofNumber)

        for (const email of result.emails) {
          details.push({
            ofNumber,
            emailSubject: email.subject,
            receivedAt: email.date,
          })
        }
      }
    }

    return {
      hasCancellation: cancelledOFs.length > 0,
      cancelledOFs,
      details,
    }
  } catch (error) {
    logger.error('Error checking cancellation emails', { error })

    return {
      hasCancellation: false,
      cancelledOFs: [],
      details: [],
    }
  }
}
