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
    if (state().contextMenu.open) return
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
    if (state().contextMenu.open) return
    return windowEventListenerEffect('mousemove', (e) => {
      handlePanning(e.movementX, e.movementY)
    })
  }, [state().mouse.middleClick])
}



export function initiatePanning(
  initialMouse: { clientX: number, clientY: number },
  initialCamera: Point
) {
  return (newMouse: { clientX: number, clientY: number }) => {
    return new Point(
      initialCamera.x - (initialMouse.clientX - newMouse.clientX),
      initialCamera.y - (initialMouse.clientY - newMouse.clientY)
    )
  }
}

export function getTrackpadPanNewPosition(
  camera: Point,
  wheelDelta: { deltaX: number, deltaY: number },
) {
  return camera.madd(
    new Point(-wheelDelta.deltaX, -wheelDelta.deltaY)
  )
}