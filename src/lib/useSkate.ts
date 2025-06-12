import { useRef } from "react"

export function useRefState<T>(
  defaultValue: T,
  onChange: (value: T) => void,
) {
  // Use useRef to hold the current value
  // Uses {val: T} to shorten .current access
  const value = useRef<T>(defaultValue)

  const update = (fn?: (old: T) => void) => {
    // Allow call onChange with the current value
    if (fn === undefined)
      return onChange(value.current)
    // Don't update directly to value.current
    fn(value.current)
    onChange(value.current)
  }

  return [update, value.current] as const
}