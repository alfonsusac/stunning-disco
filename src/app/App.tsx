"use client"

import { useAppContextMenu } from "@/feature/context-menu"
import { useCanvasPanning } from "@/feature/pan"
import { useCanvasZoom } from "@/feature/zoom"
import { offsetCanvasPosAfterZoomAroundPoint } from "@/feature/zoomAroundPoint"
import { Point } from "@/lib/point"
import { useWindowEventListenerEffect } from "@/lib/useWindowEventListener"
import { clamp } from "@/util/clamp"
import { useEffect, useRef, useState } from "react"

const CANVAS_WIDTH = 200_000
const CANVAS_HEIGHT = 200_000
const CANVAS_PADDING = 200

export type AppState = ReturnType<typeof useAppState>
function useAppState() {
  const [_state, setState] = useState({
    // as X increases, (+x) the camera would go left, and the canvas would translate right.
    // as Y increases, (+y) the camera would go up, and the canvas would translate down.
    canvas: new Point(0, 0),
    zoom: 1,
    contextMenu: {
      open: false,
      x: 0,
      y: 0,
    },
    objects: [] as {
      id: string,
      name: string,
      pos: { x: number, y: number },
      size: { width: number, height: number },
      color: string,
    }[],
    selected: [] as string[], // array of object IDs that are selected
    input: {
      middleClick: false
    }
  })

  useWindowEventListenerEffect('mousedown', () => {
    setState((prev) => ({ ...prev, input: { ...prev.input, middleClick: true } }))
  })
  useWindowEventListenerEffect('mouseup', () => {
    setState((prev) => ({ ...prev, input: { ...prev.input, middleClick: false } }))
  })

  const stateRef = useRef(_state)
  stateRef.current = _state

  /**
   * State is a function to ensure that the latest state is always returned.
   * - made it into closure-safe getter
   */
  const state = () => stateRef.current
  return { state, setState, stateRef }
}
export const clampPosX = (num: number, zoom: number) => -clamp((-CANVAS_PADDING * zoom), -num, (CANVAS_WIDTH * zoom - window.innerWidth) + (CANVAS_PADDING * zoom))
export const clampPosY = (num: number, zoom: number) => -clamp((-CANVAS_PADDING * zoom), -num, (CANVAS_HEIGHT * zoom - window.innerHeight) + (CANVAS_PADDING * zoom))
export const clampZoom = (num: number) => clamp(0.02, num, 256) // real: 0.02 - 256


export function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const appState = useAppState()
  const { state, setState, stateRef } = appState

  useCanvasPanning(appState)
  useCanvasZoom(appState)
  useAppContextMenu(appState, contextMenuRef)

  // Handle Mouse Move for Debug UI
  useWindowEventListenerEffect('mousemove', e => {
    const debugRefMousePos = document.getElementById('mousepos')!
    const debugRefMousePosLocal = document.getElementById('localmousepos')!
    debugRefMousePos.innerText = `mouse: ${ e.clientX }, ${ e.clientY }`
    const localMousePos = {
      x: (e.clientX - stateRef.current.canvas.x) / stateRef.current.zoom,
      y: (e.clientY - stateRef.current.canvas.y) / stateRef.current.zoom
    }
    debugRefMousePosLocal.innerText = `local mouse: ${ localMousePos.x }, ${ localMousePos.y }`
  })



  // New Object Handler
  const onCreateNewObject = () => {
    // Get world-space position of the context menu
    const pos = {
      x: (state().contextMenu.x + state().canvas.x) / state().zoom,
      y: (state().contextMenu.y + state().canvas.y) / state().zoom
    }

    setState({
      ...state(),
      objects: [
        ...state().objects,
        {
          id: crypto.randomUUID(),
          name: `Object ${ state().objects.length + 1 }`,
          pos: { x: pos.x, y: pos.y },
          size: { width: 50, height: 50 },
          color: '#fff'
        }
      ],
      contextMenu: { open: false, x: 0, y: 0 }
    })
  }

  return (
    <div ref={canvasContainerRef} className="canvas-container w-screen h-screen overflow-clip relative"
      style={{ cursor: state().input.middleClick ? "grab" : "unset" }}
    >
      {/* Debug Layer */}
      <div className="fixed top-2 left-2 z-[9999] font-mono whitespace-pre">
        x: {state().canvas.x.toFixed(5).padStart(10)}, y: {state().canvas.y.toFixed(5).padStart(10)}<br />
        {state().zoom.toFixed(4)}<br />
        <br />
        <span id="mousepos"></span><br />
        <span id="localmousepos"></span>
      </div>
      {/* Context Menu */}
      <div className="bg-neutral-800 absolute z-10 rounded-sm overflow-hidden" ref={contextMenuRef}
        style={{
          left: state().contextMenu.x + 'px',
          top: state().contextMenu.y + 'px',
          display: state().contextMenu.open ? 'block' : 'none',
        }}
      >
        <button className="hover:bg-white/5 p-2 px-3 cursor-pointer"
          onClick={onCreateNewObject}
        >+ Create new Object</button>
      </div>

      {/* Canvas View */}
      <div ref={canvasRef} className="canvas bg-neutral-400 bg-[url('/image.png')] crisp-edges rounded-md outline outline-white/10 relative"
        style={{
          width: `${ CANVAS_WIDTH }px`,
          height: `${ CANVAS_HEIGHT }px`,
          // Pos needs to be negative because it needs to go the opposite of the camera.
          transform: `translate(${ state().canvas.x }px, ${ state().canvas.y }px) scale(${ state().zoom }) `,
          transformOrigin: '0 0',
        }}
      >
        {/* Objects */}
        {
          state().objects.map((obj) => (
            <div key={obj.id} className="object absolute rounded-sm"
              style={{
                left: `${ obj.pos.x }px`,
                top: `${ obj.pos.y }px`,
                width: `${ obj.size.width }px`,
                height: `${ obj.size.height }px`,
                backgroundColor: obj.color,
              }}
            >
              {/* <span className="text-white text-xs">{obj.name}</span> */}
            </div>
          ))
        }
      </div>
    </div>
  )
}