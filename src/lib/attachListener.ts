export function attachListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  eventType: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: AddEventListenerOptions | boolean
): () => void {
  element.addEventListener(eventType, handler, options)
  return () => {
    element.removeEventListener(eventType, handler, options)
  }
}

export function attachWindowListener<K extends keyof WindowEventMap>(
  eventType: K,
  handler: (this: Window, ev: WindowEventMap[K], removeEventListener: () => void) => any,
  options?: AddEventListenerOptions | boolean
): () => void {

  // Unwrap the handler to ensure it has the correct context 
  //  to be passed to `removeEventListener`
  const unwrappedHandler = (ev: WindowEventMap[K]) => {
    handler.call(window, ev, removeEventListener)
  }

  // Define the function to remove the event listener
  //  to be passed to the consumer of the handler (when using this function)
  const removeEventListener = () => window.removeEventListener(eventType, unwrappedHandler, options)

  // Add the event listener to the window
  window.addEventListener(eventType, unwrappedHandler, options)

  // Return a cleanup function that removes the event listener
  return () => removeEventListener()

}