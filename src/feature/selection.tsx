import type { AppState } from "@/app/App"
import { Box } from "@/lib/box"
import { Point } from "@/lib/point"
import { windowEventListenerEffect } from "@/lib/useWindowEventListener"
import { useEffect } from "react"

export function useCanvasSelection(
  appState: AppState
) {
  const { state, setState } = appState
  

  // Effect to handle mouse down event for selection
  useEffect(() => {
    if (!state().mouse.leftClick) return
    if (state().contextMenu.open) return
    if (state().selection.selecting) return
    const mouseStart = state().mouse.position

    const onMouseClickDragMove = (e: MouseEvent) => {
      const mouseEnd = new Point(e.clientX, e.clientY)
      const startX = Math.min(mouseStart.x, mouseEnd.x)
      const startY = Math.min(mouseStart.y, mouseEnd.y)
      const width = Math.abs(mouseStart.x - mouseEnd.x)
      const height = Math.abs(mouseStart.y - mouseEnd.y)

      const box = new Box(startX, startY, width, height)
      setState((prev) => ({ ...prev, selection: { selecting: true, box: box } }))
    }

    window.addEventListener('mouseup', () => {
      const mouseEnd = state().mouse.position

      const box = state().selection.box
      if (!box) return

      window.removeEventListener('mousemove', onMouseClickDragMove)
      setState({ ...state(), selection: { selecting: false, box: null } })
    }, { once: true })

    window.addEventListener('mousemove', onMouseClickDragMove)
    return () => {
      window.removeEventListener('mousemove', onMouseClickDragMove)
    }
  }, [state().mouse.leftClick])


}