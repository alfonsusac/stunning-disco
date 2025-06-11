export function addEventListener<K extends keyof HTMLElementEventMap>(
  ref: HTMLDivElement,
  type: K,
  listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  ref.addEventListener(type, listener, options);
  return () => {
    ref.removeEventListener(type, listener, options);
  };

}