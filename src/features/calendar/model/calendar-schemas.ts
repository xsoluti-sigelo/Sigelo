import { z } from 'zod'

export const calendarOperationDataSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  status: z.string().nullable(),
  new_events: z.object({
    number: z.string(),
    name: z.string(),
  }),
})

export const calendarEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  start: z.date(),
  end: z.date(),
  type: z.literal('operation'),
  status: z.string().nullable().optional(),
  operationType: z.string().optional(),
  eventNumber: z.string().optional(),
  eventName: z.string().optional(),
})

export const calendarDateRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
})

export const calendarOperationsParamsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type CalendarOperationDataInput = z.infer<typeof calendarOperationDataSchema>
export type CalendarEventInput = z.infer<typeof calendarEventSchema>
export type CalendarDateRangeInput = z.infer<typeof calendarDateRangeSchema>
export type CalendarOperationsParamsInput = z.infer<typeof calendarOperationsParamsSchema>
