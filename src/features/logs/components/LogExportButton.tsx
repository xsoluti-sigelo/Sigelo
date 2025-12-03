'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useLogExport } from '../hooks'
import type { ActivityLog } from '../types'

interface LogExportButtonProps {
  logs: ActivityLog[]
  label?: string
  variant?: 'primary' | 'secondary' | 'outline'
}

export function LogExportButton({
  logs,
  label = 'Exportar',
  variant = 'outline',
}: LogExportButtonProps) {
  const { isExporting, exportAsCSV, exportAsJSON } = useLogExport()

  const getButtonClasses = () => {
    const base =
      'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50'

    switch (variant) {
      case 'primary':
        return `${base} bg-blue-600 text-white hover:bg-blue-700`
      case 'secondary':
        return `${base} bg-gray-600 text-white hover:bg-gray-700`
      case 'outline':
        return `${base} border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800`
      default:
        return base
    }
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className={getButtonClasses()} disabled={isExporting || logs.length === 0}>
        <ArrowDownTrayIcon className="w-5 h-5" />
        {isExporting ? 'Exportando...' : label}
      </MenuButton>

      <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700">
        <div className="py-1">
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => exportAsCSV(logs)}
                className={`${focus ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
              >
                Exportar como CSV
              </button>
            )}
          </MenuItem>

          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => exportAsJSON(logs)}
                className={`${focus ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
              >
                Exportar como JSON
              </button>
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}
