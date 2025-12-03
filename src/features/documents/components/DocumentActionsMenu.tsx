'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'

interface DocumentActionsMenuProps {
  onDownload: () => void
  onDelete?: () => void
  isDownloading: boolean
}

export function DocumentActionsMenu({
  onDownload,
  onDelete,
  isDownloading,
}: DocumentActionsMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Ações do documento"
      >
        <EllipsisVerticalIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </MenuButton>

      <MenuItems
        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700"
        transition
      >
        <div className="py-1">
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={onDownload}
                disabled={isDownloading}
                className={`${
                  focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isDownloading ? 'Baixando...' : 'Baixar'}
              </button>
            )}
          </MenuItem>

          {onDelete && (
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  onClick={onDelete}
                  className={`${
                    focus ? 'bg-red-50 dark:bg-red-900/20' : ''
                  } group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                >
                  Deletar
                </button>
              )}
            </MenuItem>
          )}
        </div>
      </MenuItems>
    </Menu>
  )
}
