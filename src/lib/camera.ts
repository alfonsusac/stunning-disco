import { getNewTransformAroundPoint } from "@/feature/zoomAroundPoint"
import { Point } from "./point"

export class Camera {

  pos = new Point(0, 0)
  zoom = 1
  #onChange

  constructor(
    onChange: () => void = (() => { }),
  ) {
    this.#onChange = onChange
  }

  zoomAroundPoint(deltaY: number, x: number, y: number) {
    const newTransform = getNewTransformAroundPoint(this.zoom, deltaY, new Point(x, y), this.pos)
    this.zoom = newTransform.zoom
    this.pos = newTransform.pos
    this.#onChange()
  }

  pan(dx: number, dy: number) {
    this.pos = this.pos.add(new Point(dx, dy))
    this.#onChange()
  }

  setPos(x: number, y: number) {
    this.pos = new Point(x, y)
    this.#onChange()
  }

  toCanvas(point: Point): Point
  toCanvas(x: number, y: number): Point
  toCanvas(p1: any, p2?: any): any {
    if (typeof p1 === 'number' && typeof p2 === 'number') {
      return new Point(p1, p2).subtract(this.pos).scale(1 / this.zoom)
    }
    if (p1 instanceof Point) {
      return this.toCanvas(p1.x, p1.y)
    }
  }

  toScreen(point: Point): Point
  toScreen(x: number, y: number): Point
  toScreen(p1: any, p2?: any): any {
    if (typeof p1 === 'number' && typeof p2 === 'number') {
      return new Point(p1, p2).scale(this.zoom).add(this.pos)
    }
    if (p1 instanceof Point) {
      return this.toScreen(p1.x, p1.y)
    }
  }
}