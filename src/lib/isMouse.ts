export function isMiddleClick(event: MouseEvent): boolean {
  return (event.buttons & 4) !== 0
}

export function isMiddleClickUp(event: MouseEvent): boolean {
  return (event.buttons & 4) === 0
}