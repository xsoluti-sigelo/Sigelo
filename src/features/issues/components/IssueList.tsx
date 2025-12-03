'use client'

import { IssueAlert } from './IssueAlert'
import type { Issue } from '../types'

interface IssueListProps {
  issues: Issue[]
  eventId: string
  onIssueResolved?: () => void
}

export function IssueList({ issues, eventId, onIssueResolved }: IssueListProps) {
  const pendingIssues = issues.filter(
    (i) =>
      i.status === 'OPEN' ||
      i.status === 'IN_REVIEW' ||
      i.status === null ||
      i.status === undefined,
  )

  if (pendingIssues.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 mb-6">
      {pendingIssues.map((issue) => (
        <IssueAlert key={issue.id} issue={issue} eventId={eventId} onResolved={onIssueResolved} />
      ))}
    </div>
  )
}
