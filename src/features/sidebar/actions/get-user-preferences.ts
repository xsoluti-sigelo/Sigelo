'use server'

export interface UserPreferences {
  sidebarCollapsed?: boolean
  theme?: 'light' | 'dark'
  navigationExpanded?: string[]
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  return null
}

export async function saveUserPreferences(
  preferences: UserPreferences,
): Promise<{ success: boolean; error?: string }> {
  void preferences
  return { success: true }
}
