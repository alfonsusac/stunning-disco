"use client"

import { clamp } from "@/util/clamp"
import { useEffect, useRef, useState } from "react"

const CANVAS_WIDTH = 200_000
const CANVAS_HEIGHT = 200_000
const CANVAS_PADDING = 200

export function App() {

  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const [state, setState] = useState({
    camera: {
      x: 0, // as X increases, the camera would go right, and the canvas would translate left
      y: 0, // as Y increases, the camera would go down, and the canvas would translate up
    },
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
  })
  const getPos = () => state.camera
  const getZoom = () => state.zoom
  const clampPosX = (num: number, zoom: number) => clamp((-CANVAS_PADDING * zoom), num, (CANVAS_WIDTH * zoom - window.innerWidth) + (CANVAS_PADDING * zoom))
  const clampPosY = (num: number, zoom: number) => clamp((-CANVAS_PADDING * zoom), num, (CANVAS_HEIGHT * zoom - window.innerHeight) + (CANVAS_PADDING * zoom))
  // const clampZoom = (num: number) => clamp(0.5, num, 1.5) // real: 0.02 - 256
  const clampZoom = (num: number) => clamp(0.02, num, 256) // real: 0.02 - 256

  // Handle Trackpad
  useEffect(() => {
    const ev = (e: WheelEvent) => {
      e.preventDefault()
      const init = getPos()
      if (e.ctrlKey) {
        // Zoom in/out
        // - pinch out / zoom in = -deltaY
        // - pinch in / zoom out = +deltaY
        // console.log(e.deltaY)
        const oldZoom = getZoom()
        const zoomIntensity = 0.015 // how fast zoom changes
        const newZoom = clampZoom(oldZoom - e.deltaY * zoomIntensity * (oldZoom / 2))
        // Its using minus because:
        // - zoom in  -> (-deltaY) -> zoom needs to be higher.
        // - zoom out -> (+deltaY) -> zoom needs to be lower.

        // Calculate new position based on zoom around the cursor
        // - Note: its easier to think using vector math arrows. 
        const oldPos = state.camera
        const oldWorldPosUnderCursorX = (e.clientX + state.camera.x) / oldZoom
        const oldWorldPosUnderCursorY = (e.clientY + state.camera.y) / oldZoom
        // x: -200
        //  ________________________________________________
        // |                 |===========^==================
        // -----------------------------> +clientX
        // <-----------------  -state.camera.x
        //                   -----------> +worldPosUnderCursor (no direction reverse needed therefore a "+" sign is used)
        // Explanation:
        // - e.clientX is the mouse position from viewport top left
        // - + state.pos.x gets the new relative position of the mouse with the topLeft of canvas
        // - / oldZoom converts the screen position to world position
        // - as screen zoom in -> oldZoom = 0.5 -> position is 2x bigger
        // - as screen zoom out -> oldZoom = 2 -> position is 0.5x smaller

        // 
        const oldScreenLocalCursorX = oldWorldPosUnderCursorX * oldZoom - state.camera.x
        const oldScreenLocalCursorY = oldWorldPosUnderCursorY * oldZoom - state.camera.y
        // Explanation:
        // - we want to see how much shift happens to the cursor on the screen when zoom is applied.
        // - worldPosUnderCursor needs to be converted back to screen-space
        // - the principle of zooming is the same but opposite
        // - worldspace is zommed out -> position is but still as big -> zoom is 0.5 -> reduced to match scale of screen
        // - worldspace is zoomed out -> position is bigger than they appear -> multiply < 1 to normalize
        // - worldspace is zoomed in -> position is smaller than they appear -> multiply > 1 to normalize
        // - after that, remember that minus changes the direction of the vector.
        // x: -200
        //  ________________________________________________
        // |                 |===========^==================
        //                   -----------> +worldPosUnderCursor
        // <-----------------  -state.camera.x
        // -----------------------------> +screenWorldPosUnderCursor (direction reverse needed therefore a "-" sign is used)
        // Moreover:
        // - formula is (point * zoom + -pan) because of 'translate(-x, -y) scale(z)' order.
        // - this gives us the position of the cursor on the screen before zooming. Which is basically just e.clientX.

        const newScreenLocalCursorX = oldWorldPosUnderCursorX * newZoom - state.camera.x
        const newScreenLocalCursorY = oldWorldPosUnderCursorY * newZoom - state.camera.y
        // Explanation:
        // - wordlPosUnderCursor is the same as above, but now we apply new zoom to it.

        const offsetX = newScreenLocalCursorX - oldScreenLocalCursorX
        const offsetY = newScreenLocalCursorY - oldScreenLocalCursorY
        // x: -200 | ^ is old, % is new | newZoom > oldZoom (-deltaY) (zoom in)
        //  ________________________________________________________
        // |                 |===========^======%===================
        // -----------------------------> +old
        // -------------------------------------> +new
        //                               -------> +offset = new - old
        const newPosX = oldPos.x + offsetX
        const newPosY = oldPos.y + offsetY
        // x: -200 | ^ is old, % is new | newZoom > oldZoom (-deltaY)
        //  ________________________________________________________
        // |                 |===========^======%===================
        // <------------------ -state.camera.x
        //                               ------> +offset
        // |            |================%==========================
        // <------------ -newPosX
        // Explanation:
        // - The idea is that we need the new cursor (%) to shift back to old cursor (^).
        // - This means moving the resulting canvas to the left.
        // - if canvas move to left, that means camera moves to right.
        // - Thats why second arrow vector is going to the right

        setState({
          ...state,
          zoom: newZoom,
          camera: {
            x: clampPosX(newPosX, newZoom),
            y: clampPosY(newPosY, newZoom)
          }
        })
      } else {
        // Drag the canvas
        // - swipe right = +deltaX
        // - swipe down = +deltaY
        // - to move down, swipe down. Thats why its a + (plus)
        const newX = init.x + e.deltaX
        const newY = init.y + e.deltaY
        setState({ ...state, camera: { x: clampPosX(newX, state.zoom), y: clampPosY(newY, state.zoom) } })
      }
    }
    window.addEventListener('wheel', ev, { passive: false })
    return () => {
      window.removeEventListener('wheel', ev)
    }
  }, [state])

  // Handle Mouse Move
  useEffect(() => {
    const debugRefMousePos = document.getElementById('mousepos')!
    const debugRefMousePosLocal = document.getElementById('localmousepos')!

    const ev = (e: MouseEvent) => {
      debugRefMousePos.innerText = `mouse: ${ e.clientX }, ${ e.clientY }`
      // const localMousePos = getMouseLocalPos(e)
      const localMousePos = {
        x: (e.clientX + getPos().x) / getZoom(),
        y: (e.clientY + getPos().y) / getZoom()
      }
      debugRefMousePosLocal.innerText = `local mouse: ${ localMousePos.x }, ${ localMousePos.y }`
    }
    window.addEventListener('mousemove', ev)
    return () => {
      window.removeEventListener('mousemove', ev)
    }
  }, [state])

  // Handle Right Click
  useEffect(() => {
    const ev = (e: MouseEvent) => {
      e.preventDefault()
      setState({
        ...state,
        contextMenu: {
          open: true,
          x: e.clientX,
          y: e.clientY
        }
      })

      // Handle click outside of context menu to close it
      const onClick = (e: MouseEvent) => {
        if (!state.contextMenu.open) {
          window.removeEventListener('click', onClick)
          return
        }
        if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
          setState({ ...state, contextMenu: { open: false, x: 0, y: 0 } })
          window.removeEventListener('click', onClick)
        }

      }
      window.addEventListener('click', onClick)
    }
    window.addEventListener('contextmenu', ev)
    return () => {
      window.removeEventListener('contextmenu', ev)
    }
  }, [state])

  // New Object Handler
  const onCreateNewObject = () => {
    // Get world-space position of the context menu
    const pos = {
      x: (state.contextMenu.x + state.camera.x) / state.zoom,
      y: (state.contextMenu.y + state.camera.y) / state.zoom
    }

    setState({
      ...state,
      objects: [
        ...state.objects,
        {
          id: crypto.randomUUID(),
          name: `Object ${ state.objects.length + 1 }`,
          pos: { x: pos.x, y: pos.y },
          size: { width: 50, height: 50 },
          color: '#fff'
        }
      ],
      contextMenu: { open: false, x: 0, y: 0 }
    })
  }

  // Selected Object Handler
  const onObjectClick = (id: string) => {

  }

  return (
    <div ref={canvasContainerRef} className="canvas-container w-screen h-screen overflow-clip relative">
      {/* Debug Layer */}
      <div className="fixed top-2 left-2 z-[9999] font-mono whitespace-pre">
        x: {state.camera.x.toFixed(5).padStart(10)}, y: {state.camera.y.toFixed(5).padStart(10)}<br />
        {state.zoom.toFixed(4)}<br />
        <br />
        <span id="mousepos"></span><br />
        <span id="localmousepos"></span>
      </div>
      {/* Context Menu */}
      <div className="bg-neutral-800 absolute z-10 rounded-sm overflow-hidden" ref={contextMenuRef}
        style={{
          left: state.contextMenu.x + 'px',
          top: state.contextMenu.y + 'px',
          display: state.contextMenu.open ? 'block' : 'none',
        }}
      >
        <button className="hover:bg-white/5 p-2 px-3 cursor-pointer"
          onClick={onCreateNewObject}
        >+ Create new Object</button>
      </div>

      {/* Canvas View */}
      <div ref={canvasRef} className="canvas bg-neutral-400 bg-[url('/image.png')] relative"
        style={{
          width: `${ CANVAS_WIDTH }px`,
          height: `${ CANVAS_HEIGHT }px`,
          // Pos needs to be negative because it needs to go the opposite of the camera.
          transform: `translate(${ -state.camera.x }px, ${ -state.camera.y }px) scale(${ state.zoom }) `,
          transformOrigin: '0 0',
        }}
      >
        {/* Objects */}
        {
          state.objects.map((obj) => (
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