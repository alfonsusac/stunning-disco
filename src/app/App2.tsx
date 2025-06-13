"use client"

import { getTrackpadPanNewPosition, initiatePanning } from "@/feature/pan"
import { getNewTransformAroundPoint } from "@/feature/zoomAroundPoint"
import { attachListener, attachWindowListener } from "@/lib/attachListener"
import { isMiddleClick } from "@/lib/isMouse"
import { Point } from "@/lib/point"
import { useBearEffect } from "@/lib/useBearEffect"
import { useDivRef } from "@/lib/useDivRef"
import { useReactiveRef } from "@/lib/useSkate"
import { useState } from "react"

export function App2() {

  const canvasContainerElementRef = useDivRef()
  const canvasElementRef = useDivRef()

  // Camera state

  const [updateCamera, camera] = useReactiveRef(
    { pos: new Point(0, 0), zoom: 1, },
    state => canvasElementRef.current!.style.transform = `translate(${ state.pos.x }px, ${ state.pos.y }px) scale(${ state.zoom })`
  )

  useBearEffect(effect => {
    const container = canvasContainerElementRef.current!

    effect.add = attachListener(container, 'wheel', e => {
      e.preventDefault()                                        // Required to prevent software zooming on macOS
      if (e.metaKey || e.ctrlKey) {                             // Zooming with trackpad
        const newCameraState = getNewTransformAroundPoint(camera.zoom, e.deltaY, new Point(e.clientX, e.clientY), camera.pos)
        camera.zoom = newCameraState.zoom
        camera.pos = newCameraState.pos
      } else
        camera.pos = getTrackpadPanNewPosition(camera.pos, e)
      updateCamera()
    })

    effect.add = attachListener(container, 'pointerdown', e => {
      if (isMiddleClick(e)) {
        const getNewCameraPos = initiatePanning(e, camera.pos)
        const stopDragging = attachWindowListener('pointermove', (f, removeEvent) => {
          f.preventDefault()
          if (f.buttons === 0) return removeEvent()           // Required to stop the event when pointerup happens outside the viewport. - https://stackoverflow.com/questions/68175350/detecting-middle-button-mouseup-outside-the-window-on-chrome-mac-os
          camera.pos = getNewCameraPos(f)
          updateCamera()
        })
        attachWindowListener('pointerup', stopDragging, { once: true })
      }
    })

  }, [])


  // Context Menu

  const contextMenuOverlayElementRef = useDivRef()
  const contextMenuElementRef = useDivRef()

  const [contextMenuContent, setContextMenuContent] = useState<React.ReactNode>(null)
  const [updateContextMenu, contextMenu] = useReactiveRef(
    {
      visible: false,
      pos: null as Point | null,
      content: null as React.ReactNode | null,
      show: (pos: Point, content: React.ReactNode | null) => {
        contextMenu.visible = true
        contextMenu.pos = pos
        contextMenu.content = content
        updateContextMenu()
      },
      hide: () => {
        contextMenu.visible = false
        contextMenu.pos = null
        contextMenu.content = null
        updateContextMenu()
      }
    },
    state => {
      contextMenuOverlayElementRef.current!.style.display = state.visible ? 'block' : 'none'
      contextMenuElementRef.current!.style.top = state.pos ? `${ state.pos.y }px` : '0'
      contextMenuElementRef.current!.style.left = state.pos ? `${ state.pos.x }px` : '0'
      setContextMenuContent(state.content)
    }
  )

  useBearEffect(effect => {
    const container = canvasContainerElementRef.current!
    const contextMenuOverlayElement = contextMenuOverlayElementRef.current!
    effect.add = attachListener(container, 'contextmenu', e => {
      e.preventDefault() // Prevent default context menu
      contextMenu.show(
        new Point(e.clientX, e.clientY),
        <>
          <button className="p-1 px-2 hover:bg-blue-500/50 rounded-sm w-full flex text-start">New Object</button>
        </>
      )
    })
    effect.add = attachListener(contextMenuOverlayElement, 'click', e => {
      e.stopPropagation() // Prevent click from propagating to the window
      contextMenu.hide()
    })
  }, [])





  const [count, setCount] = useState(0)
  return <>

    <div
      ref={contextMenuOverlayElementRef}
      id="context-menu-overlay"
      className="absolute top-0 left-0 w-screen h-screen pointer-events-auto z-[1000] hidden"
      onWheel={e => e.stopPropagation()}
    >
      <div
        ref={contextMenuElementRef}
        id="context-menu"
        className="w-46  bg-neutral-800 text-white rounded-lg absolute top-0 left-0
        text-sm p-1.5 px-1.5 border border-white/3 border-t border-t-white/10
        pointer-events-auto"
      >
        {contextMenuContent}
      </div>
    </div>

    <div
      ref={canvasContainerElementRef}
      id="canvas-container"
      className="overflow-hidden relative bg-black"
    >
      <div
        ref={canvasElementRef}
        id="canvas"
        className="crisp-edges rounded-md outline outline-white/10 bg-white/5
        relative pointer-events-none w-screen h-screen origin-top-left"
      >
        <div //Sample Object
          className="size-20 absolute top-20 left-20 bg-white text-black rounded-md
          pointer-events-auto"
          onClick={() => setCount(count + 1)}
        >
          {count}
        </div>
      </div>
    </div>
  </>

}

