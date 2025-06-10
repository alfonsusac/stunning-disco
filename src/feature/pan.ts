import { clampPosX, clampPosY, type AppState } from "@/app/App"
import { Point } from "@/lib/point"
import { useWindowEventListenerEffect, windowEventListenerEffect } from "@/lib/useWindowEventListener"
import { useEffect } from "react"

export function useCanvasPanning(
  appState: AppState
) {
  const { state, setState } = appState

  const handlePanning = (deltaX: number, deltaY: number) => {
    const currCanvas = state().canvas
    const currZoom = state().zoom
    setState(prev => ({ ...prev, canvas: new Point(clampPosX(currCanvas.x + deltaX, currZoom), clampPosY(currCanvas.y + deltaY,currZoom)) }))
  }

  useWindowEventListenerEffect('wheel', (e) => {
    e.preventDefault()
    if (e.metaKey || e.ctrlKey) return
    // Drag the canvas
    // - swipe right = +deltaX
    // - swipe down = +deltaY
    // - to move camera down, swipe down. Camera is opposite of canvas (canvas go up). Thats why its a - (plus)
    handlePanning(-e.deltaX, -e.deltaY)
  }, { passive: false })

  useEffect(() => {
    const middleClick = state().mouse.middleClick
    if (!middleClick) return
    return windowEventListenerEffect('mousemove', (e) => {
      handlePanning(e.movementX, e.movementY)
    })
  }, [state().mouse.middleClick])
}