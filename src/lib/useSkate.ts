import { useRef } from "react"

/**
 * Creates a reactive reference to a plain object, enabling both internal mutation
 * and external reactive side effects via a subscriber function.
 * 
 * The returned tuple consists of:
 * - an `update()` function that triggers the subscriber
 * - a mutable object (`state`) whose properties can be directly mutated
 * 
 * ## Usage
 * The `state` object is passed as-is (not cloned or proxied). You can define methods
 * directly on it or use a class instance, but ensure that all methods mutate only the
 * provided instance. Do not use prototype methods unless they are bound or called
 * directly on the object instance.
 * 
 * Reactive updates should be triggered manually by calling the `update` function,
 * typically within any mutating method.
 * 
 * @template T The type of the reactive object
 * 
 * @param {T} initialState - A plain object (POJO or class instance) whose fields will be used as reactive state.
 * @param {(state: T) => void} onChange - A function called whenever `update()` is invoked. Can be used to apply side effects like DOM updates.
 * 
 * @returns {[update: () => void, state: T]} A tuple containing:
 * - `update`: A function to trigger the `onChange` subscriber
 * - `state`: The same object passed in, to be mutated directly
 * 
 * @example
 * class Camera {
 *   constructor(private notifyUpdate: () => void) {}
 *   pos = new Point(0, 0)
 *   zoom = 1
 *   pan(dx, dy) {
 *     this.pos = this.pos.add(new Point(dx, dy))
 *     this.notifyUpdate()
 *   }
 * }
 * 
 * const [updateCamera, camera] = useReactiveRef(
 *   new Camera(() => updateCamera()),
 *   camera => {
 *     canvas.style.transform = `translate(${camera.pos.x}px, ${camera.pos.y}px) scale(${camera.zoom})`
 *   }
 * )
 */
export function useReactiveRef<T>(
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  // Use useRef to hold the current value
  // Uses {val: T} to shorten .current access
  const value = useRef<T>(defaultValue)

  const valueListener = new class {
    private listeners: ((value: T) => void)[] = []
    add(listener?: (value: T) => void) {
      if (listener === undefined) return () => { }
      this.listeners.push(listener)
      return () => this.removeListener(listener)
    }
    removeListener(listener: (value: T) => void) {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
    notify() {
      for (const listener of this.listeners)
        listener(value.current)
    }
  }


  const update = (fn?: (old: T) => void) => {
    // Allow call onChange with the current value
    if (fn === undefined)
      return onChange?.(value.current)
    // Don't update directly to value.current
    fn(value.current)
    onChange?.(value.current)
    valueListener.notify()
  }

  return [update, value.current, valueListener] as const
}