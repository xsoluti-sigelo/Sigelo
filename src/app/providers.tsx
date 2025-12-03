'use client'

import { ThemeProvider } from '@/shared/lib/theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
