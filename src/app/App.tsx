"use client"

import { useAppContextMenu } from "@/feature/context-menu"
import { useCanvasPanning } from "@/feature/pan"
import { useCanvasZoom } from "@/feature/zoom"
import { Box } from "@/lib/box"
import { Point } from "@/lib/point"
import { useWindowEventListenerEffect, windowEventListenerEffect } from "@/lib/useWindowEventListener"
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
      pos: Point,
      size: { width: number, height: number },
      color: string,
    }[],
    selected: [] as string[], // array of object IDs that are selected
    mouse: {
      leftClick: false,
      middleClick: false,
      position: new Point(0, 0)
    },
    selection: {
      selecting: false,
      box: null as Box | null, // box for selection drag
    }
  })

  useWindowEventListenerEffect('mousemove', e => {
    setState((prev) => ({ ...prev, mouse: { ...prev.mouse, position: new Point(e.clientX, e.clientY) } }))
  })
  useWindowEventListenerEffect('mousedown', (e) => {
    if (e.button === 1)
      setState((prev) => ({ ...prev, mouse: { ...prev.mouse, middleClick: true, position: new Point(e.clientX, e.clientY) } }))
    if (e.button === 0)
      setState((prev) => ({ ...prev, mouse: { ...prev.mouse, leftClick: true, position: new Point(e.clientX, e.clientY) } }))
  })
  useWindowEventListenerEffect('mouseup', (e) => {
    if (e.button === 1)
      setState((prev) => ({ ...prev, mouse: { ...prev.mouse, middleClick: false, position: new Point(e.clientX, e.clientY) } }))
    if (e.button === 0)
      setState((prev) => ({ ...prev, mouse: { ...prev.mouse, leftClick: false, position: new Point(e.clientX, e.clientY) } }))
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
export const getCanvasPos = (appState: AppState, point: Point) => point.subtract(new Point(appState.state().canvas.x, appState.state().canvas.y)).scale(1 / appState.state().zoom)

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
  useEffect(() => {
    const debugRefMousePos = document.getElementById('mousepos')!
    const debugRefMousePosLocal = document.getElementById('localmousepos')!
    debugRefMousePos.innerText = `mouse: ${ state().mouse.position.x }, ${ state().mouse.position.y }`
    const localMousePos = getCanvasPos(appState, state().mouse.position)
    debugRefMousePosLocal.innerText = `local mouse: ${ localMousePos.x }, ${ localMousePos.y }`
  }, [state()])

  // New Object Handler
  const onCreateNewObject = () => {
    setState({
      ...state(),
      objects: [
        ...state().objects,
        {
          id: crypto.randomUUID(),
          name: `Object ${ state().objects.length + 1 }`,
          pos: getCanvasPos(appState, new Point(state().contextMenu.x, state().contextMenu.y)),
          size: { width: 50, height: 50 },
          color: '#fff'
        }
      ],
      contextMenu: { open: false, x: 0, y: 0 }
    })
  }

  const selectionDragBoxRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!state().mouse.leftClick) return
    if (state().contextMenu.open) return
    if (state().selection.selecting) return
    const mouseStart = state().mouse.position
    return windowEventListenerEffect('mousemove', (e) => {
      const mouseEnd = new Point(e.clientX, e.clientY)
      const startX = Math.min(mouseStart.x, mouseEnd.x)
      const startY = Math.min(mouseStart.y, mouseEnd.y)
      const width = Math.abs(mouseStart.x - mouseEnd.x)
      const height = Math.abs(mouseStart.y - mouseEnd.y)

      const box = new Box(startX, startY, width, height)
      setState((prev) => ({
        ...prev,
        selection: {
          selecting: true,
          box: box
        }
      }))
    })

  }, [state().mouse.leftClick])

  useEffect(() => {
    if (!state().selection.selecting) return
    return windowEventListenerEffect('mouseup', e => {
      const mouseEnd = new Point(e.clientX, e.clientY)
      const box = state().selection.box
      if (!box) return

      // Calculate selected objects based on the selection box
      const selectedObjects = state().objects.filter(obj => {
        const objBox = new Box(obj.pos.x, obj.pos.y, obj.size.width, obj.size.height)
        return (
          box.x < objBox.x + objBox.width &&
          box.x + box.width > objBox.x &&
          box.y < objBox.y + objBox.height &&
          box.y + box.height > objBox.y
        )
      }).map(obj => obj.id)

      setState({
        ...state(),
        selection: {
          selecting: false,
          box: null
        },
        selected: selectedObjects
      })
    })
  }, [state().selection.selecting])

  return (
    <div ref={canvasContainerRef} className="canvas-container w-screen h-screen overflow-clip relative"
      style={{ cursor: state().mouse.middleClick ? "grab" : "unset" }}
    >
      {/* Debug Layer */}
      <div className="fixed top-2 left-2 z-[9999] font-mono whitespace-pre">
        x: {state().canvas.x.toFixed(5).padStart(10)}, y: {state().canvas.y.toFixed(5).padStart(10)}<br />
        {state().zoom.toFixed(4)}<br />
        <br />
        <span id="mousepos"></span><br />
        <span id="localmousepos"></span>
      </div>

      {/* UI Layer */}
      <div className="absolute inset-0 z-10">
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

        {/* Selection */}
        <div
          ref={selectionDragBoxRef}
          className="absolute top-20 left-20 size-20 bg-blue-500/10 border border-blue-500"
          style={{
            display: state().selection.selecting ? 'block' : 'none',
            left: state().selection.box?.x + 'px',
            top: state().selection.box?.y + 'px',
            width: state().selection.box?.width + 'px',
            height: state().selection.box?.height + 'px',
          }}
        >
          
        </div>
      </div>

      {/* Canvas View Layer */}
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