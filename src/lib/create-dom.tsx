import { createElement, createRef, type ReactNode, type RefObject } from "react"
/**
 * A function that imperatively creates a DOM element with a ref and optional methods.
 * - returns the ref, the jsx, and callable methods associated with the element.
 * - is a builder pattern: define HTML type -> define jsx + props -> call with props  
 * @param jsx 
 * @returns 
 */
export function createDomHandle<
  T extends HTMLElement,
>() {
  const ref = createRef<T | null>()
  return <
    M extends { [key: string]: (...args: any[]) => void },
    Props extends any[]
  >(
    jsx: (ref: RefObject<T | null>, ...props: Props) => ReactNode,
    methods?: (ref: RefObject<T | null>) => M,
  ) => {
    const availableMethods = methods ? methods(ref) : ({} as M)
    return [(...props: Props) => {
      return ({
        ref,
        jsx: jsx(ref, ...props),
        ...availableMethods,
      }) as DomHandle<
        T,
        // So that methods return can be inferred from M while also allowing methods prop to be optional.
        { [key: string]: (...args: any[]) => void } extends M ? {} : M
      >
    }]
  }
}

export type DomHandle<
  T extends HTMLElement,
  M extends { [key: string]: (...args: any[]) => void }
> = {
  ref: RefObject<T | null>
  jsx: ReactNode
} & M



// // Usage:
// const element = createDomHandle<HTMLDivElement>(
//   ref => <div ref={ref} className="my-element" />
// )(
//   ref => ({
//     focus() {
//       if (ref.current) {
//         ref.current.focus()
//       }
//     },
//     backgroundColor(color: string) {
//       if (ref.current) {
//         ref.current.style.backgroundColor = color
//       }
//     }
//   })
// )

// element.backgroundColor('red')
// element.focus()
// element.ref
// element.jsx

// export function useDomHandleBlueprint<
//   T extends HTMLElement,
// >(
// ) {

//   return <
//     M extends { [key: string]: (...args: any[]) => void },
//     Props extends { [key: string]: any } = {}
//   >(
//     jsx: (ref: RefObject<T | null>, props: Props) => ReactNode,
//     methods?: (ref: RefObject<T | null>) => M,
//   ) => {


//     return [() => createDomHandle<T>(jsx)(methods) as DomHandle<
//       T,
//       // So that methods return can be inferred from M while also allowing methods prop to be optional.
//       { [key: string]: (...args: any[]) => void } extends M ? {} : M
//     >]
//   }
// }

/**

const selectionBox = createComponent(
  
)



*/