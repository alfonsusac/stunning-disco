import { Point } from "./point"

export class Box {

  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number

  constructor(box: Box)
  constructor(p1: Point, p2: Point)
  constructor(x: number, y: number, width: number, height: number)
  constructor(
    a: number | Point | Box,
    b?: number | Point,
    c?: number,
    d?: number
  ) {
    if (typeof a === 'number') {
      this.x = a
      this.y = b as number
      this.width = c as number
      this.height = d as number
      return
    }
    if (a instanceof Point && b instanceof Point) {
      this.x = a.x
      this.y = a.y
      this.width = b.x - a.x
      this.height = b.y - a.y
      return
    }
    if (a instanceof Box) {
      this.x = a.x
      this.y = a.y
      this.width = a.width
      this.height = a.height
      return
    }
    throw new Error("Invalid arguments for Box constructor")
  }

  get w() {
    return this.width
  }
  get h() {
    return this.height
  }
  get left() {
    return this.x
  }
  get top() {
    return this.y
  }
  get right() {
    return this.x + this.width
  }
  get bottom() {
    return this.y + this.height
  }
}