import type { Box } from "@/lib/box"
import type { ReactNode, RefObject } from "react"

export type CanvasObject = {
  id: string,
  box: Box,
  ref: RefObject<HTMLDivElement | null>,
  jsx: ReactNode
}