'use client'

import { useState, useEffect, useCallback } from 'react'
import { sidebarService } from '../services/sidebar.service'

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedState = sidebarService.getCollapsedState()
    setIsCollapsed(savedState)
    setIsLoading(false)
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const newState = !prev
      sidebarService.saveCollapsedState(newState)
      return newState
    })
  }, [])

  const expandSidebar = useCallback(() => {
    setIsCollapsed(false)
  }, [])

  const collapseSidebar = useCallback(() => {
    setIsCollapsed(true)
  }, [])

  const setHoverState = useCallback((hovered: boolean) => {
    setIsHovered(hovered)
  }, [])

  return {
    isCollapsed,
    isHovered,
    isLoading,
    toggleSidebar,
    expandSidebar,
    collapseSidebar,
    setHoverState,
  }
}
