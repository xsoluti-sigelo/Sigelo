import type { ActivityLog, LogStats, ActionType } from '../types'
import { groupLogsByAction, groupLogsByUser, calculateSuccessRate } from '../lib'

export class LogStatsService {
  private logs: ActivityLog[]

  constructor(logs: ActivityLog[]) {
    this.logs = logs
  }

  getStats(): LogStats {
    return {
      totalLogs: this.logs.length,
      successRate: calculateSuccessRate(this.logs),
      topActions: this.getTopActions(5),
      topUsers: this.getTopUsers(5),
      activityByHour: this.getActivityByHour(),
    }
  }

  getTopActions(limit = 5): Array<{ action: ActionType; count: number }> {
    const grouped = groupLogsByAction(this.logs)
    const counts = Array.from(grouped.entries()).map(([action, logs]) => ({
      action,
      count: logs.length,
    }))

    return counts.sort((a, b) => b.count - a.count).slice(0, limit)
  }

  getTopUsers(limit = 5): Array<{ user_id: string; user_name: string; count: number }> {
    const grouped = groupLogsByUser(this.logs)
    const counts = Array.from(grouped.entries()).map(([user_id, logs]) => ({
      user_id,
      user_name: logs[0]?.users?.full_name || 'Desconhecido',
      count: logs.length,
    }))

    return counts.sort((a, b) => b.count - a.count).slice(0, limit)
  }

  getActivityByHour(): Array<{ hour: number; count: number }> {
    const hourCounts = new Map<number, number>()

    for (let i = 0; i < 24; i++) {
      hourCounts.set(i, 0)
    }

    for (const log of this.logs) {
      const hour = new Date(log.timestamp).getHours()
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    }

    return Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour - b.hour)
  }

  getActivityByDate(): Map<string, number> {
    const dateCounts = new Map<string, number>()

    for (const log of this.logs) {
      const date = new Date(log.timestamp).toLocaleDateString('pt-BR')
      dateCounts.set(date, (dateCounts.get(date) || 0) + 1)
    }

    return dateCounts
  }

  getErrorLogs(): ActivityLog[] {
    return this.logs.filter((log) => !log.success)
  }

  getErrorRate(): number {
    if (this.logs.length === 0) return 0
    return (this.getErrorLogs().length / this.logs.length) * 100
  }

  getMostActiveDay(): { date: string; count: number } | null {
    const activityByDate = this.getActivityByDate()

    if (activityByDate.size === 0) return null

    let mostActiveDate = ''
    let maxCount = 0

    for (const [date, count] of activityByDate.entries()) {
      if (count > maxCount) {
        maxCount = count
        mostActiveDate = date
      }
    }

    return { date: mostActiveDate, count: maxCount }
  }

  getMostActiveHour(): { hour: number; count: number } | null {
    const activityByHour = this.getActivityByHour()

    if (activityByHour.length === 0) return null

    return activityByHour.reduce((max, current) => (current.count > max.count ? current : max))
  }
}
