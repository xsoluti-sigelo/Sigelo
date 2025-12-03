'use client'

import { IssueList } from '@/features/issues'
import type { Issue } from '@/features/issues'

interface EventIssuesAlertProps {
  issues: Issue[]
  eventId: string
}

export function EventIssuesAlert({ issues, eventId }: EventIssuesAlertProps) {
  return <IssueList issues={issues} eventId={eventId} />
}
