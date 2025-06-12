import { useRef } from "react"

export function useDivRef<T extends HTMLDivElement>() {
  return useRef<T>(null)
}