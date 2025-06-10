import type { AppState } from "@/app/App"
import { useWindowEventListenerEffect, windowEventListenerEffect } from "@/lib/useWindowEventListener"
import { useEffect } from "react"

export function useAppContextMenu(
  { state, setState }: AppState,
  contextMenuRef: React.RefObject<HTMLDivElement | null>
) {

  // Handle Right Click
  useWindowEventListenerEffect('contextmenu', (e: MouseEvent) => {
    e.preventDefault()
    setState({
      ...state(),
      contextMenu: { open: true, x: e.clientX, y: e.clientY }
    })
  })

  // Handle Right Click Outside Context Menu
  useEffect(() => {
    if (!state().contextMenu.open) return

    return windowEventListenerEffect('click', (e: MouseEvent) => {
      if (e.button !== 0) return // Only handle left click
      if (!state().contextMenu.open) return // Context menu is not open
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setState({ ...state(), contextMenu: { open: false, x: 0, y: 0 } })
      }
    })
  }, [state().contextMenu.open])
  
}