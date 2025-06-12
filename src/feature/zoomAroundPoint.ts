import { Point } from "@/lib/point"
import { getNewZoom } from "./zoom"

export function offsetCanvasPosAfterZoomAroundPoint(
  currZoom: number,
  newZoom: number,
  point: Point,
  // Canvas position relative to the viewport
  canvas: Point
) {

  // Calculate new position based on zoom around the cursor
  // - Note: its easier to think using vector math arrows. 
  const oldWorldPosUnderCursorX = (point.x - canvas.x) / currZoom
  const oldWorldPosUnderCursorY = (point.y - canvas.y) / currZoom
  // x: 200
  //  ________________________________________________
  // |                 |===========^==================
  // -----------------------------> point
  // ----------------->  canvas
  //                   -----------> point-canvas = worldPosUnderCursor (no direction reverse needed therefore a "+" sign is used)
  // Explanation:
  // - point.x is the mouse position from viewport top left
  // - - canvas.x gets the new relative position of the mouse with the topLeft of canvas
  // - / oldZoom converts the screen position to world position
  // - as screen zoom in -> oldZoom = 0.5 -> position is 2x bigger
  // - as screen zoom out -> oldZoom = 2 -> position is 0.5x smaller


  const oldScreenLocalCursorX = oldWorldPosUnderCursorX * currZoom + canvas.x
  const oldScreenLocalCursorY = oldWorldPosUnderCursorY * currZoom + canvas.y
  // Explanation:
  // - we want to see how much shift happens to the cursor on the screen when zoom is applied.
  // - worldPosUnderCursor needs to be converted back to screen-space
  // - the principle of zooming is the same but opposite
  // - worldspace is zommed out -> position is but still as big -> zoom is 0.5 -> reduced to match scale of screen
  // - worldspace is zoomed out -> position is bigger than they appear -> multiply < 1 to normalize
  // - worldspace is zoomed in -> position is smaller than they appear -> multiply > 1 to normalize
  // x: 200
  //  ________________________________________________
  // |                 |===========^==================
  //                   -----------> worldPosUnderCursor
  // ----------------->  canva
  // -----------------------------> worldPosUnderCursor + canvas = screenWorldPosUnderCursor (direction reverse needed therefore a "-" sign is used)
  // Moreover:
  // - formula is (point * zoom + pan) because of 'translate(x, y) scale(z)' order.
  // - this gives us the position of the cursor on the screen before zooming. Which is basically just point.x.

  const newScreenLocalCursorX = oldWorldPosUnderCursorX * newZoom + canvas.x
  const newScreenLocalCursorY = oldWorldPosUnderCursorY * newZoom + canvas.y
  // Explanation:
  // - wordlPosUnderCursor is the same as above, but now we apply new zoom to it.

  const offsetX = newScreenLocalCursorX - oldScreenLocalCursorX
  const offsetY = newScreenLocalCursorY - oldScreenLocalCursorY
  // x: -200 | ^ is old, % is new | newZoom > oldZoom (-deltaY) (zoom in)
  //  ________________________________________________________
  // |                 |===========^======%===================
  // -----------------------------> +old
  // -------------------------------------> +new
  //                               -------> +offset = new - old
  const newPosX = canvas.x - offsetX
  const newPosY = canvas.y - offsetY
  // x: -200 | ^ is old, % is new | newZoom > oldZoom (-deltaY)
  //  ________________________________________________________
  // |                 |===========^======%===================
  // ------------------> canvas
  //                               ------> +offset
  // |            |================%==========================
  // <------------ -newPosX
  // Explanation:
  // - The idea is that we need the new cursor (%) to shift back to old cursor (^).
  // - This means moving the resulting canvas to the left.
  // - if canvas move to left, that means camera moves to right.
  // - Thats why second arrow vector is going to the right

  return new Point(newPosX, newPosY)
}


export function getNewTransformAroundPoint(
  currZoom: number,
  deltaY: number,
  point: Point,
  // Canvas position relative to the viewport
  canvas: Point
) {
  const newZoom = getNewZoom(currZoom, deltaY)
  const newPos = offsetCanvasPosAfterZoomAroundPoint(currZoom, newZoom, point, canvas)
  return {
    pos: newPos,
    zoom: newZoom,
  }
}