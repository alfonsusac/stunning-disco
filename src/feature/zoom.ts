import { clampPosX, clampPosY, clampZoom, type AppState } from "@/app/App"
import { Point } from "@/lib/point"
import { useWindowEventListenerEffect } from "@/lib/useWindowEventListener"
import { offsetCanvasPosAfterZoomAroundPoint } from "./zoomAroundPoint"
import { clamp } from "@/util/clamp"

export function useCanvasZoom(
  { setState, state, stateRef }: AppState
) {
  
  useWindowEventListenerEffect('wheel', (e: WheelEvent) => {
    e.preventDefault()
    const currCanvas = state().canvas
    const currZoom = state().zoom
    const mouse = new Point(e.clientX, e.clientY)
    if (e.metaKey || e.ctrlKey) {
      // Zoom in/out
      // - pinch out / zoom in = -deltaY
      // - pinch in / zoom out = +deltaY
      const zoomIntensity = 0.015 // how fast zoom changes
      const deltaZoom = clamp(-10, e.deltaY, 10) * zoomIntensity * (currZoom / 2)
      // console.log(deltaZoom)
      const newZoom = clampZoom(currZoom - deltaZoom)
      // Its using minus because:
      // - zoom in  -> (-deltaY) -> zoom needs to be higher.
      // - zoom out -> (+deltaY) -> zoom needs to be lower.

      const newPos = offsetCanvasPosAfterZoomAroundPoint(
        currZoom,
        newZoom,
        mouse,
        currCanvas
      )

      setState({
        ...stateRef.current,
        zoom: newZoom,
        canvas: new Point(clampPosX(newPos.x, newZoom), clampPosY(newPos.y, newZoom))
      })
    }
  }, { passive: false })

}