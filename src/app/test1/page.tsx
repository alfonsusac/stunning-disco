"use client"

import { useState, useRef, createRef, useMemo, useCallback } from "react"

function Comp3() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <h2 className="bg-red-500">Comp3</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
    </div>
  )
}

export default function Parent() {
  const [parentCount, setParentCount] = useState(0)
  const [doubled, setDoubled] = useState(false)

  // const count = useMemo(() => (() => {
  //   const ref = createRef<HTMLDivElement | null>()
  //   const element = function InnerCount(props: { doubled: boolean }) {
  //     const { doubled } = props
  //     const [count, setCount] = useState(0)
  //     return <div ref={ref}>
  //       <h2 className="text-3xl">Count Component</h2>
  //       <p>Count: {doubled ? count * 2 : count}</p>
  //       <button onClick={() => setCount(count + 1)}>Increment Count</button><br />
  //       <hr />
  //       {count > 5 && <Comp3 />}
  //     </div>
  //   }
  //   return {
  //     element,
  //     ref,
  //   }
  // })(), [])

  // const Count = useRef(
  //   (props: { doubled: boolean }) => {
  //     const { doubled } = props
  //     const [count, setCount] = useState(0)
  //     return <div
  //     // ref={ref}
  //     >
  //       <h2 className="">Count Component</h2>
  //       <p>Count: {doubled ? count * 2 : count}</p>
  //       <button onClick={() => setCount(count + 1)}>Increment Count</button><br />
  //     </div>
  //   }
  // ).current

  // const Count =
  //   (props: { doubled: boolean }) => {
  //     const { doubled } = props
  //     const [count, setCount] = useState(0)
  //     return <div
  //     // ref={ref}
  //     >
  //       <h2>Count Component</h2>
  //       <p>Count: {doubled ? count * 2 : count}</p>
  //       <button onClick={() => setCount(count + 1)}>Increment Count</button><br />
  //     </div>
  //   }

  // const Count = useCallback((props: { doubled: boolean}) => {
  //   const [count, setCount] = useState(0)
  //   return <div>
  //     <h2 className="text-3xl">Count Component</h2>
  //     <p>Count: {props.doubled ? count * 2 : count}</p>
  //     <button onClick={() => setCount(count + 1)}>Increment Count</button><br />
  //     <hr />
  //     {count > 5 && <Comp3 />}
  //   </div>
  // }, [])

  const count = createCount()


  return (
    <div style={{ padding: 20 }}>
      <h1>Parent Component</h1>
      <p>Parent count: {doubled ? parentCount * 2 : parentCount}</p>
      <p>Doubled: {doubled ? "true" : "false"}</p>
      <button onClick={() => setParentCount(parentCount + 1)}>Re-render Parent</button><br />
      <button onClick={() => setDoubled(!doubled)}>Enable Doubled</button><br />
      <button onClick={() => count.ref.current!.style.backgroundColor = `hsla(${ Math.random() * 360 } 25% 25%)`}>Randomize Color</button>
      <hr />
      <count.element doubled={doubled} />
      {/* <Count doubled={doubled} /> */}
    </div>
  )
}

function createCount() {
  const ref = createRef<HTMLDivElement | null>()
  const comp = function Count(props: { doubled: boolean }) {
    const [count, setCount] = useState(0)
    return <div ref={ref}>
      <h2 className="text-3xl">Count Component</h2>
      <p>Count: {props.doubled ? count * 2 : count}</p>
      <button onClick={() => setCount(count + 1)}>Increment Count</button><br />
      <hr />
      {count > 5 && <Comp3 />}
    </div>
  }
  return {
    element: comp,
    ref: ref
  }
}

function Count(props: { doubled: boolean }) {
  const [count, setCount] = useState(0)
  return <div>
    <h2 className="text-4xl">Count Component</h2>
    <p>Count: {props.doubled ? count * 2 : count}</p>
    <button onClick={() => setCount(count + 1)}>Increment Count</button><br />
    <hr />
    {count > 5 && <Comp3 />}
  </div>
}

/**

Explanation:

Exploration on how to create "unified" component that is rich in feature, if 
creating "factory" function that creates component with additional feature like : 
- imperative handling
- context
is even possible.

Result:
 > The createCount() function works. But it breaks HMR.

Notes:
- useMemo and useRef behaves similarly in this case. It is up to further exploration to see which one fits better.
- Do not store JSX in useMemo since it will just "capture" snapshot of resulting component.
- Do not "evaluate" the component in the render() function (before return). 
   Any changes to parent state will cause the children component to re-evaluate.
- Thats why the createCount() function is called outside of the component render function.
   Or called inside the useRef to maintain stable reference to the component.
- Improves imperaetive control but breaks HMR.

 */