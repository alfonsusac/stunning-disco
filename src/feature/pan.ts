import { clampPosX, clampPosY, type AppState } from "@/app/App"
import { Point } from "@/lib/point"
import { useWindowEventListenerEffect, windowEventListenerEffect } from "@/lib/useWindowEventListener"
import { useEffect } from "react"

export function useCanvasPanning(
  appState: AppState
) {
  const { state, setState } = appState
  useWindowEventListenerEffect('wheel', (e) => {
    e.preventDefault()
    if (e.metaKey || e.ctrlKey) return
    const currCanvas = state().canvas
    const currZoom = state().zoom

    // Drag the canvas
    // - swipe right = +deltaX
    // - swipe down = +deltaY
    // - to move down, swipe down. Thats why its a + (plus)
    const newX = currCanvas.x - e.deltaX
    const newY = currCanvas.y - e.deltaY
    setState(prev => ({ ...prev, canvas: new Point(clampPosX(newX, currZoom), clampPosY(newY, currZoom)) }))
  }, { passive: false })

  useEffect(() => {
    const middleClick = state().mouse.middleClick
    if (!middleClick) return

    return windowEventListenerEffect('mousemove', (e) => {
      setState(prev => ({
        ...prev,
        canvas: new Point(
          clampPosX(prev.canvas.x + e.movementX, prev.zoom),
          clampPosY(prev.canvas.y + e.movementY, prev.zoom)
        )
      }))
    })

  }, [state().mouse.middleClick])
}