"use client"

import { getNewTransformAroundPoint } from "@/feature/zoomAroundPoint"
import { attachListener, attachWindowListener } from "@/lib/attachListener"
import { isMiddleClick, isMiddleClickUp } from "@/lib/isMouse"
import { Point } from "@/lib/point"
import { useBearEffect } from "@/lib/useBearEffect"
import { useDivRef } from "@/lib/useDivRef"
import { useRefState } from "@/lib/useSkate"
import { useRef, useState } from "react"

export function App2() {

  const canvasContainerElementRef = useDivRef()
  const canvasElementRef = useDivRef()

  const [updateCamera, camera] = useRefState(
    { pos: new Point(0, 0), zoom: 1, },
    state => canvasElementRef.current!.style.transform = `translate(${ state.pos.x }px, ${ state.pos.y }px) scale(${ state.zoom })`
  )

  useBearEffect(effect => {
    const container = canvasContainerElementRef.current!

    effect.add = attachListener(container, 'wheel', e => {
      e.preventDefault()
      if (e.metaKey || e.ctrlKey) {
        // Zooming with trackpad
        const newCameraState = getNewTransformAroundPoint(camera.zoom, e.deltaY, new Point(e.clientX, e.clientY), camera.pos)
        camera.zoom = newCameraState.zoom
        camera.pos = newCameraState.pos
      } else {
        // Panning with trackpad
        camera.pos.x += -e.deltaX
        camera.pos.y += -e.deltaY
      }
      updateCamera()
    })

    effect.add = attachListener(container, 'pointerdown', e => {
      e.preventDefault()
      container.setPointerCapture(e.pointerId)
      if (isMiddleClick(e)) {
        const imouse = new Point(e.clientX, e.clientY)
        const icamera = camera.pos.clone()

        const unmountPointerMove = attachWindowListener('pointermove',
          (f, removeEvent) => {
            f.preventDefault()
            if (f.buttons === 0) return removeEvent()
            camera.pos.x = icamera.x - (imouse.x - f.clientX)
            camera.pos.y = icamera.y - (imouse.y - f.clientY)
            updateCamera()
          }
        )

        attachWindowListener('pointerup', () => unmountPointerMove(), { once: true })
      }
    })

  }, [])

  const [count, setCount] = useState(0)

  return <div
    ref={canvasContainerElementRef}
    id="canvas-container"
    className="overflow-hidden relative bg-black "
  >
    <div
      ref={canvasElementRef}
      id="canvas"
      className="crisp-edges rounded-md outline outline-white/10 bg-white/5
      relative pointer-events-none w-screen h-screen origin-top-left"
    >
      <div //Sample Object
        className="size-20 absolute top-20 left-20 bg-white rounded-md
        pointer-events-auto"
        onClick={() => setCount(count + 1)}
      >
        {count}
      </div>
    </div>
  </div>
}

