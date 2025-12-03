import type { ActivityLog, LogExportOptions } from '../types'
import { formatTimestamp, getActionTypeLabel } from '../lib'

export class LogExportService {
  static toCSV(logs: ActivityLog[], includeUserInfo = true): string {
    const headers = [
      'Timestamp',
      'Action',
      'User',
      'Email',
      'Entity Type',
      'Entity ID',
      'Success',
      'IP Address',
      'Error Message',
    ]

    const rows = logs.map((log) => [
      formatTimestamp(log.timestamp).absolute,
      getActionTypeLabel(log.action_type),
      includeUserInfo ? log.users?.full_name || '-' : '-',
      includeUserInfo ? log.users?.email || '-' : '-',
      log.entity_type || '-',
      log.entity_id || '-',
      log.success ? 'Yes' : 'No',
      log.ip_address || '-',
      log.error_message || '-',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    return csvContent
  }

  static toJSON(logs: ActivityLog[], includeUserInfo = true): string {
    const data = logs.map((log) => ({
      timestamp: log.timestamp,
      action_type: log.action_type,
      user: includeUserInfo
        ? {
            id: log.user_id,
            name: log.users?.full_name,
            email: log.users?.email,
          }
        : undefined,
      entity: log.entity_type
        ? {
            type: log.entity_type,
            id: log.entity_id,
          }
        : undefined,
      changes:
        log.old_value && log.new_value
          ? {
              old: log.old_value,
              new: log.new_value,
            }
          : undefined,
      success: log.success,
      error_message: log.error_message,
      ip_address: log.ip_address,
      metadata: log.metadata,
    }))

    return JSON.stringify(data, null, 2)
  }

  static downloadAsFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  static export(logs: ActivityLog[], options: LogExportOptions): void {
    const timestamp = new Date().toISOString().split('T')[0]
    const includeUserInfo = options.includeUserInfo ?? true

    switch (options.format) {
      case 'csv': {
        const content = this.toCSV(logs, includeUserInfo)
        this.downloadAsFile(content, `activity-logs-${timestamp}.csv`, 'text/csv')
        break
      }
      case 'json': {
        const content = this.toJSON(logs, includeUserInfo)
        this.downloadAsFile(content, `activity-logs-${timestamp}.json`, 'application/json')
        break
      }
      case 'xlsx': {
        throw new Error('XLSX export not yet implemented')
      }
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }
}
