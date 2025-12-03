export function buildFilterParams(filters: Record<string, string | undefined>): URLSearchParams {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  return params
}

export function buildFilterQueryString(
  filters: Record<string, string | undefined>,
  basePath: string,
): string {
  const params = buildFilterParams(filters)
  params.set('page', '1')

  return `${basePath}?${params.toString()}`
}

export function removeFilterParam(
  searchParams: URLSearchParams,
  filterKey: string,
): URLSearchParams {
  const params = new URLSearchParams(searchParams.toString())
  params.delete(filterKey)
  params.delete('page')

  return params
}

export function clearAllFilters(): URLSearchParams {
  return new URLSearchParams()
}
export function hasActiveFilters(filters: Record<string, string | undefined>): boolean {
  return Object.values(filters).some((value) => value !== undefined && value !== '')
}

export function countActiveFilters(filters: Record<string, string | undefined>): number {
  return Object.values(filters).filter((value) => value !== undefined && value !== '').length
}

export function getActiveFilterEntries(
  filters: Record<string, string | undefined>,
): Array<[string, string]> {
  return Object.entries(filters).filter(
    ([, value]) => value !== undefined && value !== '',
  ) as Array<[string, string]>
}
