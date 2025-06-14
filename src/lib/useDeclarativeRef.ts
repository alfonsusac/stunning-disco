/**

const [ createSelectionRef ] = createDeclarativeRef<HTMLDivElement>()(
  // Always active when update() is called even at initial.
  (ref, x: number, y: number, w: number, h: number) => ({
    ref.current!.style.top = `${ y }px`
    ref.current!.style.left = `${ x }px`
    ref.current!.style.width = `${ w }px`
    ref.current!.style.height = `${ h }px`
  })
  
  // Other exposed methods (later)
)
 */

import { createRef, useRef } from "react"


export function createDeclarativeRef<T extends HTMLElement>() {
  return function <U extends any[]>(
    state: (ref: React.RefObject<T | null>, ...params: U) => void,
  ) {
    return function (...params: U) {
      const ref = createRef<T>()
      const callback = (node: T | null) => {
        ref.current = node
        if (!node) return
        // Call the initial state setup with the ref
        state(ref, ...params)
      }
      return {
        callback,
        update: () => {
          state(ref, ...params)
        }
      }
    }
  }
}