import { useEffect } from "react"

export function useWindowEventListenerEffect<
  K extends keyof WindowEventMap
>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void {

  useEffect(() => {
    return windowEventListenerEffect(type, listener, options)
  }, [])
}

export function windowEventListenerEffect<
  K extends keyof WindowEventMap
>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  window.addEventListener(type, listener, options)
  return () => {
    window.removeEventListener(type, listener, options)
  }
}