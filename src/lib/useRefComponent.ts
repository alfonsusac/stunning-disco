import { type RefObject, type ReactNode, useRef, createRef } from "react"

export function createRefComponent<T extends HTMLElement | null>() {
  return <
    M extends { [key: string]: (...args: any[]) => void } = {},
    P extends any[] = []
  >(
    cb: (ref: RefObject<T | null>, ...param: P) => ReactNode,
    methods: ((ref: RefObject<T | null>) => M) = () => ({} as M)
  ) => {
    const ref = createRef<T>()
    const jsx = (...param: P) => cb(ref, ...param)
    return { ref, jsx, ...methods(ref) } as const
  }
}
