"use client"

import type { ContextMenuItem } from "@/feature/context-menu"
import type { CanvasObject } from "@/feature/object"
import { initiatePanning } from "@/feature/pan"
import { getNewTransformAroundPoint } from "@/feature/zoomAroundPoint"
import { attachListener, attachWindowListener } from "@/lib/attachListener"
import { Box } from "@/lib/box"
import { isMiddleClick } from "@/lib/isMouse"
import type { MouseEventPosition } from "@/lib/mouse-event"
import { Point } from "@/lib/point"
import { useBearEffect } from "@/lib/useBearEffect"
import { useDivRef } from "@/lib/useDivRef"
import { useReactiveRef } from "@/lib/useSkate"
import { ContextMenu } from "@/ui/context-menu-item"
import { createRef, useState, type ReactNode, type RefObject } from "react"

export function App2() {

  const canvasContainerElementRef = useDivRef()
  const canvasElementRef = useDivRef()

  // Camera state ------------------------------------------------------------------------------

  const [updateCamera, camera] = useReactiveRef(
    {
      pos: new Point(0, 0),
      zoom: 1,
      toCanvasSpace(x: number, y: number) { return new Point(x, y).subtract(this.pos).scale(1 / this.zoom) },
      toScreenSpace(x: number, y: number) { return new Point(x, y).scale(this.zoom).add(this.pos) },
      zoomAroundPoint(deltaY: number, x: number, y: number,) {
        const newTransform = getNewTransformAroundPoint(this.zoom, deltaY, new Point(x, y), this.pos)
        this.zoom = newTransform.zoom
        this.pos = newTransform.pos
        updateCamera()
      },
      pan(dx: number, dy: number) {
        this.pos = this.pos.add(new Point(dx, dy))
        updateCamera()
      }
    },
    // when updateCamera called, do this
    state => canvasElementRef.current!.style.transform = `translate(${ state.pos.x }px, ${ state.pos.y }px) scale(${ state.zoom })`
  )

  useBearEffect(effect => {
    const container = canvasContainerElementRef.current!

    effect.add = attachListener(container, 'wheel', e => {
      e.preventDefault()                                        // Required to prevent software zooming on macOS
      if (e.metaKey || e.ctrlKey)
        camera.zoomAroundPoint(e.deltaY, e.clientX, e.clientY)
      else camera.pan(-e.deltaX, -e.deltaY)
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


  // Context Menu ------------------------------------------------------------------------------

  const contextMenuOverlayElementRef = useDivRef()
  const contextMenuElementRef = useDivRef()

  const [contextMenuContent, setContextMenuContent] = useState<React.ReactNode>(null)
  const [updateContextMenu, contextMenu] = useReactiveRef(
    {
      visible: false,
      pos: null as Point | null,
      content: null as React.ReactNode | null,
      show: (e: MouseEventPosition, contents: ContextMenuItem[]) => {
        contextMenu.visible = true
        contextMenu.pos = new Point(e.clientX, e.clientY)
        contextMenu.content = contents.map(content => <ContextMenu.Item
          key={content.label}
          onClick={() => {
            content.action()
            contextMenu.hide()
          }}
        >{content.label}</ContextMenu.Item>)
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
      e.preventDefault()                                                  // Prevent default context menu
      const pos = camera.toCanvasSpace(e.clientX, e.clientY)
      contextMenu.show(e, [
        { label: 'New Object', action: () => objects.add(pos.x, pos.y, 50, 50) }
      ])
    })
    effect.add = attachListener(contextMenuOverlayElement, 'click', e => {
      if (e.target !== contextMenuOverlayElement) return                  // If clicked inside the context menu, do nothing
      contextMenu.hide()
    })
  }, [])

  // Objects ------------------------------------------------------------------------------

  const [renderedObjects, setRenderedObjects] = useState<ReactNode[]>([])
  const [updateObjects, objects] = useReactiveRef({
    list: [] as CanvasObject[],
    add: (x: number, y: number, w: number, h: number) => {
      const id = crypto.randomUUID()
      const ref = createRef<HTMLDivElement>()
      const box = new Box(x, y, w, h)
      const jsx = <div
        ref={ref}
        key={id}
        className="size-20 absolute bg-white text-black rounded-md
        pointer-events-auto"
        style={{
          top: `${ box.y }px`,
          left: `${ box.x }px`,
          width: `${ box.w }px`,
          height: `${ box.h }px`
        }}
        onContextMenu={e => contextMenu.show(e, [
          { label: 'Delete', action: () => objects.remove(id) }
        ])}
      >
      </div>
      objects.list.push({ id, box, ref, jsx })
      updateObjects()
    },
    remove: (id: string) => {
      const index = objects.list.findIndex(obj => obj.id === id)
      if (index !== -1) {
        objects.list.splice(index, 1)
        updateObjects()
      }
    }
  }, state => setRenderedObjects(state.list.map(obj => obj.jsx)))

  // Selected ------------------------------------------------------------------------------

  const [updateSelection, selection] = useReactiveRef({
    list: [] as string[],
  }, state => { })


  const [count, setCount] = useState(0)
  return <>

    <div id="context-menu-overlay"
      ref={contextMenuOverlayElementRef}
      className="absolute top-0 left-0 w-screen h-screen pointer-events-auto z-[1000] hidden"
      onWheel={e => e.stopPropagation()}
    >
      <div id="context-menu"
        ref={contextMenuElementRef}
        className="w-46  bg-neutral-800 text-white rounded-lg absolute top-0 left-0
        text-sm p-1.5 px-1.5 border border-white/3 border-t border-t-white/10
        pointer-events-auto"
      >
        {contextMenuContent}
      </div>
    </div>

    <div id="canvas-container"
      ref={canvasContainerElementRef}
      className="overflow-hidden relative bg-black"
    >
      <div id="canvas" ref={canvasElementRef}
        className="crisp-edges rounded-md outline outline-white/10 bg-white/5
        relative pointer-events-none w-screen h-screen origin-top-left"
      >
        {renderedObjects}
      </div>
    </div>
  </>

}

