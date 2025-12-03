'use client'

import { EditNewEventForm, CreateEventForm } from '@/features/events'
import type { EditEventFormProps, CreateEventFormProps } from '@/features/events'

type EventFormWidgetProps = EditEventFormProps | CreateEventFormProps

export function EventFormWidget(props: EventFormWidgetProps) {
  if ('eventId' in props) {
    if (props.initialData.source === 'MANUAL') {
      return <EditNewEventForm {...props} variant="manual" />
    }
    return <EditNewEventForm {...props} variant="auto" />
  }
  return <CreateEventForm {...props} />
}
