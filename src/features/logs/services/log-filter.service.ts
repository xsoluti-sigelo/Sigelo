import type { ActivityLog, LogFilters } from '../types'
import { filterLogs, sortLogsByDate } from '../lib'

export class LogFilterService {
  private logs: ActivityLog[]

  constructor(logs: ActivityLog[]) {
    this.logs = logs
  }

  applyFilters(filters: LogFilters): ActivityLog[] {
    let filtered = filterLogs(this.logs, filters)
    filtered = sortLogsByDate(filtered, false)

    const page = filters.page || 1
    const limit = filters.limit || 50
    const offset = (page - 1) * limit

    return filtered.slice(offset, offset + limit)
  }

  getFilteredCount(filters: LogFilters): number {
    return filterLogs(this.logs, filters).length
  }

  getTotalPages(filters: LogFilters): number {
    const count = this.getFilteredCount(filters)
    const limit = filters.limit || 50
    return Math.ceil(count / limit)
  }

  hasResults(filters: LogFilters): boolean {
    return this.getFilteredCount(filters) > 0
  }
}
