"use client"

import { useState, useRef, type RefObject, type ReactNode, type ComponentProps, type Ref, type ReactElement, type Component } from "react"

export default function Test2() {

  const [parentCount, setParentCount] = useState(0)
  const [doubled, setDoubled] = useState(false)
  const scale = doubled ? 2 : 1

  const counter = useRefComponent<HTMLDivElement>()(
    (ref, children?: ReactNode) =>
      <Counter ref={ref} scale={scale} className="border border-blue-500 p-4">{children}</Counter>,
    ref => ({
      changeBackground: (color: string) => ref.current!.style.backgroundColor = color
    })
  )

  return (
    <div className="[&_button]:border">
      <h1 className="text-3xl">Test2</h1>
      <p>This is a test page.</p>
      <p>Parent Count: {parentCount * scale}</p>
      <button onClick={() => setParentCount(parentCount + 1)}>Increment Parent Count</button>
      <button onClick={() => counter.ref.current!.style.backgroundColor = randomHSL()}>Change Background Color</button>
      <button onClick={() => counter.changeBackground(randomHSL())}>Change Background Color 2</button>
      <button onClick={() => setDoubled(!doubled)}>Toggle Doubled</button>
      <hr />
      {counter.jsx()}
    </div>
  )
}

function randomHSL() {
  return `hsl(${ Math.random() * 360 }, 50%, 50%)`
}


function useRefComponent<T extends HTMLElement | null>() {
  return <
    M extends { [key: string]: (...args: any[]) => void } = {},
    P extends any[] = []
  >(
    cb: (ref: RefObject<T | null>, ...param: P) => ReactNode,
    methods: ((ref: RefObject<T | null>) => M) = () => ({} as M)
  ) => {
    const ref = useRef<T>(null)
    const jsx = (...param: P) => cb(ref, ...param)
    return { ref, jsx, ...methods(ref) } as const
  }
}




function Counter({ scale, children, ...props }: ComponentProps<"div"> & { scale?: number }) {
  const [count, setCount] = useState(0)

  return (
    <div {...props}>
      <h2 className="bg-red-500 text-4xl">Counter</h2>
      <p>Count: {count * (scale ?? 1)}</p>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
      {children}
    </div>
  )
}