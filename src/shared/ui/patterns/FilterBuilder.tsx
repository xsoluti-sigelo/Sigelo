'use client'

import { Input } from '@/shared/ui/Input'

export interface FilterField {
  name: string
  label: string
  type: 'text' | 'select' | 'date'
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  value: string
  onChange: (value: string) => void
}

interface FilterBuilderProps {
  fields: FilterField[]
}

export function FilterBuilder({ fields }: FilterBuilderProps) {
  return (
    <>
      {fields.map((field) => (
        <div key={field.name} className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {field.label}
          </label>
          {field.type === 'select' ? (
            <select
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            />
          )}
        </div>
      ))}
    </>
  )
}

export function createFilterFields<T extends Record<string, string>>(
  filters: T,
  setFilters: React.Dispatch<React.SetStateAction<T>>,
  fields: Array<Omit<FilterField, 'value' | 'onChange'>>,
): FilterField[] {
  return fields.map((field) => ({
    ...field,
    value: filters[field.name] || '',
    onChange: (value: string) => setFilters({ ...filters, [field.name]: value } as T),
  }))
}
