import type { BuildEventFieldChangesOptions, EventFieldChange, JsonValue } from '../model/types'

type ComparableRecord = Record<string, unknown>

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const normalizeJsonValue = (value: unknown): JsonValue | null => {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonValue(item)) as JsonValue
  }

  if (isPlainObject(value)) {
    return Object.entries(value).reduce<Record<string, JsonValue | null>>(
      (acc, [key, entryValue]) => {
        acc[key] = normalizeJsonValue(entryValue)
        return acc
      },
      {},
    ) as JsonValue
  }

  return JSON.parse(JSON.stringify(value)) as JsonValue
}

const valuesAreEqual = (a: JsonValue | null, b: JsonValue | null) =>
  JSON.stringify(a) === JSON.stringify(b)

export const buildEventFieldChanges = (
  previous?: ComparableRecord | null,
  next?: ComparableRecord | null,
  options?: BuildEventFieldChangesOptions,
): EventFieldChange[] => {
  const prevData = previous ?? {}
  const nextData = next ?? {}

  const includeFields =
    options?.fields ?? Array.from(new Set([...Object.keys(prevData), ...Object.keys(nextData)]))

  const omit = new Set(options?.omitFields ?? [])
  const serializeValue =
    options?.serializeValue ?? ((field: string, value: unknown) => normalizeJsonValue(value))
  const shouldInclude =
    options?.shouldInclude ??
    ((field: string, oldValue: JsonValue | null, newValue: JsonValue | null) =>
      !valuesAreEqual(oldValue, newValue))

  const changes: EventFieldChange[] = []

  for (const field of includeFields) {
    if (omit.has(field)) {
      continue
    }

    const rawOldValue = (prevData as ComparableRecord)[field]
    const rawNewValue = (nextData as ComparableRecord)[field]

    const oldValue = serializeValue(field, rawOldValue)
    const newValue = serializeValue(field, rawNewValue)

    if (!shouldInclude(field, oldValue, newValue)) {
      continue
    }

    const mappedField = options?.mapFieldName?.(field) ?? field

    changes.push({
      field: mappedField,
      oldValue,
      newValue,
    })
  }

  return changes
}

export type { ComparableRecord }
