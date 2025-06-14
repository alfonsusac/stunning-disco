import { useEffect, type DependencyList } from "react"
import { Cleaner } from "./cleaner"
import { attachListener } from "./attachListener"

/**
 * A React hook that runs an effect with a Cleaner instance.
 * The effect can register cleanup functions that will be called when the component unmounts or when the dependencies change.
 * 
 * @param effect - A function that takes a Cleaner instance and can register cleanup functions.
 * @param deps - An optional array of dependencies that, when changed, will re-run the effect.
 * @returns void
 * 
 * @example
 * ```javascript
 * useBearEffect((effect) => {
 *   const interval = setInterval(() => {
 *     console.log('Running effect')
 *   }, 1000)
 *   effect.add = () => clearInterval(interval) // Register cleanup
 * }, [dependencies])
 * ```
 */
export function useBearEffect(
  effect: (effectInterface: Effect) => void,
  deps?: DependencyList
) {
  useEffect(() => {
    const cleaner = new Cleaner()
    const effectInterface = new Effect(cleaner)
    effect(effectInterface)
    return () => cleaner.clean()
  }, deps)
}

class Effect {
  constructor(private cleaner: Cleaner) { }
  set add(cleanup: () => void) {
    this.cleaner.add = cleanup
  }
}